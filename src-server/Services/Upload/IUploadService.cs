namespace src_server.Services.Upload;

public interface IUploadService
{
    Task StoreImage(string id, Stream file);
    string? FetchImage(string id);
}
