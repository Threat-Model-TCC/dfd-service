using Microsoft.AspNetCore.Mvc;
using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Services.Impl;

namespace ThreatModelDfdService.Controllers;

[ApiController]
[Route("dfd")]
public class DfdController(DfdService service) : ControllerBase
{

    [HttpPost("child")]
    public ActionResult<DfdDTO> CreateDfdChild([FromBody] CreateDfdChildDTO dto)
    {
        DfdDTO payload = service.CreateChildDfd(dto);
        return CreatedAtAction(null, null, payload);
    }

    [HttpPut("{id}/elements")]
    public async Task<ActionResult<FullDfdResponseDTO>> UpdateElements(
        long id, [FromBody] UpsertAllDfdElementsDTO dto)
    {
        var result = await service.SyncElementsAsync(id, dto);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public ActionResult<DfdDTO> GetDfdById(long id)
    {
        return Ok(service.GetDfdById(id));
    }
}
