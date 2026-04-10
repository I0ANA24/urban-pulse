using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.DTOs;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

namespace UrbanPulse.Infrastructure.Repositories;

public class AdminStatsRepository : IAdminStatsRepository
{
    private readonly AppDbContext _context;

    public AdminStatsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var totalPosts = await _context.Events.CountAsync();
        var totalUsers = await _context.Users.CountAsync();
        var verifiedUsers = await _context.Users.CountAsync(u => u.IsVerified);
        var unverifiedUsers = totalUsers - verifiedUsers;

        var dailyNewUsers = await _context.Users
            .CountAsync(u => u.CreatedAt >= today && u.CreatedAt < tomorrow);

        var dailyPosts = await _context.Events
            .CountAsync(e => e.CreatedAt >= today && e.CreatedAt < tomorrow);

        var dailyFlaggedPosts = await _context.Reports
            .Where(r => r.CreatedAt >= today && r.CreatedAt < tomorrow)
            .Select(r => r.EventId)
            .Distinct()
            .CountAsync();

        var dailyFlaggedUsers = await _context.UserReports
            .Where(r => r.CreatedAt >= today && r.CreatedAt < tomorrow)
            .Select(r => r.ReportedUserId)
            .Distinct()
            .CountAsync();

        var totalTasks = await _context.Reports.CountAsync()
                       + await _context.UserReports.CountAsync();

        var resolvedTasks = 0;

        var flaggedUsersCount = await _context.UserReports
        .Select(r => r.ReportedUserId)
        .Distinct()
        .CountAsync();

    var flaggedContentCount = await _context.Reports
        .Select(r => r.EventId)
        .Distinct()
        .CountAsync();

    var mergeDuplicatesCount = await _context.DuplicateSuspects
        .CountAsync(d => !d.IsDismissed);
     
        return new AdminStatsDto
        {
            TotalTasks = totalTasks,
            ResolvedTasks = resolvedTasks,
            DailyNewUsers = dailyNewUsers,
            DailyPosts = dailyPosts,
            DailyFlaggedPosts = dailyFlaggedPosts,
            DailyFlaggedUsers = dailyFlaggedUsers,
            TotalPosts = totalPosts,
            TotalUsers = totalUsers,
            VerifiedUsers = verifiedUsers,
            UnverifiedUsers = unverifiedUsers,
            FlaggedUsersCount = flaggedUsersCount,
            FlaggedContentCount = flaggedContentCount,
            MergeDuplicatesCount = mergeDuplicatesCount
        };
    }
}