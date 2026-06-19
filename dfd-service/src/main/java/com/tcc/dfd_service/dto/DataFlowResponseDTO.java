package com.tcc.dfd_service.dto;

import java.math.BigDecimal;

public record DataFlowResponseDTO(
        Long id,
        String name,
        String description,
        String sourceElementIdentifier,
        String targetElementIdentifier,
        BigDecimal sourcePosition,
        BigDecimal targetPosition
) {
}