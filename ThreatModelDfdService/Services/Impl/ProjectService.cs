using Microsoft.EntityFrameworkCore;
using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Model.Context;
using ThreatModelDfdService.Model.Entity;
using ThreatModelDfdService.Repositories;

namespace ThreatModelDfdService.Services.Impl;

public class ProjectService(
    MSSQLContext _context,
    IRepository<Project> projectRepository,
    DfdService dfdService
    )
{
    public ProjectResponseDTO CreateProject(CreateProjectDTO dto)
    {
        Project project = CreateNewProjectEntity(dto);
        
        Dfd contextDiagram = dfdService.Create(0, project.Id);
        project.ContextDiagramId = contextDiagram.Id;
        projectRepository.Update(project);

        return new ProjectResponseDTO(
            project.Id,
            project.Title,
            project.Description,
            project.ContextDiagramId,
            project.CreatedAt
        );
    }

    public ProjectResponseDTO UpdateProject(long id, UpdateProjectDTO dto)
    {
        Project project = FindById(id);
        project.Title = dto.Name;
        project.Description = dto.Description;
        projectRepository.Update(project);
        return new ProjectResponseDTO(
            project.Id,
            project.Title,
            project.Description,
            project.ContextDiagramId,
            project.CreatedAt
        );
    }

    public async Task<PagedProjectResponseDTO> GetPagedProjectsAsync(int page, int size)
    {
        var totalItems = await _context.Projects.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)size);

        var pagedList = await _context.Projects
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        var projects = pagedList.Select(p => new ProjectResponseDTO(
            p.Id,
            p.Title,
            p.Description,
            p.ContextDiagramId,
            p.CreatedAt
        )).ToList();

        return new PagedProjectResponseDTO(page, totalPages, projects);
    }

    public async Task DeleteProjectAsync(long id)
    {
        Project project = FindById(id);
        projectRepository.Delete(project);
    }

    private Project CreateNewProjectEntity(CreateProjectDTO dto)
    {
        Project project = new Project
        {
            Title = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };
        return projectRepository.Create(project);
    }

    public ProjectResponseDTO GetProjectById(long id)
    {
        Project project = FindById(id);
        return new ProjectResponseDTO(
            project.Id,
            project.Title,
            project.Description,
            project.ContextDiagramId,
            project.CreatedAt
        );
    }

    public Project FindById(long id)
    {
        Project? project = projectRepository.FindById(id);
        if (project == null) throw new KeyNotFoundException(
            "Project not found with the provided ID: " + id);
        return project;
    }
}
