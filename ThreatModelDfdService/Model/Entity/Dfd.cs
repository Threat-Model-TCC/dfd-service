namespace ThreatModelDfdService.Model.Entity;

public class Dfd : BaseEntity
{
    public int LevelNumber { get; set; }
    public long? DfdParentId { get; set; }
    public long ProjectId { get; set; }
}
