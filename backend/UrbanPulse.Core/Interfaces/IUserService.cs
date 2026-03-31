using UrbanPulse.Core.DTOs.User;

namespace UrbanPulse.Core.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task DeleteAccountAsync(int userId);
        Task<List<UserProfileDto>> GetUsersWithSkillsAsync();
    }
}