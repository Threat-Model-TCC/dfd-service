package com.tcc.dfd_service.dto;

import java.util.List;

public record SyncDfdElementsAndFlowsDTO(
        List<UpsertDfdElementDTO> elements,
        List<DataFlowRequestDTO> dataFlows
) {
}