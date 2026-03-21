using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanPulse.Core.DTOs.User;

namespace UrbanPulse.Core.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task DeleteAccountAsync(int userId);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
    }
}
