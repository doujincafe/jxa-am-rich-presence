using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using src_server.Authentication.Service;

namespace src_server.Authentication;

public static class AuthenticationInstaller
{
    public static void InstallAuthentication(this IServiceCollection collection, IConfiguration configuration)
    {
        var credentials = new CredentialConfiguration();
        configuration.Bind(nameof(CredentialConfiguration), credentials);

        collection.AddSingleton(credentials);

        var jwtSettings = new JwtSettings
        {
            Lifetime = TimeSpan.Parse("00:06:00"),
            Key = Generate()
        };

        collection.AddSingleton(jwtSettings);

        var tokenValidationParameter = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings.Key)),
            ValidateIssuer = false,
            ValidateAudience = false,
            RequireExpirationTime = true,
            ValidateLifetime = true
        };

        collection.AddSingleton(tokenValidationParameter);
        collection.AddAuthentication(x =>
        {
            x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(x =>
        {
            x.SaveToken = true;
            x.TokenValidationParameters = tokenValidationParameter;
        });

        collection.AddSingleton<IAuthenticationService, AuthenticationService>();
    }

    private static string Generate()
    {
        var builder = new StringBuilder(64);
        const char offset = 'A';
        const int letterOffset = 26;

        var random = new Random();
        for (var i = 0; i < 64; i++)
        {
            var @char = (char)random.Next(offset, offset + letterOffset);
            builder.Append(@char);
        }

        return builder.ToString();
    }
}
