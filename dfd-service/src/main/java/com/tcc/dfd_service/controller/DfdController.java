package com.tcc.dfd_service.controller;

import com.tcc.dfd_service.dto.CreateDfdChildDTO;
import com.tcc.dfd_service.dto.DfdDTO;
import com.tcc.dfd_service.dto.FullDfdResponseDTO;
import com.tcc.dfd_service.dto.SyncDfdElementsAndFlowsDTO;
import com.tcc.dfd_service.service.DfdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dfd")
@RequiredArgsConstructor
public class DfdController {

    private final DfdService service;

    @PostMapping("/child")
    public ResponseEntity<DfdDTO> createDfdChild(
            @Valid @RequestBody CreateDfdChildDTO dto) {
        DfdDTO payload = service.createChildDfd(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(payload);
    }

    @PutMapping("/{id}/elements")
    public ResponseEntity<FullDfdResponseDTO> updateElements(
            @PathVariable Long id,
            @Valid @RequestBody SyncDfdElementsAndFlowsDTO dto) {
        FullDfdResponseDTO result = service.syncElementsAndFlows(id, dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DfdDTO> getDfdById(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.getDfdById(id));
    }
}