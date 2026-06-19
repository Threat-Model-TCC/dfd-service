package com.tcc.dfd_service.dto;

import com.tcc.dfd_service.enums.DfdElementType;
import java.math.BigDecimal;

public record CreateDfdElementDTO(
        String elementName,
        DfdElementType type,
        BigDecimal positionX,
        BigDecimal positionY,
        BigDecimal width,
        BigDecimal height,
        String uuid
) {
}