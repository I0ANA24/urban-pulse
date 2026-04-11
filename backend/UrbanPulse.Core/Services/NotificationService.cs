using UrbanPulse.Core.DTOs.Notifications;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

namespace UrbanPulse.Core.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;

        public NotificationService(INotificationRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<NotificationDto>> GetForUserAsync(int userId)
        {
            var notifications = await _repo.GetByUserIdAsync(userId);
            return notifications.Select(MapToDto).ToList();
        }

        public async Task<int> GetUnreadCountAsync(int userId) =>
            await _repo.GetUnreadCountAsync(userId);

        public async Task<NotificationDto> SendAsync(CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Body = dto.Body,
                Type = dto.Type,
                ActionUrl = dto.ActionUrl,
                RelatedEventId = dto.RelatedEventId,
                SenderAvatarUrl = dto.SenderAvatarUrl,
            };
            await _repo.AddAsync(notification);
            return MapToDto(notification);
        }

        public async Task MarkAsReadAsync(int notificationId, int userId) =>
            await _repo.MarkAsReadAsync(notificationId, userId);

        public async Task MarkAllAsReadAsync(int userId) =>
            await _repo.MarkAllAsReadAsync(userId);

        private static NotificationDto MapToDto(Notification n) => new()
        {
            Id = n.Id,
            Title = n.Title,
            Body = n.Body,
            Type = n.Type,
            IsRead = n.IsRead,
            ActionUrl = n.ActionUrl,
            RelatedEventId = n.RelatedEventId,
            CreatedAt = n.CreatedAt,
            AvatarUrl = n.SenderAvatarUrl,
        };
    }
}