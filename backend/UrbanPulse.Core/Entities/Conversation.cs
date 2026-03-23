namespace UrbanPulse.Core.Entities;

public class Conversation : BaseEntity
{
    public int User1Id { get; set; }
    public User User1 { get; set; } = null!;
    public int User2Id { get; set; }
    public User User2 { get; set; } = null!;
    public int? EventId { get; set; }
    public Event? Event { get; set; }
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}