namespace UrbanPulse.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

public class CommentRepository : ICommentRepository
{
    private readonly AppDbContext _db;

    public CommentRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Comment>> GetByEventIdAsync(int eventId)
        => await _db.Comments
            .Include(c => c.User)
            .Where(c => c.EventId == eventId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task<int> GetCountAsync(int eventId)
        => await _db.Comments.CountAsync(c => c.EventId == eventId);

    public async Task<Comment> AddAsync(Comment comment)
    {
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();
        return comment;
    }

    public async Task DeleteAsync(Comment comment)
    {
        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
    }

    public async Task<Comment?> GetByIdAsync(int id)
        => await _db.Comments.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
}