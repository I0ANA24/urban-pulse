namespace UrbanPulse.Core.DTOs;

public class AdminStatsDto
{
    public int TotalTasks { get; set; }
    public int ResolvedTasks { get; set; }

    public int DailyNewUsers { get; set; }
    public int DailyPosts { get; set; }
    public int DailyFlaggedPosts { get; set; }
    public int DailyFlaggedUsers { get; set; }

    public int TotalPosts { get; set; }
    public int TotalUsers { get; set; }
    public int VerifiedUsers { get; set; }
    public int UnverifiedUsers { get; set; }

    public int FlaggedUsersCount { get; set; }
    public int FlaggedContentCount { get; set; }
    public int MergeDuplicatesCount { get; set; }
}