namespace ThreatModelDfdService.Data.DTO;

public record UpsertAllDfdElementsDTO(
    List<UpsertDfdElementDTO> Elements,
    List<DataFlowRequestDTO> DataFlows
);
