using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

namespace UrbanPulse.Infrastructure.Repositories;

public class UserReportRepository : IUserReportRepository
{
    private readonly AppDbContext _context;

    public UserReportRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(int reporterUserId, int reportedUserId)
    {
        return await _context.UserReports.AnyAsync(r =>
            r.ReporterUserId == reporterUserId &&
            r.ReportedUserId == reportedUserId);
    }

    public async Task AddAsync(UserReport report)
    {
        await _context.UserReports.AddAsync(report);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}