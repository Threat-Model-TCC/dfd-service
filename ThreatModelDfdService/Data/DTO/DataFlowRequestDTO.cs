namespace ThreatModelDfdService.Data.DTO;

public record DataFlowRequestDTO(
    long? Id,
    string Name,
    string Description,
    string SourceElementIdentifier,
    string TargetElementIdentifier,
    decimal SourcePosition,
    decimal TargetPosition
);
