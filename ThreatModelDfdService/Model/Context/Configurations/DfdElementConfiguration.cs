using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThreatModelDfdService.Model.Entity;
using ThreatModelDfdService.Model.Enums;

namespace ThreatModelDfdService.Model.Context;

public class DfdElementConfiguration : IEntityTypeConfiguration<DfdElement>
{
    
    public void Configure(EntityTypeBuilder<DfdElement> builder)
    {
        builder.ToTable("dfd_elements").UseTptMappingStrategy();

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();

        builder.Property(e => e.Name).HasColumnName("name").HasMaxLength(100);
        builder.Property(e => e.XValue).HasColumnName("x_value").HasPrecision(10, 3);
        builder.Property(e => e.YValue).HasColumnName("y_value").HasPrecision(10, 3);
        builder.Property(e => e.Width).HasColumnName("width").HasPrecision(10, 3);
        builder.Property(e => e.Height).HasColumnName("height").HasPrecision(10, 3);
        builder.Property(e => e.Type).HasColumnName("type").HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.DfdId).HasColumnName("dfd_id");
        builder.Property(e => e.UuidIdentifier).HasColumnName("uuid_identifier");
    }
}
