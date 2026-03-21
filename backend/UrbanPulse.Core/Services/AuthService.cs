using UrbanPulse.Core.DTOs.Auth;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

namespace UrbanPulse.Core.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        if (await _userRepository.ExistsAsync(dto.Email))
            return null;

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName,
            Role = dto.Role == "Admin" ? "Admin" : "User"
        };

        await _userRepository.AddAsync(user);

        return new AuthResponseDto
        {
            Token = _tokenService.GenerateToken(user),
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null) return null;

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return new AuthResponseDto
        {
            Token = _tokenService.GenerateToken(user),
            Email = user.Email,
            Role = user.Role
        };
    }
}