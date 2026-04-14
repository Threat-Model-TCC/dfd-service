using ThreatModelDfdService.Model.Enums;

namespace ThreatModelDfdService.Data.DTO;

public record CreateDfdElementDTO(
    string ElementName,
    DfdElementType Type,
    decimal PositionX,
    decimal PositionY,
    decimal Width,
    decimal Height,
    string Uuid
);
