using UrbanPulse.Core.Entities;
using UrbanPulse.Core.Interfaces;

namespace UrbanPulse.Core.Services;

public class DuplicateDetectionService : IDuplicateDetectionService
{
    private readonly IUserRepository _userRepository;
    private readonly IDuplicateSuspectRepository _duplicateSuspectRepository;

    public DuplicateDetectionService(
        IUserRepository userRepository,
        IDuplicateSuspectRepository duplicateSuspectRepository)
    {
        _userRepository = userRepository;
        _duplicateSuspectRepository = duplicateSuspectRepository;
    }

    public async Task DetectAndSaveAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return;

        var allUsers = await _userRepository.GetAllUsersAsync();

        foreach (var other in allUsers)
        {
            if (other.Id == userId) continue;

            var reasons = new List<string>();
            int score = 0;

            if (!string.IsNullOrWhiteSpace(user.FullName) && !string.IsNullOrWhiteSpace(other.FullName))
            {
                var similarity = LevenshteinSimilarity(
                    user.FullName.ToLower().Trim(),
                    other.FullName.ToLower().Trim());

                if (similarity >= 0.80)
                {
                    reasons.Add("SimilarName");
                    score += 2;
                }
            }

            if (!string.IsNullOrWhiteSpace(user.PhoneNumber) &&
                !string.IsNullOrWhiteSpace(other.PhoneNumber) &&
                user.PhoneNumber.Trim() == other.PhoneNumber.Trim())
            {
                reasons.Add("SamePhone");
                score += 4;
            }

            if (user.Latitude.HasValue && user.Longitude.HasValue &&
                other.Latitude.HasValue && other.Longitude.HasValue)
            {
                var distance = Haversine(
                    user.Latitude.Value, user.Longitude.Value,
                    other.Latitude.Value, other.Longitude.Value);

                if (distance < 5.0)
                {
                    reasons.Add("NearbyLocation");
                    score += 2;
                }
            }

            var userSkills = SplitCsv(user.Skills);
            var otherSkills = SplitCsv(other.Skills);
            if (userSkills.Count > 0 && otherSkills.Count > 0)
            {
                var jaccard = JaccardSimilarity(userSkills, otherSkills);
                if (jaccard >= 0.5)
                {
                    reasons.Add("SimilarSkills");
                    score += 1;
                }
            }

            var userTools = SplitCsv(user.Tools);
            var otherTools = SplitCsv(other.Tools);
            if (userTools.Count > 0 && otherTools.Count > 0)
            {
                var jaccard = JaccardSimilarity(userTools, otherTools);
                if (jaccard >= 0.5)
                {
                    reasons.Add("SimilarTools");
                    score += 1;
                }
            }

            if (score < 3) continue;

            var confidence = score >= 6 ? "Critical"
                           : score >= 4 ? "High"
                           : "Medium";

            var alreadyExists = await _duplicateSuspectRepository.ExistsAsync(userId, other.Id);
            if (alreadyExists) continue;

            await _duplicateSuspectRepository.AddAsync(new DuplicateSuspect
            {
                User1Id = Math.Min(userId, other.Id),
                User2Id = Math.Max(userId, other.Id),
                Confidence = confidence,
                Reasons = string.Join(",", reasons),
                DetectedAt = DateTime.UtcNow,
            });
        }

        await _duplicateSuspectRepository.SaveChangesAsync();
    }

    private static double LevenshteinSimilarity(string a, string b)
    {
        int[,] dp = new int[a.Length + 1, b.Length + 1];
        for (int i = 0; i <= a.Length; i++) dp[i, 0] = i;
        for (int j = 0; j <= b.Length; j++) dp[0, j] = j;

        for (int i = 1; i <= a.Length; i++)
            for (int j = 1; j <= b.Length; j++)
                dp[i, j] = a[i - 1] == b[j - 1]
                    ? dp[i - 1, j - 1]
                    : 1 + Math.Min(dp[i - 1, j - 1], Math.Min(dp[i - 1, j], dp[i, j - 1]));

        int maxLen = Math.Max(a.Length, b.Length);
        return maxLen == 0 ? 1.0 : 1.0 - (double)dp[a.Length, b.Length] / maxLen;
    }

    private static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;

    private static double JaccardSimilarity(HashSet<string> a, HashSet<string> b)
    {
        var intersection = a.Intersect(b).Count();
        var union = a.Union(b).Count();
        return union == 0 ? 0 : (double)intersection / union;
    }

    private static HashSet<string> SplitCsv(string? csv)
    {
        if (string.IsNullOrWhiteSpace(csv)) return new HashSet<string>();
        return csv.Split(",", StringSplitOptions.RemoveEmptyEntries)
                  .Select(s => s.ToLower().Trim())
                  .ToHashSet();
    }
}