namespace UrbanPulse.Core.Entities
{
    public enum NotificationType
    {
        Emergency,
        HeroAlert,
        Comment,
        BadgeEarned
    }

    public class Notification : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; } = false;
        public string? ActionUrl { get; set; }
        public int? RelatedEventId { get; set; }
        public string? SenderAvatarUrl { get; set; }
    }
}