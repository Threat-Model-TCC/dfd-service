package com.tcc.dfd_service.service;

import com.tcc.dfd_service.dto.DataFlowRequestDTO;
import com.tcc.dfd_service.dto.DataFlowResponseDTO;
import com.tcc.dfd_service.entity.DataFlow;
import com.tcc.dfd_service.entity.Dfd;
import com.tcc.dfd_service.entity.DfdElement;
import com.tcc.dfd_service.repository.DataFlowRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DataFlowService {

    private final DfdElementService dfdElementService;
    private final DataFlowRepository dataFlowRepository;

    @Transactional
    public void createOrUpdateDataFlow(DataFlowRequestDTO dto, Long dfdId) {
        DfdElement sourceElement = null;
        DfdElement targetElement = null;

        if (dto.sourceElementIdentifier() != null) {
            sourceElement = dfdElementService.getByUUID(dto.sourceElementIdentifier());
        }

        if (dto.targetElementIdentifier() != null) {
            targetElement = dfdElementService.getByUUID(dto.targetElementIdentifier());
        }

        if (dto.id() != null && dto.id() > 0) {
            DataFlow dbDataFlow = findById(dto.id());

            dbDataFlow.setName(dto.name());
            dbDataFlow.setDescription(dto.description());

            if (sourceElement != null) {
                dbDataFlow.setSourceElement(sourceElement);
            }

            if (targetElement != null) {
                dbDataFlow.setTargetElement(targetElement);
            }

            dbDataFlow.setSourcePosition(dto.sourcePosition());
            dbDataFlow.setTargetPosition(dto.targetPosition());

        } else {

            DataFlow newDataFlow = new DataFlow();

            newDataFlow.setName(dto.name());
            newDataFlow.setDescription(dto.description());
            newDataFlow.setSourceElement(sourceElement);
            newDataFlow.setTargetElement(targetElement);
            newDataFlow.setSourcePosition(dto.sourcePosition());
            newDataFlow.setTargetPosition(dto.targetPosition());
            newDataFlow.setDfdId(dfdId);

            dataFlowRepository.save(newDataFlow);
        }
    }

    public List<DataFlowResponseDTO> getDataFlowsByDfdId(Long dfdId) {
        return dataFlowRepository
                .findByDfdId(dfdId)
                .stream()
                .map(df -> new DataFlowResponseDTO(
                        df.getId(),
                        df.getName(),
                        df.getDescription(),
                        df.getSourceElement() != null
                                ? df.getSourceElement().getUuidIdentifier()
                                : null,
                        df.getTargetElement() != null
                                ? df.getTargetElement().getUuidIdentifier()
                                : null,
                        df.getSourcePosition(),
                        df.getTargetPosition()
                ))
                .toList();
    }

    public DataFlow findById(Long id) {
        return dataFlowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Data flow with the provided ID does not exist. Id: " + id)
                );
    }
}