namespace UrbanPulse.Core.Entities;

public class UserReport
{
    public int Id { get; set; }
    public int ReportedUserId { get; set; }
    public User ReportedUser { get; set; } = null!;
    public int ReporterUserId { get; set; }
    public User ReporterUser { get; set; } = null!;
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}