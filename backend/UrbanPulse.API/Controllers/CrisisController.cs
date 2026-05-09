using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.DTOs.Clusters;
using UrbanPulse.Core.Entities;
using UrbanPulse.Infrastructure.Data;

namespace UrbanPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CrisisController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<EventHub> _hubContext;

    public CrisisController(AppDbContext db, IHubContext<EventHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var crises = await _db.GlobalCrises
            .Where(g => g.IsActive)
            .OrderByDescending(g => g.CreatedAt)
            .Select(g => new GlobalCrisisDto
            {
                Id = g.Id,
                SubType = g.SubType,
                IsActive = g.IsActive,
                IsManuallyActivated = g.IsManuallyActivated,
                CreatedAt = g.CreatedAt,
            })
            .ToListAsync();

        return Ok(crises);
    }

    [HttpPost("activate")]
    public async Task<IActionResult> Activate([FromBody] ActivateCrisisDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.SubType))
            return BadRequest(new { message = "SubType is required." });

        var existing = await _db.GlobalCrises
            .FirstOrDefaultAsync(g => g.SubType == dto.SubType && g.IsActive);

        if (existing != null)
            return Ok(MapToDto(existing));

        var crisis = new GlobalCrisis
        {
            SubType = dto.SubType,
            IsActive = true,
            IsManuallyActivated = true,
            CreatedAt = DateTime.UtcNow,
        };
        _db.GlobalCrises.Add(crisis);
        await _db.SaveChangesAsync();

        var crisisDto = MapToDto(crisis);
        await _hubContext.Clients.All.SendAsync("GlobalCrisisActivated", crisisDto);
        return Ok(crisisDto);
    }

    [HttpPut("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var crisis = await _db.GlobalCrises.FindAsync(id);
        if (crisis == null) return NotFound();

        crisis.IsActive = false;
        crisis.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("GlobalCrisisDeactivated", new { id, subType = crisis.SubType });
        return Ok();
    }

    private static GlobalCrisisDto MapToDto(GlobalCrisis g) => new()
    {
        Id = g.Id,
        SubType = g.SubType,
        IsActive = g.IsActive,
        IsManuallyActivated = g.IsManuallyActivated,
        CreatedAt = g.CreatedAt,
    };
}

public class ActivateCrisisDto
{
    public string SubType { get; set; } = string.Empty;
}
