using System.Text.RegularExpressions;
using FluentValidation;
using src_server.Contracts.Requests;

namespace src_server.Validators;

public class IdValidation : AbstractValidator<FetchObject>
{
    public IdValidation()
    {
        RuleFor(x => x.Id)
            .NotNull()
            .NotEmpty()
            .Matches(@"^([a-f0-9])+$", RegexOptions.IgnoreCase)
            .WithMessage("Invalid id.");
    }
}
