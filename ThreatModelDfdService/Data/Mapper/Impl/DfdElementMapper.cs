using ThreatModelDfdService.Data.Converter.Contract;
using ThreatModelDfdService.Data.DTO;
using ThreatModelDfdService.Model.Entity;
using ThreatModelDfdService.Model.Enums;

namespace ThreatModelDfdService.Data.Converter.Impl;

public class DfdElementMapper : IParser<DfdElement, DfdElementResponseDTO>
{
    public DfdElementResponseDTO Parse(DfdElement origin)
    {
        if(origin == null) return null; 

        long ? dfdChildId = null;
        if(origin.Type == DfdElementType.Process)
        {
            Process process = (Process) origin;
            dfdChildId = process.DfdChildId;
        }

        return new DfdElementResponseDTO(
            origin.Id,
            origin.Name,
            origin.Type,
            origin.XValue,
            origin.YValue,
            origin.Width,
            origin.Height,
            dfdChildId,
            origin.UuidIdentifier
        );
    }

    public List<DfdElementResponseDTO> ParseList(List<DfdElement> origin)
    {
        if(origin == null) return null;
        return origin.Select(Parse).ToList();
    }
}
