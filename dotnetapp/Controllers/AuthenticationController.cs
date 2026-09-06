using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;

namespace dotnetapp.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthenticationController(IAuthService authService)
        {
            _authService = authService;
        }
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid login request");

            var (status, tokenOrMessage) = await _authService.Login(model);

            if (status == 0)
                return Ok(new { Token = tokenOrMessage });

            return Unauthorized(new { Message = tokenOrMessage });
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid registration request");

            var (status, message) = await _authService.Registration(model, model.UserRole);

            if (status == 0)
                return Ok(new { Message = message });

            return BadRequest(new { Message = message });
        }
    }
}
