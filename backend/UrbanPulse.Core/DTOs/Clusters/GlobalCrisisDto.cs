namespace UrbanPulse.Core.DTOs.Clusters;

public class GlobalCrisisDto
{
    public int Id { get; set; }
    public string SubType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsManuallyActivated { get; set; }
    public DateTime CreatedAt { get; set; }
}
