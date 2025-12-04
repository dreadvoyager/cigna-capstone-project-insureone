using Microsoft.IdentityModel.Tokens;
using InsuranceAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InsuranceAPI.Services
{


    public class JwtTokenService
    {
        private readonly IConfiguration _configuration;


        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }


        public string CreateToken(ApplicationUser user, IList<string> roles)
        {
            var jwtConfig = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtConfig["Key"]!);


            var claims = new List<System.Security.Claims.Claim>
        {
        new System.Security.Claims.Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new System.Security.Claims.Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
        new System.Security.Claims.Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
        new System.Security.Claims.Claim("id", user.Id)
        };

            if (!string.IsNullOrWhiteSpace(user.FullName))
            {
                claims.Add(new System.Security.Claims.Claim("full_name", user.FullName));
                claims.Add(new System.Security.Claims.Claim(ClaimTypes.GivenName, user.FullName));
            }


            foreach (var role in roles)
            {
                claims.Add(new System.Security.Claims.Claim(ClaimTypes.Role, role));
            }


            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtConfig["ExpiresMinutes"]!));

            var token = new JwtSecurityToken(
            issuer: jwtConfig["Issuer"],
            audience: jwtConfig["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
            );


            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

}
