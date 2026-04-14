namespace ThreatModelDfdService.Data.DTO;

public record FullDfdResponseDTO(
    List<DfdElementResponseDTO> Elements,
    List<DataFlowResponseDTO> Flows
);
