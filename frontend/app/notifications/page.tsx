"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GoBackButton from "@/components/ui/GoBackButton";
import { useSignalR } from "@/context/SignalRContext";
import { NotificationItem } from "@/components/notifications/NotificationTypes";
import NotificationCard from "@/components/notifications/NotificationCard";

const API = "http://localhost:5248";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { notificationConnection } = useSignalR();
  const router = useRouter();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/notification`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setNotifications([]);
          return;
        }
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load notifications page:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    if (!notificationConnection) return;
    const handler = (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    notificationConnection.on("NewNotification", handler);
    return () => notificationConnection.off("NewNotification", handler);
  }, [notificationConnection]);

  const markAsRead = async (id: number, actionUrl?: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/notification/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (actionUrl) router.push(actionUrl);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/notification/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <GoBackButton />
        <h1 className="text-xl font-bold font-montagu">Notifications</h1>
        {unreadCount > 0 ? (
          <button onClick={markAllAsRead} className="text-xs text-white/40 hover:text-white transition-colors">
            Mark all read
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-white/30">
          <span className="text-4xl">🔔</span>
          <p className="text-sm">No notifications yet</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="flex flex-col gap-6 pt-2">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              n={n}
              onRead={() => markAsRead(n.id, n.actionUrl)}
            />
          ))}
        </div>
      )}
    </div>
  );
}