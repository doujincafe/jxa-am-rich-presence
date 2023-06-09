namespace src_server.Contracts.Responses;

public class GenericFailure
{
    public string[] Errors { get; set; } = Array.Empty<string>();
}
