using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Model.Enums;

namespace ThreatModelDfdService.Model.Entity;

public class DfdElement : BaseEntity
{
    public string Name { get; set; }
    public decimal XValue { get; set; }
    public decimal YValue { get; set; }
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public DfdElementType Type { get; set; }
    public long DfdId { get; set; }
    public string UuidIdentifier { get; set; }

    public DfdElement()
    {
    }

    public DfdElement(CreateDfdElementDTO dto)
    {
        this.Name = dto.ElementName;
        this.Type = dto.Type;
        this.XValue = dto.PositionX;
        this.YValue = dto.PositionY;
        this.Width = dto.Width;
        this.Height = dto.Height;
        this.UuidIdentifier = dto.Uuid;
    }
}
