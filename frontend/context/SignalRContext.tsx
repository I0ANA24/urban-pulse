"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as signalR from "@microsoft/signalr";

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  notificationConnection: signalR.HubConnection | null;
  globalChatConnection: signalR.HubConnection | null;
  severeChatConnection: signalR.HubConnection | null;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  notificationConnection: null,
  globalChatConnection: null,
  severeChatConnection: null,
});

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [notificationConnection, setNotificationConnection] = useState<signalR.HubConnection | null>(null);
  const [globalChatConnection, setGlobalChatConnection] = useState<signalR.HubConnection | null>(null);
  const [severeChatConnection, setSevereChatConnection] = useState<signalR.HubConnection | null>(null);
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isPublic) return;

    // Events hub
    const eventsConn = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5248/hubs/events")
      .withAutomaticReconnect()
      .build();

    setConnection(eventsConn);
    eventsConn.start().catch((err) => console.error("Events SignalR error:", err));

    const token = localStorage.getItem("token");
    if (token) {
      // Notifications hub
      const notifConn = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5248/hubs/notifications", {
          accessTokenFactory: () => localStorage.getItem("token") ?? "",
        })
        .withAutomaticReconnect()
        .build();

      setNotificationConnection(notifConn);
      notifConn.start().catch((err) => console.error("Notifications SignalR error:", err));

      // Global chat hub
      const globalConn = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5248/hubs/global-chat", {
          accessTokenFactory: () => localStorage.getItem("token") ?? "",
        })
        .withAutomaticReconnect()
        .build();

      setGlobalChatConnection(globalConn);
      globalConn.start().catch((err) => console.error("Global chat SignalR error:", err));

      // Severe chat hub
      const severeConn = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5248/hubs/severe-chat", {
          accessTokenFactory: () => localStorage.getItem("token") ?? "",
        })
        .withAutomaticReconnect()
        .build();

      setSevereChatConnection(severeConn);
      severeConn.start().catch((err) => console.error("Severe chat SignalR error:", err));
    }

    return () => {
      eventsConn.stop();
    };
  }, [isPublic]);

  return (
    <SignalRContext.Provider value={{ connection, notificationConnection, globalChatConnection, severeChatConnection }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);