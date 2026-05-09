namespace UrbanPulse.Core.Entities;


public enum EventType
{
    General,
    Emergency,
    Skill,
    Lend,
    LostPet,
    FoundPet
}



public class Event : BaseEntity
{
    public string Description { get; set; } = string.Empty;
    public EventType Type { get; set; }
    public string? EmergencySubType { get; set; }
    public string? ImageUrl { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Tags { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int YesCount { get; set; } = 0;
    public int NoCount { get; set; } = 0;
    public ICollection<EventVerification> Verifications { get; set; } = new List<EventVerification>();
    public bool IsCompleted { get; set; } = false;
    public string? AiTags { get; set; }
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
}