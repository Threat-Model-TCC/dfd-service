namespace ThreatModelDfdService.Data.DTO;

public record DataFlowResponseDTO(
    long Id,
    string Name,
    string Description,
    string SourceElementIdentifier,
    string TargetElementIdentifier,
    decimal SourcePosition,
    decimal TargetPosition
);
