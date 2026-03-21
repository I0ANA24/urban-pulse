namespace UrbanPulse.Core.Entities;


public enum EventType
{
    General,
    Emergency,
    Skill,
    Lend
}



public class Event : BaseEntity
{
    public string Description { get; set; } = string.Empty;
    public EventType Type { get; set; }
    public string? ImageUrl { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Tags { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
}