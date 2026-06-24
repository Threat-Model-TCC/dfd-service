package com.tcc.dfd_service.service;

import com.tcc.dfd_service.dto.*;
import com.tcc.dfd_service.entity.Dfd;
import com.tcc.dfd_service.entity.DfdElement;
import com.tcc.dfd_service.entity.Process;
import com.tcc.dfd_service.repository.DfdRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DfdService {

    private final DfdRepository dfdRepository;
    private final DfdElementService dfdElementService;
    private final DataFlowService dataFlowService;

    @Transactional
    public FullDfdResponseDTO syncElementsAndFlows(Long dfdId, SyncDfdElementsAndFlowsDTO dto) {

        for (UpsertDfdElementDTO elementDto : dto.elements()) {
            dfdElementService.createOrUpdate(dfdId, elementDto);
        }

        for (DataFlowRequestDTO flowDto : dto.dataFlows()) {
            dataFlowService.createOrUpdateDataFlow(flowDto, dfdId);
        }

        return new FullDfdResponseDTO(
                dfdElementService.getDfdElementsByDfdId(dfdId),
                dataFlowService.getDataFlowsByDfdId(dfdId)
        );
    }

    @Transactional
    public DfdDTO createChildDfd(CreateDfdChildDTO dto) {
        DfdElement processParent = dfdElementService.getById(dto.processParentId());

        Dfd parentDfd = findById(processParent.getDfdId());

        Dfd childDfd = create(
                        dto.levelNumber() + 1,
                        parentDfd.getProjectId(),
                        parentDfd.getId()
                );

        Process process = (Process) processParent;

        process.setDfdChild(childDfd);

        return new DfdDTO(
                childDfd.getId(),
                childDfd.getDfdParent() != null
                        ? childDfd.getDfdParent().getId()
                        : null,
                childDfd.getLevelNumber(),
                List.of(),
                List.of()
        );
    }

    @Transactional
    public Dfd create(Integer levelNumber, Long projectId, Long dfdParentId) {

        Dfd dfd = new Dfd();
        dfd.setLevelNumber(levelNumber);
        dfd.setProjectId(projectId);

        if (dfdParentId != null) {
            dfd.setDfdParent(findById(dfdParentId));
        }

        return dfdRepository.save(dfd);
    }

    public DfdDTO getDfdById(Long id) {
        Dfd dfd = findById(id);

        return new DfdDTO(
                dfd.getId(),
                dfd.getDfdParent() != null
                        ? dfd.getDfdParent().getId()
                        : null,
                dfd.getLevelNumber(),
                dfdElementService.getDfdElementsByDfdId(id),
                dataFlowService.getDataFlowsByDfdId(id)
        );
    }

    public Dfd findById(Long id) {
        return dfdRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("DFD not found with the provided ID: " + id));
    }
}