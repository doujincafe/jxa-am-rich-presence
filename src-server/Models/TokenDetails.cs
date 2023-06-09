using System.ComponentModel.DataAnnotations;

namespace src_server.Models;

public class TokenDetails
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public DateTime Expires { get; set; }
    
    [Required]
    public DateTime Issued { get; set; }
}
