using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Model.Context;
using ThreatModelDfdService.Model.Entity;
using ThreatModelDfdService.Repositories;

namespace ThreatModelDfdService.Services.Impl;

public class DataFlowService(
    DfdElementService dfdElementService,
    IRepository<DataFlow> dataFlowRepository,
    MSSQLContext context
)
{
    public async Task CreateOrUpdateDataFlow(DataFlowRequestDTO dto)
    {
        long? sourceElementId = null;
        long? targetElementId = null;
        if(dto.SourceElementIdentifier != null)
        {
            DfdElement sourceElement = dfdElementService.GetByUUID(dto.SourceElementIdentifier);
            sourceElementId = sourceElement.Id;
        }
        if(dto.TargetElementIdentifier != null)
        {
            DfdElement targetElement = dfdElementService.GetByUUID(dto.TargetElementIdentifier);
            targetElementId = targetElement.Id;
        }

        if(dto.Id.HasValue && dto.Id.Value > 0)
        {
            DataFlow dbDataFlow = FindById(dto.Id.Value);
            dbDataFlow.Name = dto.Name;
            dbDataFlow.Description = dto.Description;
            if(sourceElementId.HasValue) dbDataFlow.SourceElementId = sourceElementId;
            if(targetElementId.HasValue) dbDataFlow.TargetElementId = targetElementId;
            dbDataFlow.SourcePosition = dto.SourcePosition;
            dbDataFlow.TargetPosition = dto.TargetPosition;

            await dataFlowRepository.UpdateAsync(dbDataFlow);
        }
        else
        {
            DataFlow newDataFlow = new DataFlow
            {
                Name = dto.Name,
                Description = dto.Description,
                SourceElementId = sourceElementId,
                TargetElementId = targetElementId,
                SourcePosition = dto.SourcePosition,
                TargetPosition = dto.TargetPosition
            };
            await dataFlowRepository.CreateAsync(newDataFlow);
        }
    }

    public List<DataFlowResponseDTO> GetDataFlowsByDfdId(long dfdId)
    {
        List<DataFlow> dataFlows = context.DataFlows.Where(df => df.SourceElement.DfdId == dfdId || df.TargetElement.DfdId == dfdId).ToList();
        return dataFlows.Select(df => new DataFlowResponseDTO(
            df.Id,
            df.Name,
            df.Description,
            df.SourceElement != null ? df.SourceElement.UuidIdentifier : null,
            df.TargetElement != null ? df.TargetElement.UuidIdentifier : null,
            df.SourcePosition,
            df.TargetPosition
        )).ToList();
    }

    public DataFlow FindById(long id)
    {
        DataFlow dbDataFlow = context.DataFlows.FirstOrDefault(df => df.Id == id);
        if (dbDataFlow == null)
        {
            throw new ArgumentException("Data flow with the provided ID does not exist. | Id: " + id);
        }
        return dbDataFlow;
    }
}
