namespace src_server.Contracts.Responses;

public class ValidationFailure
{
    public IEnumerable<string> Errors { get; set; }
}
