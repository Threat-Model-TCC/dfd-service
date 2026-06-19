package com.tcc.dfd_service.controller;

import com.tcc.dfd_service.service.DfdElementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class DfdElementController {

    private final DfdElementService dfdElementService;

    @DeleteMapping("/dfd-elements/{id}")
    public ResponseEntity<Void> deleteDfdElement(
            @PathVariable Long id) {
        dfdElementService.deleteDfdElement(id);
        return ResponseEntity.noContent().build();
    }
}