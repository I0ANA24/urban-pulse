namespace UrbanPulse.Core.DTOs.Chat;

public class MessageDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int SenderId { get; set; }
    public string SenderEmail { get; set; } = string.Empty;
    public string? SenderFullName { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public string? MessageType { get; set; }
}