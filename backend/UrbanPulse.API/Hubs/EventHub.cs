using Microsoft.AspNetCore.SignalR;

namespace UrbanPulse.API.Hubs
{
    public class EventHub : Hub
    {
        public async Task JoinRadiusGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveRadiusGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}
