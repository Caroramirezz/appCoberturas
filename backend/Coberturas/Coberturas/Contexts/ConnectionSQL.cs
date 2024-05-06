using Microsoft.EntityFrameworkCore;
using Coberturas.Models;
using Coberturas.Models.Trades;

namespace Coberturas.Contexts
{
  public class ConnectionSQL : DbContext
  {
    public ConnectionSQL(DbContextOptions<ConnectionSQL> options)
        : base(options) { }

    public DbSet<Usuario> usuarios { get; set; }

  }

}
