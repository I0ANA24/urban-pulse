using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.DTOs.Clusters;
using UrbanPulse.Core.DTOs.Events;
using UrbanPulse.Core.Entities;
using UrbanPulse.Infrastructure.Data;
using StringSplitOptions = System.StringSplitOptions;

namespace UrbanPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClusterController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<EventHub> _hubContext;

    public ClusterController(AppDbContext db, IHubContext<EventHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var clusters = await _db.Clusters
            .Include(c => c.Events).ThenInclude(e => e.CreatedByUser)
            .Where(c => !c.IsResolved)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(clusters.Select(MapToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cluster = await _db.Clusters
            .Include(c => c.Events).ThenInclude(e => e.CreatedByUser)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cluster == null) return NotFound();
        return Ok(MapToDto(cluster));
    }

    [HttpPut("{id}/resolve")]
    public async Task<IActionResult> Resolve(int id)
    {
        var cluster = await _db.Clusters
            .Include(c => c.Events)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cluster == null) return NotFound();

        cluster.IsResolved = true;
        cluster.UpdatedAt = DateTime.UtcNow;

        foreach (var ev in cluster.Events)
        {
            ev.IsActive = false;
            ev.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        await _hubContext.Clients.All.SendAsync("ClusterResolved", id);
        return Ok();
    }

    private static ClusterResponseDto MapToDto(Cluster cluster)
    {
        var activeEvents = cluster.Events
            .Where(e => e.IsActive)
            .OrderByDescending(e => e.CreatedAt)
            .ToList();

        return new ClusterResponseDto
        {
            Id = cluster.Id,
            SubType = cluster.SubType,
            CenterLatitude = cluster.CenterLatitude,
            CenterLongitude = cluster.CenterLongitude,
            IsResolved = cluster.IsResolved,
            EventCount = activeEvents.Count,
            CreatedAt = cluster.CreatedAt,
            Neighborhood = cluster.Neighborhood,
            LatestEvent = activeEvents.Count > 0 ? MapEventToDto(activeEvents[0]) : null,
            Events = activeEvents.Select(MapEventToDto).ToList(),
        };
    }

    private static EventResponseDto MapEventToDto(Event ev) => new()
    {
        Id = ev.Id,
        Description = ev.Description,
        Type = ev.Type,
        ImageUrl = ev.ImageUrl,
        Latitude = ev.Latitude,
        Longitude = ev.Longitude,
        Tags = ev.Tags.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
        CreatedByUserId = ev.CreatedByUserId,
        CreatedByEmail = ev.CreatedByUser?.Email ?? string.Empty,
        CreatedByFullName = ev.CreatedByUser?.FullName,
        CreatedByAvatarUrl = ev.CreatedByUser?.AvatarUrl,
        IsVerifiedUser = ev.CreatedByUser?.IsVerified ?? false,
        CreatedAt = ev.CreatedAt,
        IsActive = ev.IsActive,
        IsCompleted = ev.IsCompleted,
        EmergencySubType = ev.EmergencySubType,
        Neighborhood = ev.Neighborhood,
        ClusterId = ev.ClusterId,
    };
}
