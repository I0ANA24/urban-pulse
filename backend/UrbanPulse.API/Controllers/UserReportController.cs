using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UrbanPulse.Core.DTOs;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

namespace UrbanPulse.API.Controllers;

[ApiController]
[Route("api/user-report")]
[Authorize]
public class UserReportController : ControllerBase
{
    private readonly IUserReportRepository _userReportRepository;

    public UserReportController(IUserReportRepository userReportRepository)
    {
        _userReportRepository = userReportRepository;
    }

    [HttpPost]
    public async Task<IActionResult> ReportUser([FromBody] UserReportDto dto)
    {
        var reporterIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(reporterIdStr, out var reporterId))
            return Unauthorized();

        if (reporterId == dto.ReportedUserId)
            return BadRequest(new { message = "You cannot report yourself." });

        var alreadyReported = await _userReportRepository.ExistsAsync(reporterId, dto.ReportedUserId);
        if (alreadyReported)
            return BadRequest(new { message = "You have already reported this user." });

        var report = new UserReport
        {
            ReporterUserId = reporterId,
            ReportedUserId = dto.ReportedUserId,
            Details = dto.Details,
            CreatedAt = DateTime.UtcNow
        };

        await _userReportRepository.AddAsync(report);
        await _userReportRepository.SaveChangesAsync();

        return Ok(new { message = "User reported successfully." });
    }
}