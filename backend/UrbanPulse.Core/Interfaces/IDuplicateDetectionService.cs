namespace UrbanPulse.Core.Interfaces;

public interface IDuplicateDetectionService
{
    Task DetectAndSaveAsync(int userId);
}