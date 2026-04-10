namespace UrbanPulse.Core.DTOs;

public class UserReportDto
{
    public int ReportedUserId { get; set; }
    public string Details { get; set; } = string.Empty;
}