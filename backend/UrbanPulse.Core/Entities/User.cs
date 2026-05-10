namespace UrbanPulse.Core.Entities
{
    public enum SafetyStatus
    {
        NoResponse = 0,
        Safe = 1,
        Injured = 2,
        NeedHelp = 3,
        AvailableToHelp = 4
    }

    public class User : BaseEntity
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public bool IsActive { get; set; } = true;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
        public bool IsVerified { get; set; } = false;
        public int HelpfulCount { get; set; } = 0;
        public int NotHelpfulCount { get; set; } = 0;
        public double TrustScore { get; set; } = 0;
        public string? Skills { get; set; }
        public string? Tools { get; set; }
        public string? AvatarUrl { get; set; }
        public int TasksBanned { get; set; } = 0;
        public int TasksPostsDeleted { get; set; } = 0;
        public int TasksDuplicatesMerged { get; set; } = 0;
        public int TasksDismissed { get; set; } = 0;
        public bool IsBanned { get; set; } = false;
        public DateTime? BannedAt { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public SafetyStatus? CurrentSafetyStatus { get; set; }
        public DateTime? SafetyStatusUpdatedAt { get; set; }
    }
}