namespace UrbanPulse.Core.Entities;

public class DuplicateSuspect
{
    public int Id { get; set; }
    public int User1Id { get; set; }
    public User User1 { get; set; } = null!;
    public int User2Id { get; set; }
    public User User2 { get; set; } = null!;
    public string Confidence { get; set; } = string.Empty; 
    public string Reasons { get; set; } = string.Empty; 
    public bool IsDismissed { get; set; } = false;
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
}