using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

namespace UrbanPulse.Infrastructure.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _db;

        public EventRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Event> CreateAsync(Event ev)
        {
            await _db.Events.AddAsync(ev);
            await _db.SaveChangesAsync();
            return ev;
        }

        public async Task<Event?> GetByIdAsync(int id)
            => await _db.Events
                .Include(e => e.CreatedByUser)
                .FirstOrDefaultAsync(e => e.Id == id);

        public async Task<List<Event>> GetAllActiveAsync()
            => await _db.Events
                .Include(e => e.CreatedByUser)
                .Where(e => e.IsActive)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

        public async Task<List<Event>> GetByRadiusAsync(double latitude, double longitude, double radiusKm)
        {
            const double EarthRadiusKm = 6371;

            var events = await _db.Events
                .Include(e => e.CreatedByUser)
                .Where(e => e.IsActive)
                .ToListAsync();

            return events.Where(e =>
            {
                var dLat = ToRad(e.Latitude - latitude);
                var dLon = ToRad(e.Longitude - longitude);
                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                        Math.Cos(ToRad(latitude)) * Math.Cos(ToRad(e.Latitude)) *
                        Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                var distance = EarthRadiusKm * c;
                return distance <= radiusKm;
            }).ToList();
        }

        public async Task<List<Event>> GetByTypeAsync(EventType type)
            => await _db.Events
                .Include(e => e.CreatedByUser)
                .Where(e => e.IsActive && e.Type == type)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

        public async Task DeactivateAsync(int id)
        {
            var ev = await _db.Events.FindAsync(id);
            if (ev != null)
            {
                ev.IsActive = false;
                await _db.SaveChangesAsync();
            }
        }

        private static double ToRad(double deg) => deg * Math.PI / 180;

    }
}
