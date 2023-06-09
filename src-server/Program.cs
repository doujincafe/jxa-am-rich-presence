using FluentValidation;
using src_server.Authentication;
using src_server.DevelopmentSpecific;
using src_server.Repository;
using src_server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.InstallSwagger(builder.Configuration);
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.InstallSqlite();
builder.Services.InstallServices();
builder.Services.InstallAuthentication(builder.Configuration);

var swaggerConfig = new SwaggerOptions();
builder.Configuration.Bind(nameof(SwaggerOptions), swaggerConfig);

const string specificOrigins = "AllowAllOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: specificOrigins, policy =>
    {
        policy.WithOrigins("*")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors(specificOrigins);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(o =>
    {
        o.RouteTemplate = swaggerConfig.JsonRoute;
    });
    app.UseSwaggerUI(o =>
    {
        o.SwaggerEndpoint(swaggerConfig.UIEndpoint, swaggerConfig.Description);
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();
app.UseAuthentication();

app.MapControllers();

app.Run();
