using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using src_server.Contracts.Requests;
using src_server.Contracts.Responses;
using src_server.Services.Upload;

namespace src_server.Controllers;

[Route("/api/upload")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class UploaderController : ControllerBase
{
    private readonly IValidator<FetchObject> _idValidator;
    private readonly IUploadService _uploadService;

    public UploaderController(IValidator<FetchObject> idValidator, IUploadService uploadService)
    {
        _idValidator = idValidator;
        _uploadService = uploadService;
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage([FromForm] ImageUploadData data)
    {
        var validation = await _idValidator.ValidateAsync(new FetchObject
        {
            Id = data.Id
        });
        if (!validation.IsValid)
        {
            return BadRequest(new ValidationFailure
            {
                Errors = validation.Errors.Select(x => x.ErrorMessage)
            });
        }

        // Process data
        await _uploadService.StoreImage(data.Id, data.Image.OpenReadStream());

        return Ok(new GenericSuccess { Success = true });
    }
}
