using UrbanPulse.Core.Entities;

namespace UrbanPulse.Core.DTOs.Events
{
    public class EventResponseDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public EventType Type { get; set; }
        public string? ImageUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public List<string> Tags { get; set; } = new();
        public int CreatedByUserId { get; set; }
        public string CreatedByEmail { get; set; } = string.Empty;
        public string? CreatedByFullName { get; set; }
        public string? CreatedByAvatarUrl { get; set; }
        public bool IsVerifiedUser { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsCompleted { get; set; }
        public string? EmergencySubType { get; set; }
        public string? Neighborhood { get; set; }
        public int? ClusterId { get; set; }
    }
}