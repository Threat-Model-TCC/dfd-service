using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThreatModelDfdService.Model.Entity;

namespace ThreatModelDfdService.Model.Context.Configurations;

public class DfdConfiguration : IEntityTypeConfiguration<Dfd>
{
    public void Configure(EntityTypeBuilder<Dfd> builder)
    {
        builder.ToTable("dfds");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(d => d.LevelNumber).HasColumnName("level_number");
        builder.Property(d => d.DfdParentId).HasColumnName("dfd_parent_id");
        builder.Property(d => d.ProjectId).HasColumnName("project_id");
    }
}
