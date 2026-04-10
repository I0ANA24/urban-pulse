using UrbanPulse.Core.DTOs;

namespace UrbanPulse.Core.Interfaces;

public interface IAdminStatsRepository
{
    Task<AdminStatsDto> GetStatsAsync();
}