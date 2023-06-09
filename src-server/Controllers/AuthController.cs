using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using src_server.Authentication.Service;
using src_server.Contracts.Requests;
using src_server.Contracts.Responses;

namespace src_server.Controllers;

[Route("/api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _auth;
    private readonly IValidator<AmbigiousData> _validator;

    public AuthController(IAuthenticationService auth, IValidator<AmbigiousData> validator)
    {
        _auth = auth;
        _validator = validator;
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] AmbigiousData data)
    {
        var validation = await _validator.ValidateAsync(data);
        if (!validation.IsValid)
        {
            return Unauthorized(new GenericFailure
            {
                Errors = validation.Errors.Select(x => x.ErrorMessage).ToArray()
            });
        }

        var auth = _auth.Login(data.U, data.P);
        if (auth is null)
        {
            return Unauthorized(new GenericFailure
            {
                Errors = new[] { "Invalid username/password." }
            });
        }
        
        // Do something.
        return Ok(new AuthSucces
        {
            Success = true,
            Token = auth
        });
    }
}
