using Microsoft.EntityFrameworkCore;

namespace src_server.Repository;

public static class InstallDatabase
{
    public static void InstallSqlite(this IServiceCollection collection)
    {
        var databasePath = Environment.GetFolderPath(
            Environment.SpecialFolder.UserProfile, Environment.SpecialFolderOption.None);
        if (string.IsNullOrEmpty(databasePath))
        {
            throw new DirectoryNotFoundException("User profile folder cannot be found.");
        }

        var dbHome = Path.Combine(databasePath, ".jxa-upload-server");
        if (!Directory.Exists(dbHome))
        {
            Directory.CreateDirectory(dbHome);
        }

        var dbPath = Path.Combine(dbHome, "database.db");

        collection.AddDbContext<RepositoryContext>(x =>
        {
            x.UseSqlite($"Data Source={dbPath}");
        });
    }
}
