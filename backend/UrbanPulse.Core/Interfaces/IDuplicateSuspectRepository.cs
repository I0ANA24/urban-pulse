using UrbanPulse.Core.DTOs;
using UrbanPulse.Core.Entities;

namespace UrbanPulse.Core.Interfaces;

public interface IDuplicateSuspectRepository
{
    Task<bool> ExistsAsync(int user1Id, int user2Id);
    Task AddAsync(DuplicateSuspect suspect);
    Task<List<DuplicateSuspectDto>> GetAllActiveAsync();
    Task<DuplicateSuspect?> GetByIdAsync(int id);
    Task SaveChangesAsync();
}