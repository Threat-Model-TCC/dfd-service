package com.tcc.dfd_service.dto;

import java.util.List;

public record PagedProjectResponseDTO(
        Integer current,
        Integer pages,
        List<ProjectResponseDTO> items
) {}
