"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import { useRadius } from "@/context/RadiusContext";

const DEFAULT_CENTER: [number, number] = [27.6014, 47.1585];
const DEFAULT_ZOOM = 12;
const API = process.env.NEXT_PUBLIC_API_URL;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type FilterMode = "disponibili" | "pot-ajuta";
type MarkerFilterType = "skills" | "tools" | "all";

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

interface SelectedUser {
  user: UserProfile;
  filterType: MarkerFilterType;
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

function seededGeoOffset(seed: number): [number, number] {
  const dLng = ((seed % 233280) / 233280 - 0.5) * 0.002;
  const dLat = (((seed * 6971) % 233280) / 233280 - 0.5) * 0.002;
  return [dLng, dLat];
}

function LocationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="bg-[#1C1C1C] rounded-3xl p-6 w-full max-w-sm border border-white/10 flex flex-col gap-5 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          <h2 className="text-white font-bold text-lg font-montagu">Location Required</h2>
          <p className="text-white/50 text-sm leading-relaxed">To filter by radius, you need to set your location in your profile first.</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push("/profile/settings/personal")} className="w-full bg-green-light text-black font-bold py-3 rounded-xl hover:bg-green-light/85 transition-colors">Go to Settings</button>
          <button onClick={onClose} className="w-full border border-white/20 text-white/60 font-medium py-3 rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ProfileCard({ user, onClose, filterType }: { user: UserProfile; onClose: () => void; filterType: MarkerFilterType }) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setCurrentUserId(d.id));
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
            {user.avatarUrl ? <Image src={user.avatarUrl} alt={name} width={64} height={64} className="object-cover w-full h-full" /> : <span className="text-white font-bold text-xl">{initials}</span>}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h2 className="pc-name">{name}</h2>
            <div className="flex items-center gap-3">
              <div className="pc-trust">
                <span className="pc-trust-label">Trust<br />score</span>
                <div className="pc-trust-divider" />
                <span className="pc-trust-value">{Math.round(user.trustScore)}%</span>
              </div>
              {isOwn ? <span className="ec-your-post">Your profile</span> : <button className="ec-contact-btn" onClick={handleContact}>💬 Contact</button>}
            </div>
          </div>
        </div>
        {user.bio && <div className="pc-section bio-section"><p className="pc-bio">{user.bio}</p></div>}
        {filterType !== "tools" && user.skills.length > 0 && (
          <div className="pc-section skills-section">
            <h3 className="pc-section-title skills-title">★ Skills</h3>
            <div className="pc-grid">{user.skills.map((s, i) => <div key={i} className="pc-item"><span className="pc-dot skill-dot" />{s}</div>)}</div>
          </div>
        )}
        {filterType !== "skills" && user.tools.length > 0 && (
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
  const [authorProfile, setAuthorProfile] = useState<{ trustScore: number; avatarUrl?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const h = { Authorization: `Bearer ${token}` };
    fetch(`${API}/api/user/profile`, { headers: h }).then((r) => r.json()).then((d) => setCurrentUserId(d.id));
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
    Skill: { label: "Skill", color: "#FFD700", bg: "rgba(255,215,0,0.15)" },
    Lend: { label: "Lend", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  };
  const t = typeMap[typeStr ?? "Skill"] ?? typeMap["Skill"];
  const name = event.createdByFullName || event.createdByEmail?.split("@")[0] || "Unknown";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const isOwn = currentUserId !== null && currentUserId === event.createdByUserId;
  const tagsArray: string[] = Array.isArray(event.tags) ? event.tags : typeof event.tags === "string" && event.tags.trim() !== "" ? event.tags.split(",").map((tag) => tag.trim()) : [];

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-card" onClick={(e) => e.stopPropagation()}>
        <div className="pc-header">
          <div className="pc-avatar overflow-hidden bg-[#2e2e2e] flex items-center justify-center">
            {authorProfile?.avatarUrl ? <Image src={authorProfile.avatarUrl} alt={name} width={64} height={64} className="object-cover w-full h-full" /> : <span className="text-white font-bold text-xl">{initials}</span>}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h2 className="pc-name">{name}</h2>
            <div className="flex items-center gap-3">
              <div className="pc-trust">
                <span className="pc-trust-label">Trust<br />score</span>
                <div className="pc-trust-divider" />
                <span className="pc-trust-value">{Math.round(authorProfile?.trustScore ?? 0)}%</span>
              </div>
              {isOwn ? <span className="ec-your-post">Your post</span> : <button className="ec-contact-btn" onClick={handleContact}>💬 Contact</button>}
            </div>
          </div>
          <div className="ec-corner-badge" style={{ color: t.color, background: t.bg, border: `1px solid ${t.color}` }}>{t.label}</div>
        </div>
        {event.imageUrl && <div className="ec-image-wrap"><img src={event.imageUrl.startsWith("http") ? event.imageUrl : `${API}${event.imageUrl}`} alt="event" className="ec-image" /></div>}
        <div className="pc-section bio-section">
          <p className="pc-bio" dangerouslySetInnerHTML={{ __html: event.description }} />
          {typeStr === "Emergency" && <span className="ec-verified">Verified info</span>}
        </div>
        {tagsArray.length > 0 && (
          <div className="pc-section" style={{ border: `2px solid ${t.color}` }}>
            <h3 className="pc-section-title" style={{ color: t.color, marginBottom: 10 }}>
              {typeStr === "Skill" ? "★ Skill required" : typeStr === "Lend" ? "⚙ Tool needed" : "⚠ Details"}
            </h3>
            <div className="ec-tags">{tagsArray.map((tag, i) => <span key={i} className="ec-tag" style={{ color: t.color, borderColor: t.color }}>{tag}</span>)}</div>
          </div>
        )}
      </div>
    </div>
  );
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
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const radiusRef = useRef<HTMLDivElement>(null);
  const { radiusKm, setRadiusKm } = useRadius();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current || mapRef.current) return;

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      mapRef.current = map;
    };

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("token");
    fetch(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.latitude && d.longitude) setUserLocation({ lat: d.latitude, lng: d.longitude }); });
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
          if (user.latitude && user.longitude) results.push({ ...entry, lat: user.latitude, lng: user.longitude });
        }
        setUserMarkers(results);
      } finally { setLoadingUsers(false); }
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
      } finally { setLoadingEvents(false); }
    };
    fetchEvents();
  }, [mounted]);

  const handleUserClick = useCallback((user: UserProfile, filterType: MarkerFilterType) => {
    setSelectedUser({ user, filterType });
    setSelectedEvent(null);
  }, []);

  const handleEventClick = useCallback((e: EventItem) => { setSelectedEvent(e); setSelectedUser(null); }, []);

  const q = searchQuery.toLowerCase().trim();

  const filteredUserMarkers = userMarkers.filter(({ user, lat, lng }) => {
    if (userLocation && haversineKm(userLocation.lat, userLocation.lng, lat, lng) > radiusKm) return false;
    if (!q) return true;
    return user.skills.some((s) => s.toLowerCase().includes(q)) || user.tools.some((t) => t.toLowerCase().includes(q)) || user.fullName?.toLowerCase().includes(q);
  });

  const filteredEventMarkers = (filter === "disponibili" ? eventMarkersDisponibili : eventMarkersPotAjuta).filter(({ event }) => {
    if (userLocation && haversineKm(userLocation.lat, userLocation.lng, event.latitude, event.longitude) > radiusKm) return false;
    if (!q) return true;
    const tags = Array.isArray(event.tags) ? event.tags : [];
    return event.description?.toLowerCase().includes(q) || tags.some((t) => t.toLowerCase().includes(q)) || event.createdByFullName?.toLowerCase().includes(q);
  });

  const activeUserMarkers = filter === "disponibili" ? filteredUserMarkers : [];
  const activeEventMarkers = filteredEventMarkers;
  const isLoading = loadingUsers || loadingEvents;

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const doUpdate = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      activeUserMarkers.forEach(({ user, lat, lng, hasSkills, hasTools }) => {
        const seed = user.id * 9301 + 49297;
        const [dLng, dLat] = seededGeoOffset(seed);

        const addCircleMarker = (color: string, filterType: MarkerFilterType, extraDLng = 0) => {
          const el = document.createElement("div");
          el.style.cssText = `width:28px !important;height:28px !important;min-width:28px !important;min-height:28px !important;max-width:28px !important;max-height:28px !important;border-radius:50%;background:${color}40;border:2px solid ${color};cursor:pointer;box-sizing:border-box;`;
          el.addEventListener("click", (e) => { e.stopPropagation(); handleUserClick(user, filterType); });
          const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([lng + dLng + extraDLng, lat + dLat])
            .addTo(map);
          markersRef.current.push(marker);
        };

        if (hasSkills && hasTools) {
          addCircleMarker("#FF8C00", "all", 0);
        } else if (hasSkills) {
          addCircleMarker("#FFD700", "skills", 0);
        } else {
          addCircleMarker("#3B82F6", "tools", 0);
        }
      });

      activeEventMarkers.forEach(({ event, type }) => {
        const seed = event.id * 6271 + 12347;
        const [dLng, dLat] = seededGeoOffset(seed);
        const color = type === "skill" ? "#FFD700" : "#3B82F6";
        const el = document.createElement("div");

        if (type === "emergency") {
          el.style.cssText = `width:30px !important;height:30px !important;min-width:30px !important;min-height:30px !important;max-width:30px !important;max-height:30px !important;border-radius:50%;background:#EF4444;border:2px solid #EF4444;box-shadow:0 0 12px rgba(239,68,68,0.8),0 0 24px rgba(239,68,68,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;box-sizing:border-box;`;
          el.innerHTML = "🚨";
          el.addEventListener("click", (e) => { e.stopPropagation(); handleEventClick(event); });
          const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([event.longitude, event.latitude])
            .addTo(map);
          markersRef.current.push(marker);
        } else {
          el.style.cssText = `width:28px !important;height:28px !important;min-width:28px !important;min-height:28px !important;max-width:28px !important;max-height:28px !important;border-radius:50%;background:${color}40;border:2px solid ${color};cursor:pointer;box-sizing:border-box;`;
          el.addEventListener("click", (e) => { e.stopPropagation(); handleEventClick(event); });
          const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([event.longitude + dLng, event.latitude + dLat])
            .addTo(map);
          markersRef.current.push(marker);
        }
      });
    };

    if (map.isStyleLoaded()) {
      doUpdate();
    } else {
      map.once("load", doUpdate);
    }
  }, [activeUserMarkers, activeEventMarkers, handleUserClick, handleEventClick]);

  if (!mounted) return null;

  return (
    <>
      <div className="map-fixed-container" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

        <div className="map-search-bar">
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
            {searchQuery && <button className="map-search-clear" onClick={() => setSearchQuery("")}>✕</button>}
          </div>
        </div>

        <div className="filter-bar">
          <button className={`filter-btn ${filter === "disponibili" ? "filter-btn--active" : ""}`} onClick={() => { setFilter("disponibili"); setSearchQuery(""); }}>👤 Available</button>
          <button className={`filter-btn ${filter === "pot-ajuta" ? "filter-btn--active pot-ajuta-active" : ""}`} onClick={() => { setFilter("pot-ajuta"); setSearchQuery(""); }}>🤝 Can Help</button>
        </div>

        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot skill-dot" />Skills</div>
          <div className="legend-item"><span className="legend-dot tool-dot" />Tools</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: "#FF8C00" }} />Skills & Tools</div>
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
              type="number" min={1} max={300} value={radiusKm}
              onChange={(e) => { if (!userLocation) return; setRadiusKm(Math.max(1, Math.min(300, Number(e.target.value)))); }}
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

      {showLocationModal && <LocationModal onClose={() => setShowLocationModal(false)} />}
      {selectedUser && (
        <ProfileCard
          user={selectedUser.user}
          filterType={selectedUser.filterType}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {selectedEvent && <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </>
  );
}