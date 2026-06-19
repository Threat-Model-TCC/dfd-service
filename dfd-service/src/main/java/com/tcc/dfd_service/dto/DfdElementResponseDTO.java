package com.tcc.dfd_service.dto;

import com.tcc.dfd_service.enums.DfdElementType;
import java.math.BigDecimal;

public record DfdElementResponseDTO(
        Long id,
        String name,
        DfdElementType type,
        BigDecimal xValue,
        BigDecimal yValue,
        BigDecimal width,
        BigDecimal height,
        Long dfdChildId,
        String uuid
) {
}