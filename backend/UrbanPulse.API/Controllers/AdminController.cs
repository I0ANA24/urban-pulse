using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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

    public AdminController(
        IAdminStatsRepository adminStatsRepository,
        IDuplicateSuspectRepository duplicateSuspectRepository,
        IUserRepository userRepository,
        AppDbContext context)
    {
        _adminStatsRepository = adminStatsRepository;
        _duplicateSuspectRepository = duplicateSuspectRepository;
        _userRepository = userRepository;
        _context = context;
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
}