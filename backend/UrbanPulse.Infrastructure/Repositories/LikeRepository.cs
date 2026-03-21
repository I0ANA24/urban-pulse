namespace UrbanPulse.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

public class LikeRepository : ILikeRepository
{
    private readonly AppDbContext _db;

    public LikeRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Like?> GetByUserAndEventAsync(int userId, int eventId)
        => await _db.Likes.FirstOrDefaultAsync(l => l.UserId == userId && l.EventId == eventId);

    public async Task<int> GetLikeCountAsync(int eventId)
        => await _db.Likes.CountAsync(l => l.EventId == eventId);

    public async Task AddAsync(Like like)
    {
        _db.Likes.Add(like);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Like like)
    {
        _db.Likes.Remove(like);
        await _db.SaveChangesAsync();
    }
}