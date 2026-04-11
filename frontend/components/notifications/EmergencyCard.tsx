import { NotificationItem, formatTime, getInitials } from "./NotificationTypes";

export default function EmergencyCard({
  n,
  onRead,
}: {
  n: NotificationItem;
  onRead: () => void;
}) {
  const initials = getInitials(n.title);

  const colonIndex = n.body.indexOf(":");
  const alertLabel =
    colonIndex !== -1 ? n.body.substring(0, colonIndex) : n.body;
  const alertBody =
    colonIndex !== -1 ? n.body.substring(colonIndex + 1).trim() : "";
  console.log(colonIndex);
  return (
    <div
      onClick={onRead}
      className="cursor-pointer active:scale-95 transition-all duration-200 relative pt-7"
    >
      {/* EMERGENCY tab badge */}
      <div className="absolute w-27 h-15 top-0 right-3 -z-10 px-4 py-1 rounded-t-3xl text-xs font-bold bg-red-emergency text-white pt-2 text-center">
        EMERGENCY
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: `1px solid ${n.isRead ? "rgba(255,255,255,0.06)" : "rgba(165,58,58,0.5)"}`,
        }}
      >
        <div className="px-4 pt-3 pb-4" style={{ background: "#2C2222" }}>
          {/* Time + unread dot row */}
          <div className="flex items-center justify-end gap-1.5 mb-2">
            {!n.isRead && (
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            )}
            <span className="text-xs text-white/40">
              {formatTime(n.createdAt)}
            </span>
          </div>

          {/* Avatar + name row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-800 shrink-0 overflow-hidden">
              {n.avatarUrl ? (
                <img
                  src={n.avatarUrl}
                  alt={n.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            {/* Alert text */}
            <p className="text-sm font-bold" style={{ color: "#FF7E7E" }}>
              {alertLabel}
              <span
                className={`font-normal ${n.isRead ? "text-white/40" : "text-white"}`}
              >
                {alertBody}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
