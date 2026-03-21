using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.DTOs.Events;
using UrbanPulse.Core.Interfaces;

namespace UrbanPulse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventController : Controller
    {
        private readonly IEventService _eventService;
        private readonly IHubContext<EventHub> _hubContext;

        public EventController(IEventService eventService, IHubContext<EventHub> hubContext)
        {
            _eventService = eventService;
            _hubContext = hubContext;
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
