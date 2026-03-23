namespace UrbanPulse.Core.Interfaces;

using UrbanPulse.Core.Entities;

public interface IRatingRepository
{
    Task<Rating?> GetByConversationAndUserAsync(int conversationId, int ratedByUserId);
    Task AddAsync(Rating rating);
    Task<List<Rating>> GetByUserIdAsync(int userId);
}