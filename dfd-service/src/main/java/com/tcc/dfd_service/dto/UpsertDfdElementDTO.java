package com.tcc.dfd_service.dto;

import com.tcc.dfd_service.enums.DfdElementType;
import java.math.BigDecimal;

public record UpsertDfdElementDTO(
        Long id,
        String name,
        DfdElementType type,
        BigDecimal xValue,
        BigDecimal yValue,
        BigDecimal width,
        BigDecimal height,
        String uuid
) {
}