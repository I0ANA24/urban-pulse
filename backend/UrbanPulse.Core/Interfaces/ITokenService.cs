using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanPulse.Core.Entities;

namespace UrbanPulse.Core.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
