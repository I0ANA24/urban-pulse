using UrbanPulse.Core.Entities;

namespace UrbanPulse.Core.Interfaces;

public interface IUserReportRepository
{
    Task<bool> ExistsAsync(int reporterUserId, int reportedUserId);
    Task AddAsync(UserReport report);
    Task SaveChangesAsync();
}