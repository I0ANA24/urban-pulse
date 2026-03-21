using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanPulse.Core.Entities;

namespace UrbanPulse.Core.DTOs.Events
{
    public class CreateEventDto
    {
        public string Description { get; set; } = string.Empty;
        public EventType Type { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public List<string> Tags { get; set; } = new();
    }
}
