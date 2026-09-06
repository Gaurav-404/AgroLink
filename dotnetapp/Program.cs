using dotnetapp.Data;
using dotnetapp.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -------------------- Data --------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("con")));

// -------------------- App Services --------------------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IAgroChemicalService, AgroChemicalService>();
builder.Services.AddScoped<ICropService, CropService>();
builder.Services.AddScoped<IRequestService, RequestService>();

// Gemini + WebsiteContext
builder.Services.AddSingleton<WebsiteContext>();

// ✅ Register GeminiRequestService as a TYPED HTTP CLIENT (do this ONCE).
builder.Services.AddHttpClient<GeminiRequestService>();

builder.Services.AddControllers();

// -------------------- Swagger --------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token in the format: Bearer {your token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// -------------------- CORS --------------------
// TODO: In production, restrict to specific origins (e.g., https://your-frontend.com)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b =>
        b.AllowAnyOrigin()
         .AllowAnyMethod()
         .AllowAnyHeader());
});

// -------------------- AuthN / AuthZ --------------------
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException("Missing configuration: Jwt:Secret");
}
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // options.RequireHttpsMetadata = true; // enable in prod if behind HTTPS everywhere
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,

            // ✅ Validate token lifetime
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30), // tighten from default 5 minutes

            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserPolicy", policy => policy.RequireRole("User"));

    // ⚠️ Fallback policy forces auth for all endpoints not decorated otherwise.
    // Keep if you want everything protected by default.
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

var app = builder.Build();

// -------------------- Pipeline --------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(opt =>
    {
        // optional: show swagger at root for convenience
        opt.SwaggerEndpoint("/swagger/v1/swagger.json", "My API v1");
        opt.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();

// CORS should be early (before auth if you pass tokens via headers)
app.UseCors("AllowAll");

// Auth middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();