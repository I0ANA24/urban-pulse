using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.DTOs;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

namespace UrbanPulse.Infrastructure.Repositories;

public class DuplicateSuspectRepository : IDuplicateSuspectRepository
{
    private readonly AppDbContext _context;

    public DuplicateSuspectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(int user1Id, int user2Id)
    {
        return await _context.DuplicateSuspects.AnyAsync(d =>
            !d.IsDismissed &&
            ((d.User1Id == user1Id && d.User2Id == user2Id) ||
             (d.User1Id == user2Id && d.User2Id == user1Id)));
    }

    public async Task AddAsync(DuplicateSuspect suspect)
    {
        await _context.DuplicateSuspects.AddAsync(suspect);
    }

    public async Task<List<DuplicateSuspectDto>> GetAllActiveAsync()
    {
        return await _context.DuplicateSuspects
            .Where(d => !d.IsDismissed)
            .Include(d => d.User1)
            .Include(d => d.User2)
            .OrderByDescending(d => d.DetectedAt)
            .Select(d => new DuplicateSuspectDto
            {
                Id = d.Id,
                User1Id = d.User1Id,
                User1Name = d.User1.FullName ?? d.User1.Email,
                User1AvatarUrl = d.User1.AvatarUrl,
                User1IsVerified = d.User1.IsVerified,
                User1TrustScore = d.User1.TrustScore,
                User1CreatedAt = d.User1.CreatedAt,
                User2Id = d.User2Id,
                User2Name = d.User2.FullName ?? d.User2.Email,
                User2AvatarUrl = d.User2.AvatarUrl,
                User2IsVerified = d.User2.IsVerified,
                User2TrustScore = d.User2.TrustScore,
                User2CreatedAt = d.User2.CreatedAt,
                Confidence = d.Confidence,
                Reasons = d.Reasons.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
                DetectedAt = d.DetectedAt,
            })
            .ToListAsync();
    }

    public async Task<DuplicateSuspect?> GetByIdAsync(int id)
    {
        return await _context.DuplicateSuspects
            .Include(d => d.User1)
            .Include(d => d.User2)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}