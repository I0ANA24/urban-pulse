using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanPulse.Core.DTOs.Events;

namespace UrbanPulse.Core.Interfaces
{
    public interface IEventService
    {
        Task<EventResponseDto> CreateEventAsync(CreateEventDto dto, int userId, string? imageUrl);
        Task<List<EventResponseDto>> GetAllActiveAsync();
        Task<List<EventResponseDto>> GetByRadiusAsync(double latitude, double longitude, double radiusKm);
        Task<List<EventResponseDto>> GetByTypeAsync(string type);
        Task DeactivateAsync(int id);
    }
}
