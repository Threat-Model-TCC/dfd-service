using Microsoft.AspNetCore.Mvc;
using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Services.Impl;

namespace ThreatModelDfdService.Controllers;

[ApiController]
[Route("projects")]
public class ProjectController(ProjectService projectService) : ControllerBase
{
    [HttpPost]
    public ActionResult<ProjectResponseDTO> CreateProject([FromBody] CreateProjectDTO dto)
    {
        ProjectResponseDTO payload = projectService.CreateProject(dto);
        return CreatedAtAction(null, null, payload);
    }

    [HttpGet("{id}")]
    public ActionResult<ProjectResponseDTO> GetProjectById([FromRoute] long id)
    {
        return Ok(projectService.GetProjectById(id));
    }

    [HttpGet]
    public async Task<ActionResult<PagedProjectResponseDTO>> GetPagedProjects(
        [FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        return Ok(await projectService.GetPagedProjectsAsync(page, size));
    }

    [HttpPut("{id}")]
    public ActionResult<ProjectResponseDTO> UpdateProject(
        [FromRoute] long id, [FromBody] UpdateProjectDTO dto)
    {
        return Ok(projectService.UpdateProject(id, dto));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProject([FromRoute] long id)
    {
        await projectService.DeleteProjectAsync(id);
        return NoContent();
    }
}
