using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Model.Context;
using ThreatModelDfdService.Model.Entity;

namespace ThreatModelDfdService.Services.Impl;

public class DfdService(
    DfdElementService dfdElementService,
    DataFlowService dataFlowService,
    MSSQLContext context)
{
    public async Task<FullDfdResponseDTO> SyncElementsAsync(long dfdId, UpsertAllDfdElementsDTO dto)
    {
        foreach (var elementDto in dto.Elements)
        {
            await dfdElementService.CreateOrUpdateAsync(dfdId, elementDto);
        }

        await context.SaveChangesAsync();

        foreach (var dataFlowDto in dto.DataFlows)
        {
            await dataFlowService.CreateOrUpdateDataFlow(dataFlowDto, dfdId);
        }
        await context.SaveChangesAsync();
        
        return new FullDfdResponseDTO(
            dfdElementService.GetDfdElementsByDfdId(dfdId),
            dataFlowService.GetDataFlowsByDfdId(dfdId)
        );
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
