namespace UrbanPulse.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

public class ConversationRepository : IConversationRepository
{
    private readonly AppDbContext _db;

    public ConversationRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Conversation?> GetByUsersAsync(int user1Id, int user2Id)
        => await _db.Conversations
            .Include(c => c.User1)
            .Include(c => c.User2)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c =>
                (c.User1Id == user1Id && c.User2Id == user2Id) ||
                (c.User1Id == user2Id && c.User2Id == user1Id));

    public async Task<Conversation?> GetByIdAsync(int id)
        => await _db.Conversations
            .Include(c => c.User1)
            .Include(c => c.User2)
            .Include(c => c.Messages)
                .ThenInclude(m => m.Sender)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<List<Conversation>> GetByUserIdAsync(int userId)
        => await _db.Conversations
            .Include(c => c.User1)
            .Include(c => c.User2)
            .Include(c => c.Messages)
                .ThenInclude(m => m.Sender)
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.CreatedAt))
            .ToListAsync();

    public async Task<Conversation> CreateAsync(Conversation conversation)
    {
        _db.Conversations.Add(conversation);
        await _db.SaveChangesAsync();
        return conversation;
    }

    public async Task<Message> AddMessageAsync(Message message)
    {
        _db.Messages.Add(message);
        await _db.SaveChangesAsync();
        return message;
    }

    public async Task<List<Message>> GetMessagesAsync(int conversationId)
        => await _db.Messages
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

    public async Task<List<Conversation>> GetByEventIdAsync(int eventId)
        => await _db.Conversations
            .Where(c => c.EventId == eventId)
            .ToListAsync();

    public async Task MarkAsReadAsync(int conversationId, int userId)
    {
        var unread = await _db.Messages
            .Where(m => m.ConversationId == conversationId && m.SenderId != userId && !m.IsRead)
            .ToListAsync();

        foreach (var msg in unread)
            msg.IsRead = true;

        await _db.SaveChangesAsync();
    }
}