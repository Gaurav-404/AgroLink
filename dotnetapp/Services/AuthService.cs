using System;
using System.Text;
using System.Threading.Tasks;
using dotnetapp.Models;
using dotnetapp.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

using Microsoft.Extensions.Configuration;

namespace dotnetapp.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly string _jwtSecret;

        public AuthService(ApplicationDbContext context,IConfiguration configuration)
        {
            _context = context;
             _jwtSecret = configuration["Jwt:Secret"];
        }
        
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hashBytes = sha256.ComputeHash(bytes);
            var sb = new StringBuilder();
            foreach (var b in hashBytes)
                sb.Append(b.ToString("x2")); // lowercase hex, matches JS .toString(16)
            return sb.ToString();
        }

        public async Task<(int, string)> Registration(User model, string role)
        {
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
                return (1, "User already exists");

            // Hash the password before storing
            model.Password = HashPassword(model.Password);
            model.UserRole = role;

            _context.Users.Add(model);
            await _context.SaveChangesAsync();

            return (0, "Registration successful");
        }

        public async Task<(int, string)> Login(LoginModel model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
                return (1, "User not found");

            // Frontend already sends SHA-256 hash, so compare directly
            if (user.Password != model.Password)
                return (1, "Invalid credentials");

            var token = GenerateJwtToken(user);
            return (0, token);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(ClaimTypes.Role, user.UserRole),
                    new Claim("userId", user.UserId.ToString()),
                    new Claim("userName", user.Username)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
