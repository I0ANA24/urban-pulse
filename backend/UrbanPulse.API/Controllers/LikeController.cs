namespace UrbanPulse.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

[ApiController]
[Route("api/event/{eventId}/like")]
[Authorize]
public class LikeController : ControllerBase
{
    private readonly ILikeRepository _likeRepository;
    private readonly IHubContext<EventHub> _hubContext;

    public LikeController(ILikeRepository likeRepository, IHubContext<EventHub> hubContext)
    {
        _likeRepository = likeRepository;
        _hubContext = hubContext;
    }

    [HttpPost]
    public async Task<IActionResult> ToggleLike(int eventId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var existing = await _likeRepository.GetByUserAndEventAsync(userId, eventId);

        if (existing != null)
            {
                await _likeRepository.DeleteAsync(existing);
                var count = await _likeRepository.GetLikeCountAsync(eventId);
                await _hubContext.Clients.All.SendAsync("LikeUpdated", new { eventId, count });
                return Ok(new { liked = false, count });
            }
            else
            {
                var like = new Like { UserId = userId, EventId = eventId };
                await _likeRepository.AddAsync(like);
                var count = await _likeRepository.GetLikeCountAsync(eventId);
                await _hubContext.Clients.All.SendAsync("LikeUpdated", new { eventId, count });
                return Ok(new { liked = true, count });
            }
    }

    [HttpGet]
    public async Task<IActionResult> GetLikes(int eventId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var count = await _likeRepository.GetLikeCountAsync(eventId);
        var liked = await _likeRepository.GetByUserAndEventAsync(userId, eventId) != null;
        return Ok(new { liked, count });
    }
}