namespace ThreatModelDfdService.Model.Entity;

public class DataFlow : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    
    public long? SourceElementId { get; set; }
    public virtual DfdElement SourceElement { get; set; }

    public long? TargetElementId { get; set; }
    public virtual DfdElement TargetElement { get; set; }

    public decimal SourcePosition { get; set; }
    public decimal TargetPosition { get; set; }


    public long DfdId { get; set; }
    public virtual Dfd Dfd { get; set; }
}