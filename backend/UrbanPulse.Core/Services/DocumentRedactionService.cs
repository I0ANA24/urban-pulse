using Google.Cloud.Vision.V1;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Drawing.Processing;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace UrbanPulse.Core.Services;

public class RedactionResult
{
    public string? RedactedImageUrl { get; set; }
    public string? SearchIndex { get; set; }
}

public class DocumentRedactionService
{
    private readonly Cloudinary _cloudinary;

    public DocumentRedactionService(Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
    }

    private static readonly string[] SensitivePatterns = new[]
    {
        @"^\d{13}$",
        @"^[A-Z]{1,2}\d{5,8}$",
        @"^[A-Z]{2}\d{6}$",
        @"^\d{4}$",
        @"^\d{2}/\d{2,4}$",
        @"^\d{2}\.\d{2}\.\d{4}$",
    };

    public async Task<RedactionResult> RedactAndUploadAsync(string imageUrl)
    {
        Console.WriteLine($"[REDACT] Starting...");
        var result = new RedactionResult();

        try
        {
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);
            var imageBytes = await httpClient.GetByteArrayAsync(imageUrl);
            Console.WriteLine($"[REDACT] Downloaded {imageBytes.Length} bytes");

            var visionClient = ImageAnnotatorClient.Create();
            var image = Google.Cloud.Vision.V1.Image.FromBytes(imageBytes);
            var response = await visionClient.DetectTextAsync(image);
            Console.WriteLine($"[REDACT] Vision returned {response.Count} annotations");

            using var img = SixLabors.ImageSharp.Image.Load<Rgba32>(imageBytes);

            var allTexts = response.Skip(1).Select(a => a.Description?.Trim() ?? "").ToList();
            result.SearchIndex = ExtractSearchIndex(allTexts);
            Console.WriteLine($"[REDACT] SearchIndex: {result.SearchIndex}");

            foreach (var annotation in response.Skip(1))
            {
                var text = annotation.Description?.Trim() ?? "";
                if (!IsSensitive(text)) continue;

                var vertices = annotation.BoundingPoly?.Vertices;
                if (vertices == null || vertices.Count < 4) continue;

                var minX = vertices.Min(v => v.X);
                var minY = vertices.Min(v => v.Y);
                var maxX = vertices.Max(v => v.X);
                var maxY = vertices.Max(v => v.Y);

                var padding = 4;
                minX = Math.Max(0, minX - padding);
                minY = Math.Max(0, minY - padding);
                maxX = Math.Min(img.Width, maxX + padding);
                maxY = Math.Min(img.Height, maxY + padding);

                var width = maxX - minX;
                var height = maxY - minY;

                if (width <= 0 || height <= 0) continue;

                Console.WriteLine($"[REDACT] Blurring: '{text}' at {minX},{minY} {width}x{height}");

                var rect = new Rectangle(minX, minY, width, height);
                using var zone = img.Clone(ctx => ctx.Crop(rect));
                zone.Mutate(ctx => ctx.BoxBlur(10));
                img.Mutate(ctx => ctx.DrawImage(zone, new SixLabors.ImageSharp.Point(minX, minY), 1f));
            }

            using var outputStream = new MemoryStream();
            await img.SaveAsJpegAsync(outputStream);
            outputStream.Position = 0;

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription("redacted.jpg", outputStream),
                Folder = "documents_redacted",
                Transformation = new Transformation().Quality("auto"),
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                Console.WriteLine($"[REDACT] Cloudinary error: {uploadResult.Error.Message}");
                return result;
            }

            result.RedactedImageUrl = uploadResult.SecureUrl.ToString();
            Console.WriteLine($"[REDACT] Done! URL: {result.RedactedImageUrl}");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[REDACT] Error: {ex.GetType().Name}: {ex.Message}");
            return result;
        }
    }

    private static string? ExtractSearchIndex(List<string> texts)
    {
        var searchData = new Dictionary<string, string>();

        for (int i = 0; i < texts.Count; i++)
        {
            var text = texts[i];

            if (Regex.IsMatch(text, @"^\d{13}$"))
            {
                searchData["cnp_last6"] = text.Substring(7);
            }

            if (Regex.IsMatch(text, @"^[A-Z]{2}\d{6}$"))
            {
                searchData["doc_number"] = text; 
            }

            if ((text == "NUME" || text == "NOM" || text == "SURNAME" || text == "LAST" || text == "NAME") && i + 1 < texts.Count)
            {
                var nextText = texts[i + 1];
                if (nextText.Length >= 2 && Regex.IsMatch(nextText, @"^[A-Z]+$"))
                {
                    searchData["name_prefix"] = nextText; 
                }
            }
        }

        if (searchData.Count == 0) return null;
        return JsonSerializer.Serialize(searchData);
    }

    private static bool IsSensitive(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return false;

        foreach (var pattern in SensitivePatterns)
        {
            if (Regex.IsMatch(text, pattern)) return true;
        }

        if (Regex.IsMatch(text, @"\d{6,}")) return true;

        return false;
    }
}