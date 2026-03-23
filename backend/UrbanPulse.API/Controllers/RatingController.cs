namespace UrbanPulse.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Core.DTOs.Chat;

[ApiController]
[Route("api/chat/conversations/{conversationId}/rating")]
[Authorize]
public class RatingController : ControllerBase
{
    private readonly IRatingRepository _ratingRepository;
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;

    public RatingController(IRatingRepository ratingRepository, IConversationRepository conversationRepository, IUserRepository userRepository)
    {
        _ratingRepository = ratingRepository;
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
    }

    [HttpPost]
    public async Task<IActionResult> Rate(int conversationId, [FromBody] RateDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var existing = await _ratingRepository.GetByConversationAndUserAsync(conversationId, userId);
        if (existing != null) return BadRequest(new { message = "Already rated." });

        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) return NotFound();

        var ratedUserId = conversation.User1Id == userId ? conversation.User2Id : conversation.User1Id;

        var rating = new Rating
        {
            RatedUserId = ratedUserId,
            RatedByUserId = userId,
            ConversationId = conversationId,
            Value = dto.Rating,
        };

        await _ratingRepository.AddAsync(rating);

        var allRatings = await _ratingRepository.GetByUserIdAsync(ratedUserId);
        var helpful = allRatings.Count(r => r.Value == "helpful");
        var notHelpful = allRatings.Count(r => r.Value == "not_helpful");
        var total = helpful + notHelpful;

        var trustScore = total > 0 ? (double)helpful / total * 100 : 0;
        var isVerified = helpful >= 3 && trustScore >= 75;

        var ratedUser = await _userRepository.GetByIdAsync(ratedUserId);
        if (ratedUser != null)
        {
            ratedUser.TrustScore = trustScore;
            ratedUser.IsVerified = isVerified;
            ratedUser.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(ratedUser);
        }

        return Ok(new { trustScore, isVerified });
    }

    [HttpGet("check")]
    public async Task<IActionResult> CheckRating(int conversationId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var existing = await _ratingRepository.GetByConversationAndUserAsync(conversationId, userId);
        return Ok(new { hasRated = existing != null, value = existing?.Value });
    }
}