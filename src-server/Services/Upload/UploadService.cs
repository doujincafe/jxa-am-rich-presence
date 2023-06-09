namespace src_server.Services.Upload;

public class UploadService : IUploadService
{
    private readonly string _storage;

    public UploadService()
    {
        var home = Environment.GetFolderPath(
            Environment.SpecialFolder.UserProfile, Environment.SpecialFolderOption.None);

        _storage = Path.Combine(home, ".jxa-upload-server/images");
        if (!Directory.Exists(_storage))
        {
            Directory.CreateDirectory(_storage);
        }
    }

    public async Task StoreImage(string id, Stream file)
    {
        var imagePath = Path.Combine(_storage, id);
        if (File.Exists(imagePath))
        {
            File.Delete(imagePath);
        }

        await using var stream = File.OpenWrite(imagePath);
        stream.Position = 0;
        await file.CopyToAsync(stream);
    }

    public string? FetchImage(string id)
    {
        var imagePath = Path.Combine(_storage, id);
        return !File.Exists(imagePath) ? null : imagePath;
    }
}
