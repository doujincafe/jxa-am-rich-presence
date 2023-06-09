using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using src_server.Utilities;

namespace src_server.Authentication.Service;

public class AuthenticationService : IAuthenticationService
{
    private readonly CredentialConfiguration _credential;
    private readonly JwtSettings _jwtSettings;

    public AuthenticationService(CredentialConfiguration credential, JwtSettings jwtSettings)
    {
        _credential = credential;
        _jwtSettings = jwtSettings;
    }

    public string? Login(string username, string password)
    {
        var usernameHash = ComputeHash(username);
        var passwordHash = ComputeHash(password);

        var configuredUsername = Converters.FromHexadecimalToByteArray(_credential.Username);
        var configuredPassword = Converters.FromHexadecimalToByteArray(_credential.PasswordHash);

        if (!ByteArraysEqual(usernameHash, configuredUsername) || !ByteArraysEqual(passwordHash, configuredPassword))
        {
            return null;
        }

        return GenerateTokenForUser();
    }

    private string GenerateTokenForUser()
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            }),
            Expires = DateTime.UtcNow.Add(_jwtSettings.Lifetime),
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private bool ByteArraysEqual(ReadOnlySpan<byte> a1, ReadOnlySpan<byte> a2)
    {
        return a1.SequenceEqual(a2);
    }

    private byte[] ComputeHash(string data)
    {
        return SHA256.HashData(Encoding.UTF8.GetBytes(data));
    }
}
