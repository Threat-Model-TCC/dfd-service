using Microsoft.EntityFrameworkCore;
using ThreatModelDfdService.Model.Context.Configurations;
using ThreatModelDfdService.Model.Entity;

namespace ThreatModelDfdService.Model.Context;

public class MSSQLContext : DbContext
{
    public MSSQLContext(DbContextOptions<MSSQLContext> options) : base(options)
    {
        
    }

    public DbSet<DfdElement> DfdElements { get; set; }
    public DbSet<Actor> Actors { get; set; }
    public DbSet<Process> Processes { get; set; }
    public DbSet<DataStore> DataStores { get; set; }
    public DbSet<Dfd> Dfds { get; set; }
    public DbSet<Project> Projects { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MSSQLContext).Assembly);
    }
}
