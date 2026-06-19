package com.tcc.dfd_service.dto;

import java.time.OffsetDateTime;

public record ProjectResponseDTO(
        Long id,
        String name,
        String description,
        Long contextDiagramId,
        OffsetDateTime createdAt
) {
}