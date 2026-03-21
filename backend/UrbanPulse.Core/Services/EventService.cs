using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
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
                ImageUrl = imageUrl
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

        public async Task<List<EventResponseDto>> GetByTypeAsync(string type)
        {
            if (!Enum.TryParse<EventType>(type, true, out var eventType))
                return new List<EventResponseDto>();

            var events = await _eventRepository.GetByTypeAsync(eventType);
            return events.Select(MapToDto).ToList();
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
            CreatedAt = ev.CreatedAt,
            IsActive = ev.IsActive
        };
    }
}
