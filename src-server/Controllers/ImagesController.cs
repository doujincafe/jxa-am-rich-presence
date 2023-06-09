using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using src_server.Contracts.Requests;
using src_server.Contracts.Responses;
using src_server.Services.Upload;

namespace src_server.Controllers;

[Route("/api/image")]
public class ImagesController : ControllerBase
{
    private readonly IValidator<FetchObject> _idValidator;
    private readonly IUploadService _uploadService;
    
    public ImagesController(IValidator<FetchObject> idValidator, IUploadService uploadService)
    {
        _idValidator = idValidator;
        _uploadService = uploadService;
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetImage([FromRoute] string id)
    {
        var validation = await _idValidator.ValidateAsync(new FetchObject
        {
            Id = id
        });
        if (!validation.IsValid)
        {
            return BadRequest(new ValidationFailure
            {
                Errors = validation.Errors.Select(x => x.ErrorMessage)
            });
        }

        var find = _uploadService.FetchImage(id);
        if (find is null)
        {
            return NotFound(new GenericFailure
            {
                Errors = new[] { $"File not found. ID: {id}" }
            });
        }

        var stream = System.IO.File.OpenRead(find);
        stream.Position = 0;

        return File(stream, "image/jpeg");
    }
}
