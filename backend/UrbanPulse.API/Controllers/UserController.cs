namespace UrbanPulse.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UrbanPulse.Core.DTOs.User;
using UrbanPulse.Core.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var profile = await _userService.GetProfileAsync(userId);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _userService.UpdateProfileAsync(userId, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        await _userService.DeleteAccountAsync(userId);
        return Ok();
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _userService.ChangePasswordAsync(userId, dto);
        if (!result) return BadRequest("Current password is incorrect.");
        return Ok();
    }
}