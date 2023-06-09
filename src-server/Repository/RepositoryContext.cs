using Microsoft.EntityFrameworkCore;
using src_server.Models;

namespace src_server.Repository;

public class RepositoryContext : DbContext
{
    public RepositoryContext(DbContextOptions<RepositoryContext> options)
        : base(options)
    { }

    public DbSet<TokenDetails>? Tokens { get; set; }
}
