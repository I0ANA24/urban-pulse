using UrbanPulse.Core.DTOs.Events;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

namespace UrbanPulse.Core.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;

        public EventService(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<EventResponseDto> CreateEventAsync(CreateEventDto dto, int userId, string? imageUrl)
        {
            var ev = new Event
            {
                Description = dto.Description,
                Type = dto.Type,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Tags = string.Join(",", dto.Tags),
                CreatedByUserId = userId,
                IsActive = true,
                ImageUrl = imageUrl,
                EmergencySubType = dto.EmergencySubType,
                Neighborhood = dto.Neighborhood
            };

            await _eventRepository.CreateAsync(ev);
            var created = await _eventRepository.GetByIdAsync(ev.Id);
            return MapToDto(created!);
        }

        public async Task<List<EventResponseDto>> GetAllActiveAsync()
        {
            var events = await _eventRepository.GetAllActiveAsync();
            return events.Select(MapToDto).ToList();
        }

        public async Task<List<EventResponseDto>> GetByRadiusAsync(double latitude, double longitude, double radiusKm)
        {
            var events = await _eventRepository.GetByRadiusAsync(latitude, longitude, radiusKm);
            return events.Select(MapToDto).ToList();
        }

        public async Task<IEnumerable<EventResponseDto>> GetByUserIdAsync(int userId)
        {
            var events = await _eventRepository.GetByUserIdAsync(userId);
            return events.Select(MapToDto);
        }

        public async Task<List<EventResponseDto>> GetByTypeAsync(string type)
        {
            if (!Enum.TryParse<EventType>(type, true, out var eventType))
                return new List<EventResponseDto>();
            var events = await _eventRepository.GetByTypeAsync(eventType);
            return events.Select(MapToDto).ToList();
        }

        public async Task<List<EventResponseDto>> SearchAsync(string query)
        {
            var events = await _eventRepository.SearchAsync(query);
            return events.Select(MapToDto).ToList();
        }

        public async Task CompleteEventAsync(int eventId, int userId)
        {
            var ev = await _eventRepository.GetByIdAsync(eventId);
            if (ev == null || ev.CreatedByUserId != userId) return;
            await _eventRepository.CompleteAsync(eventId);
        }

        public async Task DeactivateAsync(int id)
            => await _eventRepository.DeactivateAsync(id);

        private static EventResponseDto MapToDto(Event ev) => new()
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
            ClusterId = ev.ClusterId
        };
    }
}