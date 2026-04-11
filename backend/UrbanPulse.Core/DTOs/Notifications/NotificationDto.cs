using UrbanPulse.Core.Entities;

namespace UrbanPulse.Core.DTOs.Notifications
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; }
        public string? ActionUrl { get; set; }
        public int? RelatedEventId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class CreateNotificationDto
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public string? ActionUrl { get; set; }
        public int? RelatedEventId { get; set; }
        public string? SenderAvatarUrl { get; set; }
    }
}