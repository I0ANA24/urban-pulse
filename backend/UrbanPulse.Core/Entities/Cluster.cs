namespace UrbanPulse.Core.Entities;

public class Cluster : BaseEntity
{
    public string SubType { get; set; } = string.Empty;
    public double CenterLatitude { get; set; }
    public double CenterLongitude { get; set; }
    public bool IsResolved { get; set; } = false;
    public string? Neighborhood { get; set; }
    public ICollection<Event> Events { get; set; } = new List<Event>();
}
