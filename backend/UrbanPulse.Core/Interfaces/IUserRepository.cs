using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanPulse.Core.Entities;

namespace UrbanPulse.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task AddAsync(User user);
        Task<bool> ExistsAsync(string email);
        Task DeleteAsync(User user);
        Task UpdateAsync(User user);
    }
}
