import { NotificationItem, formatRelativeTime } from "./NotificationTypes";

export default function BadgeCard({ n, onRead }: { n: NotificationItem; onRead: () => void }) {
  return (
    <div onClick={onRead} className="cursor-pointer active:scale-95 transition-all duration-200 relative pt-7">

      {/* Tab badge */}
      <div
        className="absolute w-27 h-15 top-0 right-3 -z-10 px-4 py-1 rounded-t-3xl text-xs font-bold pt-2 text-center"
        style={{ background: "rgba(255,215,0,0.25)", color: "#FFD700" }}
      >
        BADGE
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${n.isRead ? "rgba(255,255,255,0.06)" : "rgba(255,215,0,0.4)"}` }}
      >
        <div className="px-4 pt-3 pb-4" style={{ background: "#1C1C18" }}>

          {/* Time + unread dot row */}
          <div className="flex items-center justify-end gap-1.5 mb-2">
            {!n.isRead && <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />}
            <span className="text-xs text-white/40">{formatRelativeTime(n.createdAt)}</span>
          </div>

          {/* Icon + content row */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-lg shrink-0">
              🏅
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className={`text-sm font-semibold ${n.isRead ? "text-white/50" : "text-white"}`}>
                {n.title}
              </p>
              <p className={`text-sm ${n.isRead ? "text-white/30" : "text-yellow-400"}`}>
                {n.body}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
