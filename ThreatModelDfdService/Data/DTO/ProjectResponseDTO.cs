namespace ThreatModelDfdService.Data.DTO;

public record ProjectResponseDTO(
    long Id,
    string Name,
    string Description,
    long ContextDiagramId,
    DateTime CreatedAt
);
