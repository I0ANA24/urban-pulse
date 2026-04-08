"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserProfile {
  id: number;
  email: string;
  fullName?: string;
  role?: string;
  isVerified?: boolean;
  trustScore?: number;
  avatarUrl?: string | null;
  latitude?: number;
  longitude?: number;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  viewAsUser: boolean;
  setViewAsUser: (value: boolean) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  viewAsUser: false,
  setViewAsUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewAsUser, setViewAsUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = user?.role === "Admin" && !viewAsUser;

  return (
    <UserContext.Provider value={{ user, loading, isAdmin, viewAsUser, setViewAsUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);