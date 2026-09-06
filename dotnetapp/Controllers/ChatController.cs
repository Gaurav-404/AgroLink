using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using dotnetapp.Models;
using dotnetapp.Services;

namespace dotnetapp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ChatController : ControllerBase
    {
        private readonly GeminiRequestService _geminiService;

        public ChatController(GeminiRequestService geminiService)
        {
            _geminiService = geminiService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody] ChatRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { error = "Message cannot be empty." });

            if (request.Message.Length > 500)
                return BadRequest(new { error = "Message too long." });

            var response = await _geminiService.SendMessageAsync(request.Message);
            return Ok(response);
        }
    }
}
