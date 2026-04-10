using ThreatModelDfdService.Model.Enums;

namespace ThreatModelDfdService.Data.DTO;

public record UpsertDfdElementDTO (
    long? Id,
    string Name,
    DfdElementType Type,
    decimal XValue,
    decimal YValue,
    decimal Width,
    decimal Height,
    string Uuid
);