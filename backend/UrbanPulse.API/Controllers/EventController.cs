using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.DTOs.Events;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Core.Entities;

namespace UrbanPulse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IHubContext<EventHub> _hubContext;
        private readonly IConversationRepository _conversationRepository;

        public EventController(IEventService eventService, IHubContext<EventHub> hubContext, IConversationRepository conversationRepository)
        {
            _eventService = eventService;
            _hubContext = hubContext;
            _conversationRepository = conversationRepository;
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

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await file.CopyToAsync(stream);

                imageUrl = $"/uploads/{fileName}";
            }

            var result = await _eventService.CreateEventAsync(dto, userId, imageUrl);
            await _hubContext.Clients.All.SendAsync("NewEvent", result);

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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deactivate(int id)
        {
            await _eventService.DeactivateAsync(id);
            await _hubContext.Clients.All.SendAsync("EventDeactivated", id);
            return Ok();
        }
    }
}
