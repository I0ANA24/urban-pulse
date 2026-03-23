namespace UrbanPulse.Core.DTOs.Chat;

public class ConversationDto
{
    public int Id { get; set; }
    public int OtherUserId { get; set; }
    public string OtherUserEmail { get; set; } = string.Empty;
    public string? OtherUserFullName { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
    public int? EventId { get; set; }
}