using ThreatModelDfdService.Model.Enums;

namespace ThreatModelDfdService.Data.DTO;

public record DfdElementResponseDTO(
    long Id,
    string Name,
    DfdElementType Type,
    decimal XValue,
    decimal YValue,
    decimal Width,
    decimal Height,
    long? DfdChildId,
    string Uuid
);
