namespace UrbanPulse.Core.DTOs;

public class DuplicateSuspectDto
{
    public int Id { get; set; }
    public int User1Id { get; set; }
    public string User1Name { get; set; } = string.Empty;
    public string? User1AvatarUrl { get; set; }
    public bool User1IsVerified { get; set; }
    public double User1TrustScore { get; set; }
    public DateTime User1CreatedAt { get; set; }

    public int User2Id { get; set; }
    public string User2Name { get; set; } = string.Empty;
    public string? User2AvatarUrl { get; set; }
    public bool User2IsVerified { get; set; }
    public double User2TrustScore { get; set; }
    public DateTime User2CreatedAt { get; set; }

    public string Confidence { get; set; } = string.Empty;
    public List<string> Reasons { get; set; } = new();
    public DateTime DetectedAt { get; set; }
}