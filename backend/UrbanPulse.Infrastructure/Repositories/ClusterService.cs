using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;
using UrbanPulse.Infrastructure.Data;

namespace UrbanPulse.Infrastructure.Repositories;

public class ClusterService
{
    private readonly AppDbContext _db;
    private const double ClusterRadiusKm = 0.5;
    private const int TimeWindowHours = 24;

    public ClusterService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(Cluster? cluster, string action)> TryClusterAsync(Event newEvent)
    {
        if (newEvent.Type != EventType.Emergency || string.IsNullOrWhiteSpace(newEvent.EmergencySubType))
            return (null, "none");

        // 1. Look for an existing active cluster with same SubType nearby
        var activeClusters = await _db.Clusters
            .Include(c => c.Events)
            .Where(c => !c.IsResolved && c.SubType == newEvent.EmergencySubType)
            .ToListAsync();

        var nearbyCluster = activeClusters.FirstOrDefault(c =>
            !string.IsNullOrEmpty(newEvent.Neighborhood) && !string.IsNullOrEmpty(c.Neighborhood)
                ? c.Neighborhood == newEvent.Neighborhood
                : HaversineKm(c.CenterLatitude, c.CenterLongitude, newEvent.Latitude, newEvent.Longitude) <= ClusterRadiusKm);

        if (nearbyCluster != null)
        {
            newEvent.ClusterId = nearbyCluster.Id;
            newEvent.YesCount = 3;
            RecalculateCenter(nearbyCluster);
            await _db.SaveChangesAsync();
            return (nearbyCluster, "updated");
        }

        // 2. No existing cluster — look for a matching standalone event within 24h
        var cutoff = DateTime.UtcNow.AddHours(-TimeWindowHours);
        var candidates = await _db.Events
            .Include(e => e.CreatedByUser)
            .Where(e =>
                e.Id != newEvent.Id &&
                e.Type == EventType.Emergency &&
                e.EmergencySubType == newEvent.EmergencySubType &&
                e.IsActive &&
                e.ClusterId == null &&
                e.CreatedByUserId != newEvent.CreatedByUserId &&
                e.CreatedAt >= cutoff)
            .ToListAsync();

        var matchingEvent = candidates.FirstOrDefault(e =>
            !string.IsNullOrEmpty(newEvent.Neighborhood) && !string.IsNullOrEmpty(e.Neighborhood)
                ? e.Neighborhood == newEvent.Neighborhood
                : HaversineKm(e.Latitude, e.Longitude, newEvent.Latitude, newEvent.Longitude) <= ClusterRadiusKm);

        if (matchingEvent == null)
            return (null, "none");

        // 3. Create a new cluster with both events
        var cluster = new Cluster
        {
            SubType = newEvent.EmergencySubType,
            CenterLatitude = (newEvent.Latitude + matchingEvent.Latitude) / 2,
            CenterLongitude = (newEvent.Longitude + matchingEvent.Longitude) / 2,
            Neighborhood = newEvent.Neighborhood,
            CreatedAt = DateTime.UtcNow,
        };
        _db.Clusters.Add(cluster);
        await _db.SaveChangesAsync();

        newEvent.ClusterId = cluster.Id;
        newEvent.YesCount = 3;
        matchingEvent.ClusterId = cluster.Id;
        matchingEvent.YesCount = 3;
        await _db.SaveChangesAsync();

        // Re-load with events for the DTO
        cluster = await _db.Clusters.Include(c => c.Events).ThenInclude(e => e.CreatedByUser)
            .FirstAsync(c => c.Id == cluster.Id);

        return (cluster, "created");
    }

    public async Task<(int? clusterId, string action)> HandleEventDeletedAsync(Event deletedEvent)
    {
        if (deletedEvent.ClusterId == null)
            return (null, "none");

        var clusterId = deletedEvent.ClusterId.Value;
        var cluster = await _db.Clusters
            .Include(c => c.Events)
            .FirstOrDefaultAsync(c => c.Id == clusterId);

        if (cluster == null)
            return (null, "none");

        var remaining = cluster.Events.Where(e => e.IsActive && e.Id != deletedEvent.Id).ToList();

        if (remaining.Count < 2)
        {
            foreach (var ev in cluster.Events)
            {
                ev.ClusterId = null;
                ev.YesCount = 0;
            }
            _db.Clusters.Remove(cluster);
            await _db.SaveChangesAsync();
            return (clusterId, "dissolved");
        }

        cluster.CenterLatitude = remaining.Average(e => e.Latitude);
        cluster.CenterLongitude = remaining.Average(e => e.Longitude);
        cluster.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return (clusterId, "updated");
    }

    private static void RecalculateCenter(Cluster cluster)
    {
        var events = cluster.Events.Where(e => e.IsActive).ToList();
        if (!events.Any()) return;
        cluster.CenterLatitude = events.Average(e => e.Latitude);
        cluster.CenterLongitude = events.Average(e => e.Longitude);
        cluster.UpdatedAt = DateTime.UtcNow;
    }

    private static double HaversineKm(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}
