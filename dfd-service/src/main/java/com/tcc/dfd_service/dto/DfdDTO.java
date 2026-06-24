package com.tcc.dfd_service.dto;

import java.util.List;

public record DfdDTO(
        Long id,
        Long dfdParentId,
        Integer levelNumber,
        List<DfdElementResponseDTO> elements,
        List<DataFlowResponseDTO> flows
) {
}