using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using dotnetapp.Models;

namespace dotnetapp.Services
{
    public class GeminiRequestService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GeminiRequestService> _logger;
        private readonly WebsiteContext _websiteContext;

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        private const string Model = "gemini-2.5-flash";
        private const string BaseUrl = "https://generativelanguage.googleapis.com";

        public GeminiRequestService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<GeminiRequestService> logger,
            WebsiteContext websiteContext)
        {
            _httpClient = httpClient;
            _logger = logger;
            _websiteContext = websiteContext;
            _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;

            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.ParseAdd("application/json");
            if (_httpClient.Timeout == System.Threading.Timeout.InfiniteTimeSpan)
                _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        /// <summary>
        /// Sends a message to Gemini with AgroLink guardrails.
        /// </summary>
        public async Task<ChatResponse> SendMessageAsync(string userMessage, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                return new ChatResponse { Reply = "Error: API Key is missing. Check your configuration." };

            // 🚧 Server-side enforcement: immediately block off-topic questions
            if (!IsOnTopic(userMessage))
            {
                return new ChatResponse
                {
                    Reply = "I can only help with questions about AgroLink. Please ask about our platform!"
                };
            }

            var url = $"{BaseUrl}/v1beta/models/{Model}:generateContent?key={_apiKey}";

            // ✅ Include systemInstruction so the model follows AgroLink rules
            var payload = new
            {
                systemInstruction = new
                {
                    role = "system",
                    parts = new[] { new { text = _websiteContext.GetSystemPrompt() } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = userMessage } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.1,
                    topK = 40,
                    topP = 0.95,
                    maxOutputTokens = 512
                }
                // Optional: safetySettings
            };

            try
            {
                var json = JsonSerializer.Serialize(payload, JsonOptions);
                using var content = new StringContent(json, Encoding.UTF8, "application/json");

                using var response = await _httpClient.PostAsync(url, content, ct);
                var responseBody = await response.Content.ReadAsStringAsync(ct);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Gemini API Error: {Status} - {Body}", response.StatusCode, Truncate(responseBody, 1200));
                    var apiMsg = TryExtractApiError(responseBody);
                    return new ChatResponse
                    {
                        Reply = string.IsNullOrWhiteSpace(apiMsg)
                            ? "The AI service is currently unavailable. Please try again later."
                            : $"The AI service returned an error: {apiMsg}"
                    };
                }

                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                // Parse first candidate text safely
                if (root.TryGetProperty("candidates", out var candidatesEl) &&
                    candidatesEl.ValueKind == JsonValueKind.Array &&
                    candidatesEl.GetArrayLength() > 0)
                {
                    var first = candidatesEl[0];
                    if (first.TryGetProperty("content", out var contentEl) &&
                        contentEl.TryGetProperty("parts", out var partsEl) &&
                        partsEl.ValueKind == JsonValueKind.Array &&
                        partsEl.GetArrayLength() > 0)
                    {
                        var firstPart = partsEl[0];
                        if (firstPart.TryGetProperty("text", out var textEl))
                        {
                            var reply = textEl.GetString() ?? string.Empty;

                            // Output guard—if model drifts, enforce policy
                            if (!IsOnTopic(reply))
                            {
                                reply = "I can only help with questions about AgroLink. Please ask about our platform!";
                            }

                            return new ChatResponse { Reply = reply };
                        }
                    }
                }

                // If blocked or empty
                if (root.TryGetProperty("promptFeedback", out var pfEl) &&
                    pfEl.TryGetProperty("blockReason", out _))
                {
                    return new ChatResponse
                    {
                        Reply = "I can only help with questions about AgroLink. Please ask about our platform!"
                    };
                }

                _logger.LogWarning("Unexpected Gemini response format. Body: {Body}", Truncate(responseBody, 1200));
                return new ChatResponse { Reply = "AI returned an unexpected response format." };
            }
            catch (TaskCanceledException) when (ct.IsCancellationRequested)
            {
                return new ChatResponse { Reply = "The request was canceled. Please try again." };
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Gemini request timed out.");
                return new ChatResponse { Reply = "The AI service timed out. Please try again later." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gemini service crash.");
                return new ChatResponse { Reply = "Internal Error: An unexpected error occurred." };
            }
        }

        // ---------- Helpers ----------

        private static string? TryExtractApiError(string responseBody)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                if (doc.RootElement.TryGetProperty("error", out var err) &&
                    err.TryGetProperty("message", out var msg))
                {
                    return msg.GetString();
                }
            }
            catch { /* ignore */ }
            return null;
        }

        // Simple allowlist—expand with more AgroLink terms if needed
        private static bool IsOnTopic(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return false;
            var t = text.ToLowerInvariant();
            string[] keywords = {
                "agrolink","register","farmer","buyer","seller","crop","crops","produce",
                "order","shipping","delivery","payment","upi","net banking","credit","debit","cod",
                "refund","return","aadhaar","pan","local pickup","track my order","rate & review",
                "suggestion box","list products","add crop","price","filter","bulk","discount",
                "my orders","support","dispute","feedback","contact","policies"
            };
            return keywords.Any(k => t.Contains(k));
        }

        private static string Truncate(string s, int max)
            => string.IsNullOrEmpty(s) || s.Length <= max ? s : s.Substring(0, max) + "…";
    }
}