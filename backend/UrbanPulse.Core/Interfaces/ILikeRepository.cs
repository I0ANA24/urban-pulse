namespace UrbanPulse.Core.Interfaces;

using UrbanPulse.Core.Entities;

public interface ILikeRepository
{
    Task<Like?> GetByUserAndEventAsync(int userId, int eventId);
    Task<int> GetLikeCountAsync(int eventId);
    Task AddAsync(Like like);
    Task DeleteAsync(Like like);
}