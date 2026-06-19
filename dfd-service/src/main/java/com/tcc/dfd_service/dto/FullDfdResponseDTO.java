package com.tcc.dfd_service.dto;

import java.util.List;

public record FullDfdResponseDTO(
        List<DfdElementResponseDTO> elements,
        List<DataFlowResponseDTO> flows
) {
}