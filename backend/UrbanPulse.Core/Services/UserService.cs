namespace UrbanPulse.Core.Services;

using UrbanPulse.Core.DTOs.User;
using UrbanPulse.Core.Interfaces;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IDuplicateDetectionService _duplicateDetectionService;

    public UserService(
        IUserRepository userRepository,
        IDuplicateDetectionService duplicateDetectionService)
    {
        _userRepository = userRepository;
        _duplicateDetectionService = duplicateDetectionService;
    }

    public async Task<UserProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;
        return MapToDto(user);
    }

    public async Task<List<UserProfileDto>> GetUsersWithSkillsAsync()
    {
        var users = await _userRepository.GetUsersWithSkillsAsync();
        return users.Select(MapToDto).ToList();
    }

    public async Task<List<UserProfileDto>> GetUsersWithToolsAsync()
    {
        var users = await _userRepository.GetUsersWithToolsAsync();
        return users.Select(MapToDto).ToList();
    }

    public async Task<List<UserProfileDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllUsersAsync();
        return users.Select(MapToDto).ToList();
    }

    public async Task<List<UserProfileDto>> SearchUsersAsync(string query)
    {
        var users = await _userRepository.SearchUsersAsync(query);
        return users.Select(MapToDto).ToList();
    }

    public async Task<string> UpdateAvatarAsync(int userId, string avatarUrl)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return string.Empty;
        user.AvatarUrl = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        return avatarUrl;
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.Address != null) user.Address = dto.Address;
        if (dto.Bio != null) user.Bio = dto.Bio;
        if (dto.Latitude.HasValue) user.Latitude = dto.Latitude;
        if (dto.Longitude.HasValue) user.Longitude = dto.Longitude;
        user.Skills = dto.Skills.Count > 0 ? string.Join(",", dto.Skills) : null;
        user.Tools = dto.Tools.Count > 0 ? string.Join(",", dto.Tools) : null;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _duplicateDetectionService.DetectAndSaveAsync(userId);

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

    public async Task RateUserAsync(int raterId, int targetUserId, bool helpful)
    {
        var user = await _userRepository.GetByIdAsync(targetUserId);
        if (user == null || raterId == targetUserId) return;

        if (helpful) user.HelpfulCount++;
        else user.NotHelpfulCount++;

        var total = user.HelpfulCount + user.NotHelpfulCount;
        var score = total > 0 ? (double)user.HelpfulCount / total * 100 : 0;
        user.TrustScore = user.HelpfulCount >= 3 && score >= 75 ? score : 0;
        user.IsVerified = user.TrustScore >= 75;

        await _userRepository.UpdateAsync(user);
    }

    private static UserProfileDto MapToDto(Core.Entities.User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        Address = user.Address,
        Bio = user.Bio,
        AvatarUrl = user.AvatarUrl,
        Skills = string.IsNullOrWhiteSpace(user.Skills)
            ? new()
            : user.Skills.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
        Tools = string.IsNullOrWhiteSpace(user.Tools)
            ? new()
            : user.Tools.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
        Role = user.Role,
        IsVerified = user.IsVerified,
        TrustScore = user.HelpfulCount >= 3
            ? (user.HelpfulCount + user.NotHelpfulCount > 0
                ? ((double)user.HelpfulCount / (user.HelpfulCount + user.NotHelpfulCount) * 100) >= 75
                    ? (double)user.HelpfulCount / (user.HelpfulCount + user.NotHelpfulCount) * 100
                    : 0
                : 0)
            : 0,
        IsBanned = user.IsBanned,
        TasksBanned = user.TasksBanned,
        HelpfulCount = user.HelpfulCount,
        TasksPostsDeleted = user.TasksPostsDeleted,
        TasksDuplicatesMerged = user.TasksDuplicatesMerged,
        TasksDismissed = user.TasksDismissed,
        CreatedAt = user.CreatedAt,
        Latitude = user.Latitude,
        Longitude = user.Longitude,
    };
}