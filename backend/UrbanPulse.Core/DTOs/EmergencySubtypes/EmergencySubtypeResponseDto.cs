namespace UrbanPulse.Core.DTOs.EmergencySubtypes
{
    public class EmergencySubtypeResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
