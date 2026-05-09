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
using UrbanPulse.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.DTOs;
using UrbanPulse.Core.Services;

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
        private readonly AppDbContext _context;
        private readonly ClaudeVisionService _claudeVisionService;
        private readonly IServiceScopeFactory _scopeFactory;

        public EventController(
            IEventService eventService,
            IHubContext<EventHub> hubContext,
            IHubContext<NotificationHub> notificationHub,
            IConversationRepository conversationRepository,
            INotificationService notificationService,
            IUserRepository userRepository,
            AppDbContext context,
            ClaudeVisionService claudeVisionService,
            IServiceScopeFactory scopeFactory)
        {
            _eventService = eventService;
            _hubContext = hubContext;
            _notificationHub = notificationHub;
            _conversationRepository = conversationRepository;
            _notificationService = notificationService;
            _userRepository = userRepository;
            _context = context;
            _claudeVisionService = claudeVisionService;
            _scopeFactory = scopeFactory;

            var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
            var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
            var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");
            _cloudinary = new Cloudinary(new Account(cloudName, apiKey, apiSecret));
        }

        [HttpGet("clusters")]
        public async Task<IActionResult> GetEmergencyClusters()
        {
            var emergencies = await _context.Events
                .Include(e => e.CreatedByUser)
                .Where(e => e.IsActive &&
                            e.Type == EventType.Emergency &&
                            e.EmergencySubType != null &&
                            e.Neighbourhood != null)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            var localClusters = emergencies
                .GroupBy(e => new { e.EmergencySubType, e.Neighbourhood })
                .Where(g => g.Count() >= 2)
                .ToList();

            var globalGroups = localClusters
                .GroupBy(g => g.Key.EmergencySubType)
                .ToList();

            var result = new List<object>();

            foreach (var globalGroup in globalGroups)
            {
                var neighbourhoodCount = globalGroup.Count();
                var allEvents = globalGroup.SelectMany(g => g).ToList();
                var representative = allEvents.First();

                var affectedNeighbourhoods = globalGroup
                    .Select(g => g.Key.Neighbourhood!)
                    .Distinct()
                    .ToList();

                if (neighbourhoodCount >= 2)
                {
                    result.Add(new
                    {
                        isCluster = true,
                        isGlobal = true,
                        reportCount = allEvents.Count,
                        neighbourhoodCount,
                        emergencySubType = globalGroup.Key,
                        affectedNeighbourhoods,
                        latitude = allEvents.Average(e => e.Latitude),
                        longitude = allEvents.Average(e => e.Longitude),
                        id = representative.Id,
                        description = representative.Description,
                        type = representative.Type,
                        imageUrl = representative.ImageUrl,
                        tags = representative.Tags.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
                        createdByUserId = representative.CreatedByUserId,
                        createdByEmail = representative.CreatedByUser?.Email,
                        createdByFullName = representative.CreatedByUser?.FullName,
                        createdByAvatarUrl = representative.CreatedByUser?.AvatarUrl,
                        isVerifiedUser = representative.CreatedByUser?.IsVerified ?? false,
                        createdAt = representative.CreatedAt,
                        isActive = representative.IsActive,
                        isCompleted = representative.IsCompleted,
                    });
                }
                else
                {
                    foreach (var localCluster in globalGroup)
                    {
                        var localEvents = localCluster.ToList();
                        var localRep = localEvents.First();
                        result.Add(new
                        {
                            isCluster = true,
                            isGlobal = false,
                            reportCount = localEvents.Count,
                            neighbourhoodCount = 1,
                            emergencySubType = globalGroup.Key,
                            affectedNeighbourhoods = new List<string> { localCluster.Key.Neighbourhood! },
                            latitude = localEvents.Average(e => e.Latitude),
                            longitude = localEvents.Average(e => e.Longitude),
                            id = localRep.Id,
                            description = localRep.Description,
                            type = localRep.Type,
                            imageUrl = localRep.ImageUrl,
                            tags = localRep.Tags.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
                            createdByUserId = localRep.CreatedByUserId,
                            createdByEmail = localRep.CreatedByUser?.Email,
                            createdByFullName = localRep.CreatedByUser?.FullName,
                            createdByAvatarUrl = localRep.CreatedByUser?.AvatarUrl,
                            isVerifiedUser = localRep.CreatedByUser?.IsVerified ?? false,
                            createdAt = localRep.CreatedAt,
                            isActive = localRep.IsActive,
                            isCompleted = localRep.IsCompleted,
                        });
                    }
                }
            }

            return Ok(result.OrderByDescending(c => ((dynamic)c).reportCount));
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

            if ((dto.Type == EventType.LostPet || dto.Type == EventType.FoundPet) && imageUrl != null)
            {
                var eventId = result.Id;
                var capturedImageUrl = imageUrl;
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var aiTags = await _claudeVisionService.AnalyzePetImageAsync(capturedImageUrl);
                        Console.WriteLine($"[AI] Tags result for event {eventId}: {aiTags}");
                        if (aiTags != null)
                        {
                            using var scope = _scopeFactory.CreateScope();
                            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                            var createdEvent = await db.Events.FindAsync(eventId);
                            if (createdEvent != null)
                            {
                                createdEvent.AiTags = aiTags;
                                await db.SaveChangesAsync();
                                Console.WriteLine($"[AI] Saved AiTags for event {eventId}");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[AI] Error: {ex.Message}");
                    }
                });
            }

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

        [HttpGet("{id}/matches")]
        public async Task<IActionResult> GetPetMatches(int id)
        {
            var sourceEvent = await _context.Events
                .Include(e => e.CreatedByUser)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (sourceEvent == null) return NotFound();

            var oppositeType = sourceEvent.Type == EventType.LostPet
                ? EventType.FoundPet
                : EventType.LostPet;

            var candidates = await _context.Events
                .Include(e => e.CreatedByUser)
                .Where(e => e.Type == oppositeType && e.IsActive)
                .ToListAsync();

            var matches = new List<object>();

            foreach (var candidate in candidates)
            {
                double score = 0;

                if (sourceEvent.AiTags != null && candidate.AiTags != null)
                {
                    score = await _claudeVisionService.CalculateMatchScoreAsync(
                        sourceEvent.AiTags,
                        candidate.AiTags,
                        sourceEvent.Description,
                        candidate.Description
                    );
                }

                if (score >= 30)
                {
                    matches.Add(new
                    {
                        score = Math.Round(score),
                        @event = new
                        {
                            id = candidate.Id,
                            description = candidate.Description,
                            type = candidate.Type,
                            imageUrl = candidate.ImageUrl,
                            latitude = candidate.Latitude,
                            longitude = candidate.Longitude,
                            tags = candidate.Tags.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
                            createdByUserId = candidate.CreatedByUserId,
                            createdByEmail = candidate.CreatedByUser?.Email,
                            createdByFullName = candidate.CreatedByUser?.FullName,
                            createdByAvatarUrl = candidate.CreatedByUser?.AvatarUrl,
                            isVerifiedUser = candidate.CreatedByUser?.IsVerified ?? false,
                            createdAt = candidate.CreatedAt,
                            isActive = candidate.IsActive,
                        }
                    });
                }
            }

            var sorted = matches
                .OrderByDescending(m => ((dynamic)m).score)
                .ToList();

            return Ok(sorted);
        }

        [HttpPost("{id}/verify")]
        [Authorize]
        public async Task<IActionResult> VerifyEvent(int id, [FromBody] VerifyEventDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var ev = await _context.Events.FindAsync(id);
            if (ev == null) return NotFound();

            var existing = await _context.EventVerifications
                .FirstOrDefaultAsync(v => v.EventId == id && v.UserId == userId);

            if (existing != null)
            {
                if (existing.Vote == dto.Vote)
                    return Ok(new { yesCount = ev.YesCount, noCount = ev.NoCount, userVote = (bool?)existing.Vote });

                if (existing.Vote) { ev.YesCount--; ev.NoCount++; }
                else { ev.NoCount--; ev.YesCount++; }

                existing.Vote = dto.Vote;
            }
            else
            {
                _context.EventVerifications.Add(new EventVerification
                {
                    EventId = id,
                    UserId = userId,
                    Vote = dto.Vote
                });
                if (dto.Vote) ev.YesCount++;
                else ev.NoCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(new { yesCount = ev.YesCount, noCount = ev.NoCount, userVote = (bool?)dto.Vote });
        }

        [HttpGet("{id}/verify")]
        [Authorize]
        public async Task<IActionResult> GetVerifyStatus(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var ev = await _context.Events.FindAsync(id);
            if (ev == null) return NotFound();

            var existing = await _context.EventVerifications
                .FirstOrDefaultAsync(v => v.EventId == id && v.UserId == userId);

            return Ok(new { yesCount = ev.YesCount, noCount = ev.NoCount, userVote = existing != null ? (bool?)existing.Vote : null });
        }
    }
}