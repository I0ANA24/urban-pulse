namespace UrbanPulse.Core.Entities;

public class GlobalCrisis : BaseEntity
{
    public string SubType { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsManuallyActivated { get; set; } = false;
    public int? ActivatedByAdminId { get; set; }
}
