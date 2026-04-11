namespace UrbanPulse.Core.DTOs.Comments;

public class CommentResponseDto
{
    public int Id { get; set; }
    public string? FullName { get; set; }
    public string Text { get; set; } = string.Empty;
    public string CreatedByEmail { get; set; } = string.Empty;
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int EventId { get; set; }
    public string? AvatarUrl { get; set; }
}