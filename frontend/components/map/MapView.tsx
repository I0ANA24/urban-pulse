"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "./map.css";

const DEFAULT_CENTER: [number, number] = [47.1585, 27.6014];
const DEFAULT_ZOOM = 13;
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
  address?: string;
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

function makeUserIcon(color: string, shadow: string, offset: number, symbol: string) {
  return L.divIcon({
    className: "",
    html: `<div class="map-marker" style="transform:translateX(${offset}px)">
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 9.8 14 22 14 22s14-12.2 14-22C28 6.268 21.732 0 14 0z" fill="${color}" style="filter:drop-shadow(0 2px 8px ${shadow})"/>
        <circle cx="14" cy="13" r="5.5" fill="#1C1C1C"/>
        <text x="14" y="17" text-anchor="middle" font-size="7" fill="${color}">${symbol}</text>
      </svg>
    </div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

function makeEventIcon(color: string, shadow: string, symbol: string) {
  return L.divIcon({
    className: "",
    html: `<div class="map-marker">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 24 16 24s16-12.8 16-24C32 7.163 24.837 0 16 0z" fill="${color}" style="filter:drop-shadow(0 2px 10px ${shadow})"/>
        <circle cx="16" cy="15" r="7" fill="#1C1C1C"/>
        <text x="16" y="19.5" text-anchor="middle" font-size="9" fill="${color}">${symbol}</text>
      </svg>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
}

const ICONS = {
  skillOnly:    () => makeUserIcon("#FFD700", "rgba(255,215,0,0.5)",   0,   "★"),
  toolOnly:     () => makeUserIcon("#3B82F6", "rgba(59,130,246,0.5)",  0,   "⚙"),
  bothSkill:    () => makeUserIcon("#FFD700", "rgba(255,215,0,0.5)",  -10,  "★"),
  bothTool:     () => makeUserIcon("#3B82F6", "rgba(59,130,246,0.5)", +10,  "⚙"),
  eventSkill:   () => makeEventIcon("#FFD700", "rgba(255,215,0,0.6)", "★"),
  eventLend:    () => makeEventIcon("#3B82F6", "rgba(59,130,246,0.6)", "⚙"),
  emergency:    () => makeEventIcon("#EF4444", "rgba(239,68,68,0.6)",  "!"),
};

async function geocode(address: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { "Accept-Language": "ro,en" } }
    );
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

function ProfileCard({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setCurrentUserId(d.id));
  }, []);

  const handleContact = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5248/api/chat/conversations", {
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
  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-card" onClick={(e) => e.stopPropagation()}>
        <div className="pc-header">
          <div className="pc-avatar">
            <Image src="/profile.png" alt={name} width={64} height={64} className="object-cover w-full h-full" />
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
                <button className="ec-contact-btn" onClick={handleContact}>
                  💬 Contact
                </button>
              )}
            </div>
          </div>
        </div>
        {user.bio && <div className="pc-section bio-section"><p className="pc-bio">{user.bio}</p></div>}
        {user.skills.length > 0 && (
          <div className="pc-section skills-section">
            <h3 className="pc-section-title skills-title">★ Skills</h3>
            <div className="pc-grid">
              {user.skills.map((s, i) => <div key={i} className="pc-item"><span className="pc-dot skill-dot" />{s}</div>)}
            </div>
          </div>
        )}
        {user.tools.length > 0 && (
          <div className="pc-section tools-section">
            <h3 className="pc-section-title tools-title">⚙ Tools & Resources</h3>
            {user.tools.map((t, i) => <div key={i} className="pc-item"><span className="pc-dot tool-dot" />{t}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [authorTrustScore, setAuthorTrustScore] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const h = { Authorization: `Bearer ${token}` };

    fetch(`${API}/api/user/profile`, { headers: h })
      .then((r) => r.json())
      .then((d) => setCurrentUserId(d.id));

    fetch(`${API}/api/user/${event.createdByUserId}`, { headers: h })
      .then((r) => { if (r.ok) return r.json(); return null; })
      .then((d) => { if (d) setAuthorTrustScore(d.trustScore ?? 0); })
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
    Emergency: { label: "🚨 Emergency", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
    Skill:     { label: "★ Skill",      color: "#FFD700", bg: "rgba(255,215,0,0.15)" },
    Lend:      { label: "⚙ Lend",       color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
    General:   { label: "📌 General",   color: "#9ca3af", bg: "rgba(156,163,175,0.15)" },
  };
  const t = typeMap[typeStr ?? "Skill"] ?? typeMap["Skill"];
  const name = event.createdByFullName || event.createdByEmail?.split("@")[0] || "Unknown";
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
          <div className="pc-avatar">
            <Image src="/profile.png" width={64} height={64} alt="profile" className="object-cover w-full h-full" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h2 className="pc-name">{name}</h2>
            <div className="flex items-center gap-3">
              <div className="pc-trust">
                <span className="pc-trust-label">Trust<br />score</span>
                <div className="pc-trust-divider" />
                <span className="pc-trust-value">{Math.round(authorTrustScore)}%</span>
              </div>
              {isOwn ? (
                <span className="ec-your-post">Your post</span>
              ) : (
                <button className="ec-contact-btn" onClick={handleContact}>
                  💬 Contact
                </button>
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
          {event.type === "Emergency" && (
            <span className="ec-verified">Verified info</span>
          )}
        </div>

        {tagsArray.length > 0 && (
          <div className="pc-section" style={{ border: `2px solid ${t.color}` }}>
            <h3 className="pc-section-title" style={{ color: t.color, marginBottom: 10 }}>
              {typeStr === "Skill" ? "★ Skill required" : typeStr === "Lend" ? "⚙ Tool needed" : "⚠ Details"}
            </h3>
            <div className="ec-tags">
              {tagsArray.map((tag, i) => (
                <span key={i} className="ec-tag" style={{ color: t.color, borderColor: t.color }}>
                  {tag}
                </span>
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
  const refs = useRef<L.Marker[]>([]);

  useEffect(() => {
    refs.current.forEach((m) => map.removeLayer(m));
    refs.current = [];

    userMarkers.forEach(({ user, lat, lng, hasSkills, hasTools }) => {
      const add = (icon: L.DivIcon, cb: () => void) => {
        const m = L.marker([lat, lng], { icon }).addTo(map);
        m.on("click", cb);
        refs.current.push(m);
      };
      if (hasSkills && hasTools) {
        add(ICONS.bothSkill(), () => onUserClick(user));
        add(ICONS.bothTool(), () => onUserClick(user));
      } else if (hasSkills) {
        add(ICONS.skillOnly(), () => onUserClick(user));
      } else {
        add(ICONS.toolOnly(), () => onUserClick(user));
      }
    });

    eventMarkers.forEach(({ event, type }) => {
      const icon = type === "emergency" ? ICONS.emergency() : type === "skill" ? ICONS.eventSkill() : ICONS.eventLend();
      const m = L.marker([event.latitude, event.longitude], { icon }).addTo(map);
      m.on("click", () => onEventClick(event));
      refs.current.push(m);
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
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
  const [eventMarkersDisponibili, setEventMarkersDisponibili] = useState<EventMarker[]>([]);
  const [eventMarkersPotAjuta, setEventMarkersPotAjuta] = useState<EventMarker[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  useEffect(() => { setMounted(true); }, []);

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
          if (!entry.user.address) continue;
          await new Promise((r) => setTimeout(r, 1100));
          const coords = await geocode(entry.user.address);
          if (coords) results.push({ ...entry, lat: coords[0], lng: coords[1] });
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

  const activeUserMarkers = filter === "disponibili" ? userMarkers : [];
  const activeEventMarkers = filter === "disponibili" ? eventMarkersDisponibili : eventMarkersPotAjuta;
  const isLoading = loadingUsers || loadingEvents;

  if (!mounted) return null;

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
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

        <div className="filter-bar">
          <button
            className={`filter-btn ${filter === "disponibili" ? "filter-btn--active" : ""}`}
            onClick={() => setFilter("disponibili")}
          >
            <span className="filter-icon">👤</span>
            Available
          </button>
          <button
            className={`filter-btn ${filter === "pot-ajuta" ? "filter-btn--active pot-ajuta-active" : ""}`}
            onClick={() => setFilter("pot-ajuta")}
          >
            <span className="filter-icon">🤝</span>
            Can Help
          </button>
        </div>

        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot skill-dot" />Skills</div>
          <div className="legend-item"><span className="legend-dot tool-dot" />Tools</div>
          <div className="legend-item"><span className="legend-dot emerg-dot" />Emergency</div>
        </div>

        {isLoading && (
          <div className="map-loading">
            <div className="map-loading-dot" />
            <span>Se incarca harta...</span>
          </div>
        )}
      </div>

      {selectedUser && <ProfileCard user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {selectedEvent && <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </>
  );
}