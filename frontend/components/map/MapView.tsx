"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "./map.css";
import { useRadius } from "@/context/RadiusContext";

const DEFAULT_CENTER: [number, number] = [47.1585, 27.6014];
const DEFAULT_ZOOM = 12;
const API = "http://localhost:5248";

type FilterMode = "disponibili" | "pot-ajuta";

interface UserProfile {
  id: number;
  fullName?: string;
  email: string;
  bio?: string;
  skills: string[];
  tools: string[];
  trustScore: number;
  avatarUrl?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface EventItem {
  id: number;
  description: string;
  type: number | string;
  latitude: number;
  longitude: number;
  tags: string[] | string;
  imageUrl?: string;
  createdByUserId: number;
  createdByEmail?: string;
  createdByFullName?: string;
  createdByUser?: { fullName?: string; email?: string };
}

interface UserMarker {
  user: UserProfile;
  lat: number;
  lng: number;
  hasSkills: boolean;
  hasTools: boolean;
}

interface EventMarker {
  event: EventItem;
  type: "skill" | "lend" | "emergency";
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function LocationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="bg-[#1C1C1C] rounded-3xl p-6 w-full max-w-sm border border-white/10 flex flex-col gap-5 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-white font-bold text-lg font-montagu">
            Location Required
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            To filter by radius, you need to set your location in your profile first.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/profile/settings/personal")}
            className="w-full bg-green-light text-black font-bold py-3 rounded-xl hover:bg-green-light/85 transition-colors"
          >
            Go to Settings
          </button>
          <button
            onClick={onClose}
            className="w-full border border-white/20 text-white/60 font-medium py-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ProfileCard({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setCurrentUserId(d.id));
  }, []);

  const handleContact = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/chat/conversations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: user.id }),
    });
    const data = await res.json();
    onClose();
    router.push(`/chat-conversation/${data.conversationId}`);
  };

  const isOwn = currentUserId === user.id;
  const name = user.fullName ?? user.email?.split("@")[0] ?? "User";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-card" onClick={(e) => e.stopPropagation()}>
        <div className="pc-header">
          <div className="pc-avatar overflow-hidden bg-[#2e2e2e] flex items-center justify-center">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={name} width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <span className="text-white font-bold text-xl">{initials}</span>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h2 className="pc-name">{name}</h2>
            <div className="flex items-center gap-3">
              <div className="pc-trust">
                <span className="pc-trust-label">Trust<br />score</span>
                <div className="pc-trust-divider" />
                <span className="pc-trust-value">{Math.round(user.trustScore)}%</span>
              </div>
              {isOwn ? (
                <span className="ec-your-post">Your profile</span>
              ) : (
                <button className="ec-contact-btn" onClick={handleContact}>💬 Contact</button>
              )}
            </div>
          </div>
        </div>
        {user.bio && (
          <div className="pc-section bio-section">
            <p className="pc-bio">{user.bio}</p>
          </div>
        )}
        {user.skills.length > 0 && (
          <div className="pc-section skills-section">
            <h3 className="pc-section-title skills-title">★ Skills</h3>
            <div className="pc-grid">
              {user.skills.map((s, i) => (
                <div key={i} className="pc-item"><span className="pc-dot skill-dot" />{s}</div>
              ))}
            </div>
          </div>
        )}
        {user.tools.length > 0 && (
          <div className="pc-section tools-section">
            <h3 className="pc-section-title tools-title">⚙ Tools & Resources</h3>
            {user.tools.map((t, i) => (
              <div key={i} className="pc-item"><span className="pc-dot tool-dot" />{t}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [authorProfile, setAuthorProfile] = useState<{ trustScore: number; avatarUrl?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const h = { Authorization: `Bearer ${token}` };
    fetch(`${API}/api/user/profile`, { headers: h })
      .then((r) => r.json())
      .then((d) => setCurrentUserId(d.id));
    fetch(`${API}/api/user/${event.createdByUserId}`, { headers: h })
      .then((r) => { if (r.ok) return r.json(); return null; })
      .then((d) => { if (d) setAuthorProfile({ trustScore: d.trustScore ?? 0, avatarUrl: d.avatarUrl }); })
      .catch(() => {});
  }, [event.createdByUserId]);

  const handleContact = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/chat/conversations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: event.createdByUserId, eventId: event.id }),
    });
    const data = await res.json();
    onClose();
    router.push(`/chat-conversation/${data.conversationId}`);
  };

  const typeNumMap: Record<number, string> = { 0: "General", 1: "Emergency", 2: "Skill", 3: "Lend" };
  const typeStr = typeof event.type === "number" ? typeNumMap[event.type] : event.type;
  const typeMap: Record<string, { label: string; color: string; bg: string }> = {
    Emergency: { label: "Emergency", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
    Skill:     { label: "Skill",     color: "#FFD700", bg: "rgba(255,215,0,0.15)" },
    Lend:      { label: "Lend",      color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  };
  const t = typeMap[typeStr ?? "Skill"] ?? typeMap["Skill"];
  const name = event.createdByFullName || event.createdByEmail?.split("@")[0] || "Unknown";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const isOwn = currentUserId !== null && currentUserId === event.createdByUserId;
  const tagsArray: string[] = Array.isArray(event.tags)
    ? event.tags
    : typeof event.tags === "string" && event.tags.trim() !== ""
    ? event.tags.split(",").map((t) => t.trim())
    : [];

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-card" onClick={(e) => e.stopPropagation()}>
        <div className="pc-header">
          <div className="pc-avatar overflow-hidden bg-[#2e2e2e] flex items-center justify-center">
            {authorProfile?.avatarUrl ? (
              <Image src={authorProfile.avatarUrl} alt={name} width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <span className="text-white font-bold text-xl">{initials}</span>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h2 className="pc-name">{name}</h2>
            <div className="flex items-center gap-3">
              <div className="pc-trust">
                <span className="pc-trust-label">Trust<br />score</span>
                <div className="pc-trust-divider" />
                <span className="pc-trust-value">{Math.round(authorProfile?.trustScore ?? 0)}%</span>
              </div>
              {isOwn ? (
                <span className="ec-your-post">Your post</span>
              ) : (
                <button className="ec-contact-btn" onClick={handleContact}>💬 Contact</button>
              )}
            </div>
          </div>
          <div className="ec-corner-badge" style={{ color: t.color, background: t.bg, border: `1px solid ${t.color}` }}>
            {t.label}
          </div>
        </div>
        {event.imageUrl && (
          <div className="ec-image-wrap">
            <img src={`${API}${event.imageUrl}`} alt="event" className="ec-image" />
          </div>
        )}
        <div className="pc-section bio-section">
          <p className="pc-bio" dangerouslySetInnerHTML={{ __html: event.description }} />
          {typeStr === "Emergency" && <span className="ec-verified">Verified info</span>}
        </div>
        {tagsArray.length > 0 && (
          <div className="pc-section" style={{ border: `2px solid ${t.color}` }}>
            <h3 className="pc-section-title" style={{ color: t.color, marginBottom: 10 }}>
              {typeStr === "Skill" ? "★ Skill required" : typeStr === "Lend" ? "⚙ Tool needed" : "⚠ Details"}
            </h3>
            <div className="ec-tags">
              {tagsArray.map((tag, i) => (
                <span key={i} className="ec-tag" style={{ color: t.color, borderColor: t.color }}>{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MarkersLayer({
  userMarkers,
  eventMarkers,
  onUserClick,
  onEventClick,
}: {
  userMarkers: UserMarker[];
  eventMarkers: EventMarker[];
  onUserClick: (u: UserProfile) => void;
  onEventClick: (e: EventItem) => void;
}) {
  const map = useMap();
  const refs = useRef<(L.Circle | L.Marker)[]>([]);

  useEffect(() => {
    refs.current.forEach((m) => map.removeLayer(m));
    refs.current = [];

    userMarkers.forEach(({ user, lat, lng, hasSkills, hasTools }) => {
      const seed = user.id * 9301 + 49297;
      const rLat = ((seed % 233280) / 233280 - 0.5) * 0.001;
      const rLng = (((seed * 6971) % 233280) / 233280 - 0.5) * 0.0015;

      const addCircle = (color: string, offsetLng = 0) => {
        const circle = L.circle([lat + rLat, lng + rLng + offsetLng], {
          radius: 300,
          color,
          fillColor: color,
          fillOpacity: 0.25,
          opacity: 0.6,
          weight: 2,
        }).addTo(map);
        circle.on("click", () => onUserClick(user));
        refs.current.push(circle);
      };

      if (hasSkills && hasTools) {
        addCircle("#FFD700", -0.002);
        addCircle("#3B82F6", +0.002);
      } else if (hasSkills) {
        addCircle("#FFD700");
      } else {
        addCircle("#3B82F6");
      }
    });

    eventMarkers.forEach(({ event, type }) => {
      const color = type === "emergency" ? "#EF4444" : type === "skill" ? "#FFD700" : "#3B82F6";
      const seed = event.id * 6271 + 12347;
      const rLat = ((seed % 233280) / 233280 - 0.5) * 0.001;
      const rLng = (((seed * 4421) % 233280) / 233280 - 0.5) * 0.0015;

      if (type === "emergency") {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 26px; height: 26px;
            background: #EF4444;
            border: 2px solid #EF4444;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(239,68,68,0.8), 0 0 24px rgba(239,68,68,0.4);
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: bold; color: white;
            line-height: 1;
          ">🚨</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const marker = L.marker([event.latitude, event.longitude], { icon }).addTo(map);
        marker.on("click", () => onEventClick(event));
        refs.current.push(marker);
      } else {
        const circle = L.circle([event.latitude + rLat, event.longitude + rLng], {
          radius: 300,
          color,
          fillColor: color,
          fillOpacity: 0.25,
          opacity: 0.6,
          weight: 2,
        }).addTo(map);
        circle.on("click", () => onEventClick(event));
        refs.current.push(circle);
      }
    });

    return () => {
      refs.current.forEach((m) => map.removeLayer(m));
    };
  }, [userMarkers, eventMarkers, map, onUserClick, onEventClick]);

  return null;
}

export default function MapView() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("disponibili");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
  const [eventMarkersDisponibili, setEventMarkersDisponibili] = useState<EventMarker[]>([]);
  const [eventMarkersPotAjuta, setEventMarkersPotAjuta] = useState<EventMarker[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const radiusRef = useRef<HTMLDivElement>(null);
  const { radiusKm, setRadiusKm } = useRadius();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !radiusRef.current) return;
    L.DomEvent.disableClickPropagation(radiusRef.current);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("token");
    fetch(`${API}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.latitude && d.longitude) {
          setUserLocation({ lat: d.latitude, lng: d.longitude });
        }
      });
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const h = { Authorization: `Bearer ${token}` };
        const [sRes, tRes] = await Promise.all([
          fetch(`${API}/api/User/with-skills`, { headers: h }),
          fetch(`${API}/api/User/with-tools`, { headers: h }),
        ]);
        const skillUsers: UserProfile[] = sRes.ok ? await sRes.json() : [];
        const toolUsers: UserProfile[] = tRes.ok ? await tRes.json() : [];

        const map = new Map<number, { user: UserProfile; hasSkills: boolean; hasTools: boolean }>();
        skillUsers.forEach((u) => map.set(u.id, { user: u, hasSkills: true, hasTools: false }));
        toolUsers.forEach((u) => {
          if (map.has(u.id)) map.get(u.id)!.hasTools = true;
          else map.set(u.id, { user: u, hasSkills: false, hasTools: true });
        });

        const results: UserMarker[] = [];
        for (const entry of map.values()) {
          const { user } = entry;
          if (user.latitude && user.longitude) {
            results.push({ ...entry, lat: user.latitude, lng: user.longitude });
          }
        }
        setUserMarkers(results);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const h = { Authorization: `Bearer ${token}` };
        const [emergRes, skillRes, lendRes] = await Promise.all([
          fetch(`${API}/api/Event/type/Emergency`, { headers: h }),
          fetch(`${API}/api/Event/type/Skill`, { headers: h }),
          fetch(`${API}/api/Event/type/Lend`, { headers: h }),
        ]);
        const emergEvents: EventItem[] = emergRes.ok ? await emergRes.json() : [];
        const skillEvents: EventItem[] = skillRes.ok ? await skillRes.json() : [];
        const lendEvents: EventItem[] = lendRes.ok ? await lendRes.json() : [];

        const emergMarkers: EventMarker[] = emergEvents.filter(e => e.latitude !== 0 && e.longitude !== 0).map((e) => ({ event: e, type: "emergency" as const }));
        const skillMarkers: EventMarker[] = skillEvents.filter(e => e.latitude !== 0 && e.longitude !== 0).map((e) => ({ event: e, type: "skill" as const }));
        const lendMarkers: EventMarker[] = lendEvents.filter(e => e.latitude !== 0 && e.longitude !== 0).map((e) => ({ event: e, type: "lend" as const }));

        setEventMarkersDisponibili(emergMarkers);
        setEventMarkersPotAjuta([...skillMarkers, ...lendMarkers, ...emergMarkers]);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [mounted]);

  const handleUserClick = useCallback((u: UserProfile) => { setSelectedUser(u); setSelectedEvent(null); }, []);
  const handleEventClick = useCallback((e: EventItem) => { setSelectedEvent(e); setSelectedUser(null); }, []);

  const q = searchQuery.toLowerCase().trim();

  const filteredUserMarkers = userMarkers.filter(({ user, lat, lng }) => {
    if (userLocation) {
      const dist = haversineKm(userLocation.lat, userLocation.lng, lat, lng);
      if (dist > radiusKm) return false;
    }
    if (!q) return true;
    return (
      user.skills.some((s) => s.toLowerCase().includes(q)) ||
      user.tools.some((t) => t.toLowerCase().includes(q)) ||
      user.fullName?.toLowerCase().includes(q)
    );
  });

  const filteredEventMarkers = (filter === "disponibili" ? eventMarkersDisponibili : eventMarkersPotAjuta).filter(({ event }) => {
    if (userLocation) {
      const dist = haversineKm(userLocation.lat, userLocation.lng, event.latitude, event.longitude);
      if (dist > radiusKm) return false;
    }
    if (!q) return true;
    const tags = Array.isArray(event.tags) ? event.tags : [];
    return (
      event.description?.toLowerCase().includes(q) ||
      tags.some((t) => t.toLowerCase().includes(q)) ||
      event.createdByFullName?.toLowerCase().includes(q)
    );
  });

  const activeUserMarkers = filter === "disponibili" ? filteredUserMarkers : [];
  const activeEventMarkers = filteredEventMarkers;
  const isLoading = loadingUsers || loadingEvents;

  if (!mounted) return null;

  return (
    <>
      <div className="map-fixed-container" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          <MarkersLayer
            userMarkers={activeUserMarkers}
            eventMarkers={activeEventMarkers}
            onUserClick={handleUserClick}
            onEventClick={handleEventClick}
          />
        </MapContainer>

        <div className="map-search-bar">
          <Image src="/navbar.svg" alt="" fill className="object-cover opacity-100" />
          <div className="map-search-bar-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="map-search-icon">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="map-search-input"
              placeholder={filter === "disponibili" ? "Type what you need..." : "Find someone to help with..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="map-search-clear" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
        </div>

        <div className="filter-bar">
          <button
            className={`filter-btn ${filter === "disponibili" ? "filter-btn--active" : ""}`}
            onClick={() => { setFilter("disponibili"); setSearchQuery(""); }}
          >
            👤 Available
          </button>
          <button
            className={`filter-btn ${filter === "pot-ajuta" ? "filter-btn--active pot-ajuta-active" : ""}`}
            onClick={() => { setFilter("pot-ajuta"); setSearchQuery(""); }}
          >
            🤝 Can Help
          </button>
        </div>

        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot skill-dot" />Skills</div>
          <div className="legend-item"><span className="legend-dot tool-dot" />Tools</div>
          <div className="legend-item"><span className="legend-dot emerg-dot" />Emergency</div>
        </div>

        <div
          ref={radiusRef}
          className="map-radius-control"
          onClick={() => { if (!userLocation) setShowLocationModal(true); }}
          style={{ cursor: !userLocation ? "pointer" : "default" }}
        >
          <div className="map-radius-control-content">
            <input
              type="number"
              min={1}
              max={300}
              value={radiusKm}
              onChange={(e) => {
                if (!userLocation) return;
                setRadiusKm(Math.max(1, Math.min(300, Number(e.target.value))));
              }}
              readOnly={!userLocation}
              className="map-radius-input"
              style={{ cursor: !userLocation ? "pointer" : "text" }}
            />
            <span className="map-radius-label">KM</span>
          </div>
        </div>

        {isLoading && (
          <div className="map-loading">
            <div className="map-loading-dot" />
            <span>Se incarca harta...</span>
          </div>
        )}
      </div>

      {showLocationModal && (
        <LocationModal onClose={() => setShowLocationModal(false)} />
      )}
      {selectedUser && <ProfileCard user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {selectedEvent && <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </>
  );
}