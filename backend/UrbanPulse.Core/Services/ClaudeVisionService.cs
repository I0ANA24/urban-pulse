using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace UrbanPulse.Core.Services;

public class ClaudeVisionService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public ClaudeVisionService()
    {
        _httpClient = new HttpClient();
        _apiKey = Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY") ?? "";
    }

    public async Task<string?> AnalyzePetImageAsync(string imageUrl)
    {
        try
        {
            var prompt = @"Analyze this pet image and return ONLY a JSON object with these fields:
{
  ""species"": ""dog/cat/bird/other"",
  ""color"": ""main color(s)"",
  ""size"": ""small/medium/large"",
  ""breed"": ""breed if identifiable or unknown"",
  ""marks"": ""distinctive marks or features"",
  ""fur"": ""short/long/curly/none""
}
Return ONLY the JSON, no other text.";

            var requestBody = new
            {
                model = "claude-opus-4-5",
                max_tokens = 300,
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new
                            {
                                type = "image",
                                source = new
                                {
                                    type = "url",
                                    url = imageUrl
                                }
                            },
                            new
                            {
                                type = "text",
                                text = prompt
                            }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
            request.Headers.Add("x-api-key", _apiKey);
            request.Headers.Add("anthropic-version", "2023-06-01");
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            var responseJson = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            return text;
        }
        catch
        {
            return null;
        }
    }

    public async Task<double> CalculateMatchScoreAsync(string lostAiTags, string foundAiTags, string lostDescription, string foundDescription)
    {
        try
        {
            var prompt = $@"You are a pet matching assistant. Compare these two pets and return ONLY a number between 0 and 100 representing how likely they are the same pet.

LOST PET:
AI Analysis: {lostAiTags}
Description: {lostDescription}

FOUND PET:
AI Analysis: {foundAiTags}
Description: {foundDescription}

Consider: species, color, size, breed, distinctive marks, and description details.
Return ONLY a number (0-100), nothing else.";

            var requestBody = new
            {
                model = "claude-sonnet-4-20250514",
                max_tokens = 10,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
            request.Headers.Add("x-api-key", _apiKey);
            request.Headers.Add("anthropic-version", "2023-06-01");
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return 0;

            var responseJson = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            if (double.TryParse(text?.Trim(), out var score))
                return Math.Clamp(score, 0, 100);

            return 0;
        }
        catch
        {
            return 0;
        }
    }
}