using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Infrastructure.Data;

namespace UrbanPulse.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetByEmailAsync(string email)
        => await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User?> GetByIdAsync(int id)
        => await _db.Users.FindAsync(id);

    public async Task AddAsync(User user)
    {
        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(User user)
    {
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(string email)
        => await _db.Users.AnyAsync(u => u.Email == email);
}