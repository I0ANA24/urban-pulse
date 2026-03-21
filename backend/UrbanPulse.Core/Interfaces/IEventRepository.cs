using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanPulse.Core.Entities;

namespace UrbanPulse.Core.Interfaces
{
    public interface IEventRepository
    {
        Task<Event> CreateAsync(Event ev);
        Task<Event?> GetByIdAsync(int id);
        Task<List<Event>> GetAllActiveAsync();
        Task<List<Event>> GetByRadiusAsync(double latitude, double longitude, double radiusKm);
        Task<List<Event>> GetByTypeAsync(EventType type);
        Task DeactivateAsync(int id);
    }
}
