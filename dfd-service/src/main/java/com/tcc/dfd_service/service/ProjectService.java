package com.tcc.dfd_service.service;

import com.tcc.dfd_service.dto.*;
import com.tcc.dfd_service.entity.Dfd;
import com.tcc.dfd_service.entity.Project;
import com.tcc.dfd_service.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final DfdService dfdService;

    public ProjectResponseDTO createProject(CreateProjectDTO dto) {

        Project project = createNewProjectEntity(dto);

        Dfd contextDiagram = dfdService.create(0, project.getId(), null);

        project.setContextDiagramId(contextDiagram.getId());

        project = projectRepository.save(project);
        return toResponse(project);
    }

    public ProjectResponseDTO updateProject(Long id, UpdateProjectDTO dto) {

        Project project = findById(id);

        project.setTitle(dto.name());
        project.setDescription(dto.description());

        project = projectRepository.save(project);
        return toResponse(project);
    }

    public PagedProjectResponseDTO getPagedProjects(Integer page, Integer size) {
        if(page == null) page = 0;
        if(size == null) size = 15;
        Pageable pageable = PageRequest.of(page,size, Sort.by("createdAt").descending());

        Page<Project> pagedProjects =
                projectRepository.findAll(pageable);

        return new PagedProjectResponseDTO(
                page,
                pagedProjects.getTotalPages(),
                pagedProjects.getContent()
                        .stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    public void deleteProject(Long id) {
        Project project = findById(id);
        projectRepository.delete(project);
    }

    public ProjectResponseDTO getProjectById(Long id) {
        return toResponse(findById(id));
    }

    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Project not found with the provided ID: " + id
                        ));
    }

    private Project createNewProjectEntity(CreateProjectDTO dto) {

        Project project = new Project();

        project.setTitle(dto.name());
        project.setDescription(dto.description());
        project.setCreatedAt(
                OffsetDateTime.now(ZoneOffset.UTC)
        );

        return projectRepository.save(project);
    }

    private ProjectResponseDTO toResponse(Project project) {

        return new ProjectResponseDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getContextDiagramId(),
                project.getCreatedAt()
        );
    }
}