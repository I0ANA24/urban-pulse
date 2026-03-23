namespace UrbanPulse.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.DTOs.Chat;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IHubContext<EventHub> _hubContext;

    public ChatController(IConversationRepository conversationRepository, IHubContext<EventHub> hubContext)
    {
        _conversationRepository = conversationRepository;
        _hubContext = hubContext;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var conversations = await _conversationRepository.GetByUserIdAsync(userId);

        var result = conversations.Select(c =>
        {
            var otherUser = c.User1Id == userId ? c.User2 : c.User1;
            var lastMsg = c.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault();
            return new ConversationDto
            {
                Id = c.Id,
                OtherUserId = otherUser.Id,
                OtherUserEmail = otherUser.Email,
                OtherUserFullName = otherUser.FullName,
                LastMessage = lastMsg?.Text,
                LastMessageAt = lastMsg?.CreatedAt,
                UnreadCount = c.Messages.Count(m => m.SenderId != userId && !m.IsRead),
                EventId = c.EventId
            };
        });

        return Ok(result);
    }

    [HttpPost("conversations")]
    public async Task<IActionResult> StartConversation([FromBody] StartConversationDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var existing = await _conversationRepository.GetByUsersAsync(userId, dto.OtherUserId);
        if (existing != null) return Ok(new { conversationId = existing.Id });

        var conversation = new Conversation
        {
            User1Id = userId,
            User2Id = dto.OtherUserId,
            EventId = dto.EventId
        };

        var created = await _conversationRepository.CreateAsync(conversation);
        return Ok(new { conversationId = created.Id });
    }

    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<IActionResult> GetMessages(int conversationId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);

        if (conversation == null) return NotFound();
        if (conversation.User1Id != userId && conversation.User2Id != userId) return Forbid();

        await _conversationRepository.MarkAsReadAsync(conversationId, userId);

        var messages = await _conversationRepository.GetMessagesAsync(conversationId);
        var result = messages.Select(m => new MessageDto
        {
            Id = m.Id,
            Text = m.Text,
            SenderId = m.SenderId,
            SenderEmail = m.Sender.Email,
            SenderFullName = m.Sender.FullName,
            CreatedAt = m.CreatedAt,
            IsRead = m.IsRead,
            MessageType = m.MessageType
        });

        return Ok(result);
    }

    [HttpPost("conversations/{conversationId}/messages")]
    public async Task<IActionResult> SendMessage(int conversationId, [FromBody] SendMessageDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);

        if (conversation == null) return NotFound();
        if (conversation.User1Id != userId && conversation.User2Id != userId) return Forbid();

        var message = new Message
        {
            Text = dto.Text,
            SenderId = userId,
            ConversationId = conversationId
        };

        var saved = await _conversationRepository.AddMessageAsync(message);

        var msgDto = new MessageDto
        {
            Id = saved.Id,
            Text = saved.Text,
            SenderId = saved.SenderId,
            SenderEmail = conversation.User1Id == userId ? conversation.User1.Email : conversation.User2.Email,
            SenderFullName = conversation.User1Id == userId ? conversation.User1.FullName : conversation.User2.FullName,
            CreatedAt = saved.CreatedAt,
            IsRead = false
        };

        await _hubContext.Clients.All.SendAsync($"NewMessage_{conversationId}", msgDto);

        return Ok(msgDto);
    }
}