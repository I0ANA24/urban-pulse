namespace UrbanPulse.Core.Entities;

public class Comment : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int EventId { get; set; }
    public Event Event { get; set; } = null!;
}