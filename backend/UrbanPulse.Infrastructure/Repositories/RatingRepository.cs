namespace UrbanPulse.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

public class RatingRepository : IRatingRepository
{
    private readonly AppDbContext _db;

    public RatingRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Rating?> GetByConversationAndUserAsync(int conversationId, int ratedByUserId)
        => await _db.Ratings.FirstOrDefaultAsync(r =>
            r.ConversationId == conversationId && r.RatedByUserId == ratedByUserId);

    public async Task AddAsync(Rating rating)
    {
        _db.Ratings.Add(rating);
        await _db.SaveChangesAsync();
    }

    public async Task<List<Rating>> GetByUserIdAsync(int userId)
        => await _db.Ratings.Where(r => r.RatedUserId == userId).ToListAsync();
}