namespace src_server.Authentication;

public class JwtSettings
{
    public string Key { get; init; } = "";
    public TimeSpan Lifetime { get; init; } = TimeSpan.FromMinutes(6);
}
