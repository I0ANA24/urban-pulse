namespace UrbanPulse.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.DTOs.Comments;
using UrbanPulse.Core.DTOs.Notifications;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

[ApiController]
[Route("api/event/{eventId}/comment")]
[Authorize]
public class CommentController : ControllerBase
{
    private readonly ICommentRepository _commentRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;
    private readonly IHubContext<EventHub> _hubContext;
    private readonly IHubContext<NotificationHub> _notificationHub;

    public CommentController(
        ICommentRepository commentRepository,
        IEventRepository eventRepository,
        IUserRepository userRepository,
        INotificationService notificationService,
        IHubContext<EventHub> hubContext,
        IHubContext<NotificationHub> notificationHub)
    {
        _commentRepository = commentRepository;
        _eventRepository = eventRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
        _hubContext = hubContext;
        _notificationHub = notificationHub;
    }

    [HttpGet]
    public async Task<IActionResult> GetComments(int eventId)
    {
        var comments = await _commentRepository.GetByEventIdAsync(eventId);
        var result = comments.Select(c => new CommentResponseDto
        {
            Id = c.Id,
            Text = c.Text,
            CreatedByEmail = c.User.Email,
            FullName = c.User.FullName,
            CreatedByUserId = c.UserId,
            CreatedAt = c.CreatedAt,
            EventId = c.EventId,
            AvatarUrl = c.User.AvatarUrl,
        });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddComment(int eventId, [FromBody] CreateCommentDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var comment = new Comment
        {
            Text = dto.Text,
            UserId = userId,
            EventId = eventId,
        };

        await _commentRepository.AddAsync(comment);
        var added = await _commentRepository.GetByIdAsync(comment.Id);

        var response = new CommentResponseDto
        {
            Id = added!.Id,
            Text = added.Text,
            CreatedByEmail = added.User.Email,
            FullName = added.User.FullName,
            CreatedByUserId = added.UserId,
            CreatedAt = added.CreatedAt,
            EventId = added.EventId,
            AvatarUrl = added.User.AvatarUrl,
        };

        await _hubContext.Clients.All.SendAsync("NewComment", response);

        // Notificare catre autorul postarii (doar daca nu e acelasi user)
        var ev = await _eventRepository.GetByIdAsync(eventId);
        if (ev != null && ev.CreatedByUserId != userId)
        {
            var commenter = await _userRepository.GetByIdAsync(userId);
            var commenterName = commenter?.FullName ?? commenter?.Email?.Split('@')[0] ?? "S";

            var notification = await _notificationService.SendAsync(new CreateNotificationDto
            {
                UserId = ev.CreatedByUserId,
                Title = commenterName,
                Body = $"commented on your post: \"{dto.Text.Substring(0, Math.Min(dto.Text.Length, 50))}{(dto.Text.Length > 50 ? "..." : "")}\"",
                Type = NotificationType.Comment,
                ActionUrl = $"/dashboard?eventId={eventId}",
                RelatedEventId = eventId,
                SenderAvatarUrl = commenter?.AvatarUrl,
            });

            await _notificationHub.Clients.User(ev.CreatedByUserId.ToString())
                .SendAsync("NewNotification", notification);
        }

        return Ok(response);
    }

    [HttpDelete("{commentId}")]
    public async Task<IActionResult> DeleteComment(int eventId, int commentId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var comment = await _commentRepository.GetByIdAsync(commentId);

        if (comment == null) return NotFound();
        if (comment.UserId != userId) return Forbid();

        await _commentRepository.DeleteAsync(comment);
        await _hubContext.Clients.All.SendAsync("CommentDeleted", new { commentId, eventId });

        return Ok();
    }
}