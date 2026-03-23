namespace UrbanPulse.Core.Entities;

public class Message : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public int ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public string? MessageType { get; set; }
    public bool IsRead { get; set; } = false;
}