package com.tcc.dfd_service.controller;

import com.tcc.dfd_service.dto.CreateProjectDTO;
import com.tcc.dfd_service.dto.PagedProjectResponseDTO;
import com.tcc.dfd_service.dto.ProjectResponseDTO;
import com.tcc.dfd_service.dto.UpdateProjectDTO;
import com.tcc.dfd_service.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponseDTO> createProject(@RequestBody CreateProjectDTO dto) {
        ProjectResponseDTO payload = projectService.createProject(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(payload);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping
    public ResponseEntity<PagedProjectResponseDTO> getPagedProjects(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return ResponseEntity.ok(projectService.getPagedProjects(page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> updateProject(
            @PathVariable Long id,
            @RequestBody UpdateProjectDTO dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}