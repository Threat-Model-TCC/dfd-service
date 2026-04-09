using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThreatModelDfdService.Model.Entity;

namespace ThreatModelDfdService.Model.Context.Configurations;

public class DataFlowConfiguration : IEntityTypeConfiguration<DataFlow>
{
    public void Configure(EntityTypeBuilder<DataFlow> builder)
    {
        builder.ToTable("data_flows");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name)
            .HasColumnName("name")
            .HasMaxLength(100);

        builder.Property(f => f.Description)
            .HasColumnName("description")
            .HasMaxLength(500);

        builder.Property(f => f.DfdId)
            .HasColumnName("dfd_id");

        builder.Property(f => f.SourceElementId)
            .HasColumnName("source_element_id");

        builder.Property(f => f.TargetElementId)
            .HasColumnName("target_element_id");

        builder.Property(f => f.SourcePosition)
            .HasColumnName("source_position");

        builder.Property(f => f.TargetPosition)
            .HasColumnName("target_position");

        // Relacionamento com Elemento de Origem
        builder.HasOne(f => f.SourceElement)
            .WithMany()
            .HasForeignKey(f => f.SourceElementId)
            .OnDelete(DeleteBehavior.SetNull);

        // Relacionamento com Elemento de Destino
        builder.HasOne(f => f.TargetElement)
            .WithMany()
            .HasForeignKey(f => f.TargetElementId)
            .OnDelete(DeleteBehavior.SetNull);

        // Relacionamento com o DFD (Pai)
        builder.HasOne(f => f.Dfd)
            .WithMany()
            .HasForeignKey(f => f.DfdId)
            .OnDelete(DeleteBehavior.Cascade); // Se o DFD sumir, o fluxo morre
    }
}