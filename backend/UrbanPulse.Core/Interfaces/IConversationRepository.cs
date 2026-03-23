namespace UrbanPulse.Core.Interfaces;

using UrbanPulse.Core.Entities;

public interface IConversationRepository
{
    Task<Conversation?> GetByUsersAsync(int user1Id, int user2Id);
    Task<Conversation?> GetByIdAsync(int id);
    Task<List<Conversation>> GetByUserIdAsync(int userId);
    Task<Conversation> CreateAsync(Conversation conversation);
    Task<Message> AddMessageAsync(Message message);
    Task<List<Message>> GetMessagesAsync(int conversationId);
    Task<List<Conversation>> GetByEventIdAsync(int eventId);
    Task MarkAsReadAsync(int conversationId, int userId);
}