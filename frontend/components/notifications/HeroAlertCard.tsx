import { NotificationItem, formatTime, getInitials } from "./NotificationTypes";

export default function HeroAlertCard({ n, onRead }: { n: NotificationItem; onRead: () => void }) {
  const isSkill = n.body.toLowerCase().includes("skill");
  const badgeBg = isSkill ? "#BEDCF5" : "#4ADE80";
  const badgeText = isSkill ? "#04007D" : "#000";
  const label = isSkill ? "SKILL" : "LEND";
  const alertColor = "#FF7E7E";

  const colonIndex = n.body.indexOf(":");
  const alertLabel = colonIndex !== -1 ? n.body.substring(0, colonIndex) : n.body;
  const alertBody = colonIndex !== -1 ? n.body.substring(colonIndex + 1).trim() : "";

  const initials = getInitials(n.title);

  return (
    <div onClick={onRead} className="cursor-pointer active:scale-95 transition-all duration-200 relative pt-5">

      {/* Badge pill */}
      <div
        className="absolute top-0 right-3 z-10 px-4 py-1 rounded-full text-xs font-bold"
        style={{ background: badgeBg, color: badgeText }}
      >
        {label}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${n.isRead ? "rgba(255,255,255,0.06)" : "rgba(255,126,126,0.25)"}` }}
      >
        <div
          className="px-4 pt-3 pb-4"
          style={{ background: n.isRead ? "#1C1C1C" : "rgba(255,126,126,0.05)" }}
        >
          {/* Time row */}
          <div className="flex justify-end mb-2">
            <span className="text-xs text-white/40">{formatTime(n.createdAt)}</span>
          </div>

          {/* Avatar + name row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-800 shrink-0">
              {initials}
            </div>
            <p className={`text-sm leading-snug mt-1 ${n.isRead ? "text-white/40" : "text-white"}`}>
              <span className="font-bold">{n.title}</span>
              {" needs help!"}
            </p>
          </div>

          {/* Alert text */}
          <p className="text-sm font-bold ml-13" style={{ color: alertColor }}>
            {alertLabel}:{" "}
            <span className={`font-normal ${n.isRead ? "text-white/40" : "text-white"}`}>
              {alertBody}
            </span>
          </p>

          {!n.isRead && (
            <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full" style={{ background: alertColor }} />
          )}
        </div>
      </div>
    </div>
  );
}
