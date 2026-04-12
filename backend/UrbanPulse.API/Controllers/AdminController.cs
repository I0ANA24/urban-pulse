using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.DTOs;
using UrbanPulse.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace UrbanPulse.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminStatsRepository _adminStatsRepository;
    private readonly IDuplicateSuspectRepository _duplicateSuspectRepository;
    private readonly IUserRepository _userRepository;
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _notificationHub;
    private readonly IHubContext<EventHub> _eventHub;
    private readonly IEventService _eventService;

    public AdminController(
        IAdminStatsRepository adminStatsRepository,
        IDuplicateSuspectRepository duplicateSuspectRepository,
        IUserRepository userRepository,
        AppDbContext context,
        IHubContext<NotificationHub> notificationHub,
        IHubContext<EventHub> eventHub,
        IEventService eventService)
    {
        _adminStatsRepository = adminStatsRepository;
        _duplicateSuspectRepository = duplicateSuspectRepository;
        _userRepository = userRepository;
        _context = context;
        _notificationHub = notificationHub;
        _eventHub = eventHub;
        _eventService = eventService;
    }

    private async Task<UrbanPulse.Core.Entities.User?> GetCurrentAdminAsync()
    {
        var adminIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(adminIdStr, out var adminId)) return null;
        return await _context.Users.FindAsync(adminId);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _adminStatsRepository.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("duplicates")]
    public async Task<IActionResult> GetDuplicates()
    {
        var duplicates = await _duplicateSuspectRepository.GetAllActiveAsync();
        return Ok(duplicates);
    }

    [HttpPut("duplicates/{id}/dismiss")]
    public async Task<IActionResult> DismissDuplicate(int id)
    {
        var suspect = await _duplicateSuspectRepository.GetByIdAsync(id);
        if (suspect == null) return NotFound();

        suspect.IsDismissed = true;
        await _duplicateSuspectRepository.SaveChangesAsync();

        var admin = await GetCurrentAdminAsync();
        if (admin != null) { admin.TasksDismissed++; await _context.SaveChangesAsync(); }

        return Ok();
    }

    [HttpDelete("duplicates/{id}/merge")]
    public async Task<IActionResult> MergeDuplicate(int id, [FromQuery] int keepUserId)
    {
        var suspect = await _duplicateSuspectRepository.GetByIdAsync(id);
        if (suspect == null) return NotFound();

        int deleteUserId = suspect.User1Id == keepUserId
            ? suspect.User2Id
            : suspect.User1Id;

        var userToDelete = await _userRepository.GetByIdAsync(deleteUserId);
        if (userToDelete == null) return NotFound();

        await _userRepository.DeleteAsync(userToDelete);

        suspect.IsDismissed = true;
        await _duplicateSuspectRepository.SaveChangesAsync();

        var admin = await GetCurrentAdminAsync();
        if (admin != null) { admin.TasksDuplicatesMerged++; await _context.SaveChangesAsync(); }

        return Ok(new { message = "Duplicate merged successfully." });
    }

    [HttpGet("flagged-users")]
    public async Task<IActionResult> GetFlaggedUsers()
    {
        var flaggedUsers = await _context.UserReports
            .GroupBy(r => r.ReportedUserId)
            .Select(g => new
            {
                UserId = g.Key,
                UserName = g.First().ReportedUser.FullName ?? g.First().ReportedUser.Email,
                AvatarUrl = g.First().ReportedUser.AvatarUrl,
                TrustScore = g.First().ReportedUser.TrustScore,
                ReportsCount = g.Count()
            })
            .OrderByDescending(x => x.ReportsCount)
            .ToListAsync();

        return Ok(flaggedUsers);
    }

    [HttpGet("flagged-users/{userId}")]
    public async Task<IActionResult> GetFlaggedUserDetail(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var reports = await _context.UserReports
            .Where(r => r.ReportedUserId == userId)
            .Include(r => r.ReporterUser)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                Id = r.Id,
                ReporterName = r.ReporterUser.FullName ?? r.ReporterUser.Email,
                ReporterAvatarUrl = r.ReporterUser.AvatarUrl,
                Details = r.Details,
                CreatedAt = r.CreatedAt,
            })
            .ToListAsync();

        return Ok(new
        {
            UserId = user.Id,
            UserName = user.FullName ?? user.Email,
            AvatarUrl = user.AvatarUrl,
            TrustScore = user.TrustScore,
            ReportsCount = reports.Count,
            Reports = reports,
        });
    }

    [HttpDelete("flagged-users/{userId}/dismiss")]
    public async Task<IActionResult> DismissFlaggedUser(int userId)
    {
        var reports = await _context.UserReports
            .Where(r => r.ReportedUserId == userId)
            .ToListAsync();
        _context.UserReports.RemoveRange(reports);
        await _context.SaveChangesAsync();

        var admin = await GetCurrentAdminAsync();
        if (admin != null) { admin.TasksDismissed++; await _context.SaveChangesAsync(); }

        return Ok();
    }

    [HttpPost("flagged-users/{userId}/ban")]
    public async Task<IActionResult> BanUser(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.IsBanned = true;
        user.BannedAt = DateTime.UtcNow;

        var reports = await _context.UserReports
            .Where(r => r.ReportedUserId == userId)
            .ToListAsync();
        _context.UserReports.RemoveRange(reports);
        await _context.SaveChangesAsync();

        var admin = await GetCurrentAdminAsync();
        if (admin != null) { admin.TasksBanned++; await _context.SaveChangesAsync(); }

        await _notificationHub.Clients.User(userId.ToString())
            .SendAsync("UserBanned");

        return Ok();
    }

    [HttpGet("banned-users")]
    public async Task<IActionResult> GetBannedUsers()
    {
        var users = await _context.Users
            .Where(u => u.IsBanned)
            .Select(u => new
            {
                Id = u.Id.ToString(),
                Name = u.FullName ?? u.Email,
                Avatar = u.AvatarUrl,
                BannedOn = u.BannedAt.HasValue ? u.BannedAt.Value.ToString("dd/MM/yyyy") : "",
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("banned-users/{userId}/unban")]
    public async Task<IActionResult> UnbanUser(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.IsBanned = false;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("users/{userId}/make-admin")]
    public async Task<IActionResult> MakeAdmin(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.Role = "Admin";
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("users/{userId}/make-user")]
    public async Task<IActionResult> MakeUser(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.Role = "User";
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("flagged-content")]
    public async Task<IActionResult> GetFlaggedContent()
    {
        var flaggedEvents = await _context.Reports
            .GroupBy(r => r.EventId)
            .Select(g => new
            {
                EventId = g.Key,
                FlagCount = g.Count()
            })
            .Join(_context.Events.Include(e => e.CreatedByUser),
                r => r.EventId,
                e => e.Id,
                (r, e) => new
                {
                    e.Id,
                    e.Description,
                    e.Type,
                    e.Latitude,
                    e.Longitude,
                    e.Tags,
                    e.ImageUrl,
                    e.CreatedAt,
                    e.IsActive,
                    CreatedByUserId = e.CreatedByUserId,
                    CreatedByEmail = e.CreatedByUser.Email,
                    CreatedByFullName = e.CreatedByUser.FullName,
                    CreatedByAvatarUrl = e.CreatedByUser.AvatarUrl,
                    FlagCount = r.FlagCount,
                })
            .OrderByDescending(e => e.FlagCount)
            .ToListAsync();

        return Ok(flaggedEvents);
    }

    [HttpGet("flagged-content/{eventId}")]
    public async Task<IActionResult> GetFlaggedContentDetail(int eventId)
    {
        var ev = await _context.Events
            .Include(e => e.CreatedByUser)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (ev == null) return NotFound();

        var reports = await _context.Reports
            .Where(r => r.EventId == eventId)
            .Include(r => r.ReportedByUser)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                Id = r.Id,
                ReporterName = r.ReportedByUser.FullName ?? r.ReportedByUser.Email,
                ReporterAvatarUrl = r.ReportedByUser.AvatarUrl,
                Details = r.Details,
                CreatedAt = r.CreatedAt,
            })
            .ToListAsync();

        return Ok(new
        {
            ev.Id,
            ev.Description,
            ev.Type,
            ev.Tags,
            ev.ImageUrl,
            ev.CreatedAt,
            CreatedByUserId = ev.CreatedByUserId,
            CreatedByFullName = ev.CreatedByUser?.FullName ?? ev.CreatedByUser?.Email,
            CreatedByAvatarUrl = ev.CreatedByUser?.AvatarUrl,
            FlagCount = reports.Count,
            Reports = reports,
        });
    }

    [HttpDelete("flagged-content/{eventId}")]
    public async Task<IActionResult> DeleteFlaggedContent(int eventId)
    {
        var reports = await _context.Reports
            .Where(r => r.EventId == eventId)
            .ToListAsync();
        _context.Reports.RemoveRange(reports);
        await _context.SaveChangesAsync();

        await _eventService.DeactivateAsync(eventId);
        await _eventHub.Clients.All.SendAsync("EventDeactivated", eventId);

        var admin = await GetCurrentAdminAsync();
        if (admin != null) { admin.TasksPostsDeleted++; await _context.SaveChangesAsync(); }

        return Ok();
    }

    [HttpDelete("flagged-content/{eventId}/dismiss")]
    public async Task<IActionResult> DismissFlaggedContent(int eventId)
    {
        var reports = await _context.Reports
            .Where(r => r.EventId == eventId)
            .ToListAsync();
        _context.Reports.RemoveRange(reports);
        await _context.SaveChangesAsync();

        var admin = await GetCurrentAdminAsync();
        if (admin != null) { admin.TasksDismissed++; await _context.SaveChangesAsync(); }

        return Ok();
    }
}