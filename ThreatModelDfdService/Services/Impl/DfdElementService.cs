using ThreatModelDfdService.Data.Converter.Impl;
using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Model.Context;
using ThreatModelDfdService.Model.Entity;
using ThreatModelDfdService.Model.Enums;
using ThreatModelDfdService.Repositories;

namespace ThreatModelDfdService.Services;

public class DfdElementService(
    IRepository<DfdElement> dfdElementRepository,
    DfdElementMapper dfdElementMapper,
    MSSQLContext _context
)
{
    public async Task CreateOrUpdateAsync(long dfdId, UpsertDfdElementDTO dto)
    {
        if (dto.Id != null && dto.Id > 0)
        {
            DfdElement dbElement = GetById(dto.Id.Value);
            dbElement.Name = dto.Name;
            dbElement.XValue = dto.XValue;
            dbElement.YValue = dto.YValue;
            dbElement.Width = dto.Width;
            dbElement.Height = dto.Height;

            await dfdElementRepository.UpdateAsync(dbElement);
        }
        else
        {
            await CreateNewElementAsync(dfdId, dto);
        }
    }

    private async Task CreateNewElementAsync(long dfdId, UpsertDfdElementDTO dto)
    {
        DfdElement newEntity = dto.Type switch
        {
            DfdElementType.Process => new Process(),
            DfdElementType.Actor => new Actor(),
            DfdElementType.DataStore => new DataStore(),
            _ => throw new ArgumentException(
                "Dfd element type is not valid. | Name: " + dto.Name + " Type: " + dto.Type)
        };

        newEntity.DfdId = dfdId;
        newEntity.Name = dto.Name;
        newEntity.XValue = dto.XValue;
        newEntity.YValue = dto.YValue;
        newEntity.Width = dto.Width;
        newEntity.Height = dto.Height;
        newEntity.Type = dto.Type;
        newEntity.UuidIdentifier = dto.Uuid;

        await dfdElementRepository.CreateAsync(newEntity);
    }

    public List<DfdElementResponseDTO> GetDfdElementsByDfdId(long dfdId)
    {
        List<DfdElement> dfdElements = _context.DfdElements.Where(e => e.DfdId == dfdId).ToList();
        return dfdElementMapper.ParseList(dfdElements);
    }

    public DfdElement GetById(long id)
    {
        DfdElement dbElement = dfdElementRepository.FindById(id);
        ValidateDfdElementExists(dbElement);
        return dbElement;
    }

    public DfdElement GetByUUID(string uuid)
    {
        DfdElement dbElement = _context.DfdElements.FirstOrDefault(e => e.UuidIdentifier == uuid);
        ValidateDfdElementExists(dbElement);
        return dbElement;
    }

    public void DeleteDfdElement(long id)
    {
        DfdElement dbElement = GetById(id);
        dfdElementRepository.Delete(dbElement);
    }

    public void ValidateDfdElementExists(DfdElement dfdElement)
    {
        if(dfdElement == null) throw new KeyNotFoundException("Dfd element does not exist.");
    }
}
