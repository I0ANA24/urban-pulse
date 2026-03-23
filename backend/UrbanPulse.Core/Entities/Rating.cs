namespace UrbanPulse.Core.Entities;

public class Rating : BaseEntity
{
    public int RatedUserId { get; set; }
    public User RatedUser { get; set; } = null!;
    public int RatedByUserId { get; set; }
    public User RatedByUser { get; set; } = null!;
    public int ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public string Value { get; set; } = string.Empty;
}