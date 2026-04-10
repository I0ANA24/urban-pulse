"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Bell, BellRing } from "lucide-react";
import { useSignalR } from "@/context/SignalRContext";
import { NotificationItem } from "./NotificationTypes";
import NotificationCard from "./NotificationCard";
import { GiRingingBell } from "react-icons/gi";

const API = "http://localhost:5248";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export default function NotificationsPanel({
  open,
  onClose,
  onUnreadChange,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { notificationConnection } = useSignalR();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${API}/api/notification`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data);
        setFetched(true);
      })
      .finally(() => setLoading(false));
  }, [open, fetched]);

  useEffect(() => {
    if (!notificationConnection) return;
    const handler = (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    notificationConnection.on("NewNotification", handler);
    return () => notificationConnection.off("NewNotification", handler);
  }, [notificationConnection]);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.isRead).length;
    onUnreadChange?.(unread);
  }, [notifications, onUnreadChange]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const markAsRead = async (id: number, actionUrl?: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/notification/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    if (actionUrl) {
      onClose();
      router.push(actionUrl);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/notification/read-all`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-105 max-w-full flex flex-col
          bg-background border-l border-white/10 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-6 pt-5 shrink-0 gap-3">
          <BellRing size={26} className="text-white" />
          <h2 className="text-xl font-bold font-montagu text-white">
            Notifications
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && (
            <div className="flex flex-col gap-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-white/30">
              <Bell size={40} className="opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div className="flex flex-col gap-5">
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
      </div>
    </>,
    document.body,
  );
}
