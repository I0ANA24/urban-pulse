namespace UrbanPulse.Core.Services;

using UrbanPulse.Core.DTOs.User;
using UrbanPulse.Core.Interfaces;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;
        return MapToDto(user);
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.Address != null) user.Address = dto.Address;
        if (dto.Bio != null) user.Bio = dto.Bio;
        user.Skills = dto.Skills.Count > 0 ? string.Join(",", dto.Skills) : null;
        user.Tools = dto.Tools.Count > 0 ? string.Join(",", dto.Tools) : null;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash)) return false;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task DeleteAccountAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return;
        await _userRepository.DeleteAsync(user);
    }

    private static UserProfileDto MapToDto(Core.Entities.User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        Address = user.Address,
        Bio = user.Bio,
        Skills = string.IsNullOrWhiteSpace(user.Skills) ? new() : user.Skills.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
        Tools = string.IsNullOrWhiteSpace(user.Tools) ? new() : user.Tools.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
        Role = user.Role,
        IsVerified = user.IsVerified,
        CreatedAt = user.CreatedAt
    };
}