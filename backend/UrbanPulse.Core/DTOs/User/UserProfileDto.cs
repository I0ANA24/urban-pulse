using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanPulse.Core.DTOs.User
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
        public List<string> Skills { get; set; } = new();
        public bool IsVerified { get; set; }
        public List<string> Tools { get; set; } = new();
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
