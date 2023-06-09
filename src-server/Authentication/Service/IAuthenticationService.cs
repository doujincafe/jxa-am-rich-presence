namespace src_server.Authentication.Service;

public interface IAuthenticationService
{
    string? Login(string username, string password);
}

