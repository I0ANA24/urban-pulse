using UrbanPulse.Core.DTOs.Events;

namespace UrbanPulse.Core.DTOs.Clusters;

public class ClusterResponseDto
{
    public int Id { get; set; }
    public string SubType { get; set; } = string.Empty;
    public double CenterLatitude { get; set; }
    public double CenterLongitude { get; set; }
    public bool IsResolved { get; set; }
    public int EventCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Neighborhood { get; set; }
    public EventResponseDto? LatestEvent { get; set; }
    public List<EventResponseDto> Events { get; set; } = new();
}
