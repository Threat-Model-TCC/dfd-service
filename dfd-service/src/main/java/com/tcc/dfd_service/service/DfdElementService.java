package com.tcc.dfd_service.service;

import com.tcc.dfd_service.dto.DfdElementResponseDTO;
import com.tcc.dfd_service.dto.UpsertDfdElementDTO;
import com.tcc.dfd_service.entity.*;
import com.tcc.dfd_service.entity.Process;
import com.tcc.dfd_service.mapper.DfdElementMapper;
import com.tcc.dfd_service.repository.DfdElementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DfdElementService {

    private final DfdElementRepository dfdElementRepository;
    private final DfdElementMapper dfdElementMapper;

    @Transactional
    public void createOrUpdate(Long dfdId, UpsertDfdElementDTO dto) {

        if (dto.id() != null && dto.id() > 0) {

            DfdElement dbElement =
                    getById(dto.id());

            dbElement.setName(dto.name());
            dbElement.setXValue(dto.xValue());
            dbElement.setYValue(dto.yValue());
            dbElement.setWidth(dto.width());
            dbElement.setHeight(dto.height());

        } else {
            createNewElement(dfdId, dto);
        }
    }

    private void createNewElement(Long dfdId, UpsertDfdElementDTO dto) {
        DfdElement newEntity;

        switch (dto.type()) {
            case PROCESS -> newEntity = new Process();
            case ACTOR -> newEntity = new Actor();
            case DATA_STORE -> newEntity = new DataStore();
            default -> throw new IllegalArgumentException(
                    "Invalid DFD element type. Name: " + dto.name() + " Type: " + dto.type());
        }

        newEntity.setDfdId(dfdId);
        newEntity.setName(dto.name());
        newEntity.setXValue(dto.xValue());
        newEntity.setYValue(dto.yValue());
        newEntity.setWidth(dto.width());
        newEntity.setHeight(dto.height());
        newEntity.setType(dto.type());
        newEntity.setUuidIdentifier(dto.uuid());

        dfdElementRepository.save(newEntity);
    }

    public List<DfdElementResponseDTO> getDfdElementsByDfdId(Long dfdId) {
        List<DfdElement> elements = dfdElementRepository.findByDfdId(dfdId);
        return dfdElementMapper.parseList(elements);
    }

    public DfdElement getById(Long id) {
        return dfdElementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("DFD element does not exist."));
    }

    public DfdElement getByUUID(String uuid) {
        return dfdElementRepository.findByUuidIdentifier(uuid)
                .orElseThrow(() -> new IllegalArgumentException("DFD element does not exist."));
    }

    @Transactional
    public void deleteDfdElement(Long id) {
        DfdElement dbElement = getById(id);
        dfdElementRepository.delete(dbElement);
    }
}