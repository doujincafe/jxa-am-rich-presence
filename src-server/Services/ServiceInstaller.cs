using src_server.Services.Upload;

namespace src_server.Services;

public static class ServiceInstaller
{
    public static void InstallServices(this IServiceCollection collection)
    {
        collection.AddScoped<IUploadService, UploadService>();
    }
}
