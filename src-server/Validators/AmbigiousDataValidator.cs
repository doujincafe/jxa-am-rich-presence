using FluentValidation;
using src_server.Contracts.Requests;

namespace src_server.Validators;

public class AmbigiousDataValidator : AbstractValidator<AmbigiousData>
{
    public AmbigiousDataValidator()
    {
        RuleFor(x => x.U)
            .NotEmpty()
            .NotNull()
            .MinimumLength(15)
            .WithMessage("Invalid username");

        RuleFor(x => x.P)
            .NotEmpty()
            .NotNull()
            .MinimumLength(15)
            .WithMessage("Invalid password.");
    }
}
