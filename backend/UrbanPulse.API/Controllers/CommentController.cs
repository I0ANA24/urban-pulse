namespace UrbanPulse.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.DTOs.Comments;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

[ApiController]
[Route("api/event/{eventId}/comment")]
[Authorize]
public class CommentController : ControllerBase
{
    private readonly ICommentRepository _commentRepository;
    private readonly IHubContext<EventHub> _hubContext;

    public CommentController(ICommentRepository commentRepository, IHubContext<EventHub> hubContext)
    {
        _commentRepository = commentRepository;
        _hubContext = hubContext;
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
            EventId = c.EventId
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
            EventId = added.EventId
        };

        await _hubContext.Clients.All.SendAsync("NewComment", response);

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