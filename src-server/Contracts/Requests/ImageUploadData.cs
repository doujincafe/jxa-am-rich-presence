namespace src_server.Contracts.Requests;

public class ImageUploadData
{
    public string Id { get; set; }
    public IFormFile Image { get; set; }
}
