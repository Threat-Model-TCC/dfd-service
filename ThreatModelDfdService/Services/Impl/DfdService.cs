using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Model.Context;
using ThreatModelDfdService.Model.Entity;

namespace ThreatModelDfdService.Services.Impl;

public class DfdService(DfdElementService dfdElementService, MSSQLContext context)
{
    public async Task<List<DfdElementResponseDTO>> SyncElementsAsync(long dfdId, List<UpsertDfdElementDTO> dtos)
    {
        foreach (var dto in dtos)
        {
            await dfdElementService.CreateOrUpdateAsync(dfdId, dto);
        }
        await context.SaveChangesAsync();
        return dfdElementService.GetDfdElementsByDfdId(dfdId);
    }

    public DfdDTO CreateChildDfd(CreateDfdChildDTO dto)
    {
        DfdElement processParent = dfdElementService.GetById(dto.ProcessParentId);
        Dfd dfd = FindById(processParent.DfdId);
        Dfd childDfd = Create(dto.LevelNumber + 1, dfd.ProjectId, processParent.DfdId);

        Process process = (Process) processParent;
        process.DfdChildId = childDfd.Id;
        context.SaveChanges();

        return new DfdDTO(childDfd.Id, childDfd.DfdParentId, childDfd.LevelNumber, []);
    }

    public Dfd Create(int LevelNumber, long projectId, long? dfdParentId = null)
    {
        Dfd dfd = context.Dfds.Add(new Dfd {
            LevelNumber = LevelNumber,
            ProjectId = projectId,
            DfdParentId = dfdParentId
        }).Entity;
        context.SaveChanges();
        return dfd;
    }

    public DfdDTO GetDfdById(long id)
    {
        Dfd dfd = FindById(id);
        return new DfdDTO(dfd.Id, dfd.DfdParentId, dfd.LevelNumber, dfdElementService.GetDfdElementsByDfdId(id));
    }

    public Dfd FindById(long id)
    {
        Dfd? dfd = context.Dfds.Find(id);
        if (dfd == null) throw new KeyNotFoundException("DFD not found with the provided ID: " + id);
        return dfd;
    }
}
