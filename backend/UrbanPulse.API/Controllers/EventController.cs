using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.DTOs.Events;
using UrbanPulse.Core.DTOs.Notifications;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

namespace UrbanPulse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IHubContext<EventHub> _hubContext;
        private readonly IHubContext<NotificationHub> _notificationHub;
        private readonly IConversationRepository _conversationRepository;
        private readonly INotificationService _notificationService;
        private readonly IUserRepository _userRepository;
        private readonly Cloudinary _cloudinary;

        public EventController(
            IEventService eventService,
            IHubContext<EventHub> hubContext,
            IHubContext<NotificationHub> notificationHub,
            IConversationRepository conversationRepository,
            INotificationService notificationService,
            IUserRepository userRepository)
        {
            _eventService = eventService;
            _hubContext = hubContext;
            _notificationHub = notificationHub;
            _conversationRepository = conversationRepository;
            _notificationService = notificationService;
            _userRepository = userRepository;

            var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
            var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
            var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");
            _cloudinary = new Cloudinary(new Account(cloudName, apiKey, apiSecret));
        }

        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromForm] CreateEventDto dto, IFormFile? file)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            string? imageUrl = null;
            if (file != null && file.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Invalid file type." });

                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "events",
                    Transformation = new Transformation().Width(1200).Height(800).Crop("limit").Quality("auto"),
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                    return BadRequest(new { message = uploadResult.Error.Message });

                imageUrl = uploadResult.SecureUrl.ToString();
            }

            var result = await _eventService.CreateEventAsync(dto, userId, imageUrl);
            await _hubContext.Clients.All.SendAsync("NewEvent", result);

            var poster = await _userRepository.GetByIdAsync(userId);
            var posterName = poster?.FullName ?? poster?.Email?.Split('@')[0] ?? "Someone";

            if (dto.Type == EventType.Skill || dto.Type == EventType.Lend)
            {
                var keyword = dto.Tags.FirstOrDefault() ?? "";
                if (!string.IsNullOrWhiteSpace(keyword) && dto.Latitude != 0 && dto.Longitude != 0)
                {
                    var matchingUsers = await _userRepository.GetUsersMatchingSkillOrToolNearbyAsync(
                        keyword, dto.Latitude, dto.Longitude, radiusKm: 2.0);

                    foreach (var user in matchingUsers)
                    {
                        if (user.Id == userId) continue;

                        var notification = await _notificationService.SendAsync(new CreateNotificationDto
                        {
                            UserId = user.Id,
                            Title = posterName,
                            Body = dto.Type == EventType.Skill
                                ? "Skill Alert: Your skills are a match."
                                : "Lend Alert: Your resources are a match.",
                            Type = NotificationType.HeroAlert,
                            ActionUrl = $"/dashboard?eventId={result.Id}",
                            RelatedEventId = result.Id,
                            SenderAvatarUrl = poster?.AvatarUrl,
                        });

                        await _notificationHub.Clients.User(user.Id.ToString())
                            .SendAsync("NewNotification", notification);
                    }
                }
            }

            if (dto.Type == EventType.Emergency)
            {
                var allUsers = await _userRepository.GetAllUsersAsync();

                foreach (var user in allUsers)
                {
                    if (user.Id == userId) continue;

                    var notification = await _notificationService.SendAsync(new CreateNotificationDto
                    {
                        UserId = user.Id,
                        Title = "Emergency Alert 🚨",
                        Body = $"{posterName} reported an emergency nearby. Stay safe!",
                        Type = NotificationType.Emergency,
                        ActionUrl = $"/dashboard?eventId={result.Id}",
                        RelatedEventId = result.Id,
                        SenderAvatarUrl = poster?.AvatarUrl,
                    });

                    await _notificationHub.Clients.User(user.Id.ToString())
                        .SendAsync("NewNotification", notification);
                }
            }

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllActive()
        {
            var events = await _eventService.GetAllActiveAsync();
            return Ok(events);
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteEvent(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _eventService.CompleteEventAsync(id, userId);

            var conversations = await _conversationRepository.GetByEventIdAsync(id);
            foreach (var conv in conversations)
            {
                var message = new Message
                {
                    Text = "Did this person actually help you?",
                    SenderId = userId,
                    ConversationId = conv.Id,
                    MessageType = "rating_check",
                };
                await _conversationRepository.AddMessageAsync(message);
                await _hubContext.Clients.All.SendAsync($"NewMessage_{conv.Id}", new
                {
                    id = message.Id,
                    text = message.Text,
                    senderId = userId,
                    createdAt = message.CreatedAt,
                    isRating = true,
                });
            }

            return Ok();
        }

        [HttpGet("radius")]
        public async Task<IActionResult> GetByRadius(
            [FromQuery] double latitude,
            [FromQuery] double longitude,
            [FromQuery] double radiusKm = 0.5)
        {
            var events = await _eventService.GetByRadiusAsync(latitude, longitude, radiusKm);
            return Ok(events);
        }

        [HttpGet("type/{type}")]
        public async Task<IActionResult> GetByType(string type)
        {
            var events = await _eventService.GetByTypeAsync(type);
            return Ok(events);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                var all = await _eventService.GetAllActiveAsync();
                return Ok(all);
            }
            var events = await _eventService.SearchAsync(query);
            return Ok(events);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deactivate(int id)
        {
            await _eventService.DeactivateAsync(id);
            await _hubContext.Clients.All.SendAsync("EventDeactivated", id);
            return Ok();
        }

        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var events = await _eventService.GetByUserIdAsync(userId);
            return Ok(events);
        }
    }
}