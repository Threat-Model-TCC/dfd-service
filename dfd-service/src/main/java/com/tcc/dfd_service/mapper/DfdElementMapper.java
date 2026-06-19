package com.tcc.dfd_service.mapper;

import com.tcc.dfd_service.dto.DfdElementResponseDTO;
import com.tcc.dfd_service.entity.DfdElement;
import com.tcc.dfd_service.entity.Process;
import com.tcc.dfd_service.enums.DfdElementType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DfdElementMapper {

    public DfdElementResponseDTO parse(DfdElement origin) {
        if (origin == null) {
            return null;
        }

        Long dfdChildId = null;

        if (origin.getType() == DfdElementType.PROCESS
                && origin instanceof Process process
                && process.getDfdChild() != null) {
            dfdChildId = process.getDfdChild().getId();
        }

        return new DfdElementResponseDTO(
                origin.getId(),
                origin.getName(),
                origin.getType(),
                origin.getXValue(),
                origin.getYValue(),
                origin.getWidth(),
                origin.getHeight(),
                dfdChildId,
                origin.getUuidIdentifier()
        );
    }

    public List<DfdElementResponseDTO> parseList(List<DfdElement> origin) {
        if (origin == null) {
            return null;
        }

        return origin.stream()
                .map(this::parse)
                .toList();
    }
}