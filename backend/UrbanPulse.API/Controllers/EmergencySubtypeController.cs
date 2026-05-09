using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.DTOs.EmergencySubtypes;
using UrbanPulse.Core.Entities;
using UrbanPulse.Infrastructure.Data;

namespace UrbanPulse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmergencySubtypeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmergencySubtypeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var subtypes = await _context.EmergencySubtypes
                .OrderBy(s => s.Name)
                .Select(s => new EmergencySubtypeResponseDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();
            return Ok(subtypes);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmergencySubtypeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Name is required." });

            var duplicate = await _context.EmergencySubtypes
                .AnyAsync(s => s.Name.ToLower() == dto.Name.ToLower());
            if (duplicate)
                return Conflict(new { message = "Subtype already exists." });

            var subtype = new EmergencySubtype
            {
                Name = dto.Name.Trim(),
                CreatedAt = DateTime.UtcNow
            };
            _context.EmergencySubtypes.Add(subtype);
            await _context.SaveChangesAsync();

            return Ok(new EmergencySubtypeResponseDto
            {
                Id = subtype.Id,
                Name = subtype.Name,
                CreatedAt = subtype.CreatedAt
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var subtype = await _context.EmergencySubtypes.FindAsync(id);
            if (subtype == null) return NotFound();

            _context.EmergencySubtypes.Remove(subtype);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
