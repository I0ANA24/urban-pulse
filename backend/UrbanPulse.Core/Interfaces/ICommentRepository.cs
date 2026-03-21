namespace UrbanPulse.Core.Interfaces;

using UrbanPulse.Core.Entities;

public interface ICommentRepository
{
    Task<List<Comment>> GetByEventIdAsync(int eventId);
    Task<int> GetCountAsync(int eventId);
    Task<Comment> AddAsync(Comment comment);
    Task DeleteAsync(Comment comment);
    Task<Comment?> GetByIdAsync(int id);
}