package com.tcc.dfd_service.dto;

public record CreateDfdChildDTO(
        Long processParentId,
        Integer levelNumber
) {
}