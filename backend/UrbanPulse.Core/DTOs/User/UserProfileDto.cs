namespace UrbanPulse.Core.DTOs.User
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
        public List<string> Skills { get; set; } = new();
        public List<string> Tools { get; set; } = new();
        public string Role { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public bool IsBanned { get; set; }
        public int TasksBanned { get; set; }
        public int TasksPostsDeleted { get; set; }
        public int TasksDuplicatesMerged { get; set; }
        public int TasksDismissed { get; set; }
        public double TrustScore { get; set; }
        public int HelpfulCount { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}