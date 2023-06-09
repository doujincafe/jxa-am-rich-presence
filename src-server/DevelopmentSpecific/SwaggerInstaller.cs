using Microsoft.OpenApi.Models;

namespace src_server.DevelopmentSpecific;

public static class SwaggerInstaller
{
    public static void InstallSwagger(this IServiceCollection collection, IConfiguration configuration)
    {
        collection.AddSwaggerGen(x =>
        {
            x.SwaggerDoc("v1-jxa-am-beta", new OpenApiInfo
            {
                Title = "jxa-am server",
                Version = "v1-jxa-am-beta"
            });
            
            x.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "JWT Authorization Header using the Bearer Scheme",
                Type = SecuritySchemeType.ApiKey,
                In = ParameterLocation.Header
            });

            var securityRequirement = new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Id = "Bearer",
                            Type = ReferenceType.SecurityScheme
                        }
                    },
                    Array.Empty<string>()
                }
            };
            
            x.AddSecurityRequirement(securityRequirement);
        });
    }
}
