import { NotificationItem, formatTime, getInitials } from "./NotificationTypes";

export default function CommentCard({ n, onRead }: { n: NotificationItem; onRead: () => void }) {
  const initials = getInitials(n.title);

  return (
    <div onClick={onRead} className="cursor-pointer active:scale-95 transition-all duration-200 relative pt-5">

      {/* Badge pill */}
      <div
        className="absolute top-0 right-3 z-10 px-4 py-1 rounded-full text-xs font-bold"
        style={{ background: "#BEDCF5", color: "#04007D" }}
      >
        SKILL
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${n.isRead ? "rgba(255,255,255,0.06)" : "rgba(190,220,245,0.3)"}` }}
      >
        <div
          className="px-4 pt-3 pb-4"
          style={{ background: n.isRead ? "#1C1C1C" : "rgba(190,220,245,0.05)" }}
        >
          {/* Avatar + name + dot + time row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-800 shrink-0">
              {initials}
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`text-sm font-bold truncate ${n.isRead ? "text-white/40" : "text-white"}`}>
                {n.title}
              </span>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />}
              <span className="text-xs text-white/40 ml-auto shrink-0">{formatTime(n.createdAt)}</span>
            </div>
          </div>

          {/* Message body */}
          <p className={`text-sm mt-2 ml-13 leading-snug ${n.isRead ? "text-white/30" : "text-white/70"}`}>
            {n.body}
          </p>
        </div>
      </div>
    </div>
  );
}
