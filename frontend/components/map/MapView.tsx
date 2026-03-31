"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import "./map.css";

const DEFAULT_CENTER: [number, number] = [47.1585, 27.6014];
const DEFAULT_ZOOM = 13;

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

interface UserMarker {
  user: UserProfile;
  lat: number;
  lng: number;
}

function createSkillIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div class="skill-marker">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FFD700"/>
          <circle cx="12" cy="9" r="2.5" fill="#1C1C1C"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { "Accept-Language": "ro,en" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {}
  return null;
}

// Profile card overlay
function ProfileCard({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const displayName = user.fullName ?? user.email?.split("@")[0] ?? "User";

  return (
    <div className="profile-card-overlay" onClick={onClose}>
      <div className="profile-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-card-header">
          <div className="profile-card-avatar">
            <Image src="/profile.png" alt={displayName} width={64} height={64} className="object-cover w-full h-full" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="profile-card-name">{displayName}</h2>
            <div className="trust-badge">
              <span className="trust-label">Trust score</span>
              <div className="trust-divider" />
              <span className="trust-value">{Math.round(user.trustScore)}%</span>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="profile-card-section">
            <p className="profile-card-bio">{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        <div className="profile-card-section">
          <h3 className="profile-card-section-title">Skills</h3>
          {user.skills.length > 0 ? (
            <div className="skills-grid">
              {user.skills.map((skill, i) => (
                <div key={i} className="skill-item">
                  <span className="skill-dot" />
                  {skill}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No skills listed</p>
          )}
        </div>

        {/* Tools */}
        {user.tools.length > 0 && (
          <div className="profile-card-section">
            <h3 className="profile-card-section-title">Tools & Resources</h3>
            <div className="flex flex-col gap-1">
              {user.tools.map((tool, i) => (
                <div key={i} className="skill-item">
                  <span className="skill-dot" />
                  {tool}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MarkersLayer({
  markers,
  onMarkerClick,
}: {
  markers: UserMarker[];
  onMarkerClick: (user: UserProfile) => void;
}) {
  const map = useMap();
  const skillIcon = createSkillIcon();

  useEffect(() => {
    markers.forEach(({ user, lat, lng }) => {
      const marker = L.marker([lat, lng], { icon: skillIcon }).addTo(map);
      marker.on("click", () => onMarkerClick(user));
    });

    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });
    };
  }, [markers, map, onMarkerClick]);

  return null;
}

export default function MapView() {
  const [mounted, setMounted] = useState(false);
  const [markers, setMarkers] = useState<UserMarker[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5248/api/User/with-skills", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const users: UserProfile[] = await res.json();

        const results: UserMarker[] = [];
        for (const user of users) {
          if (!user.address) continue;
          await new Promise((r) => setTimeout(r, 1100)); // Nominatim rate limit
          const coords = await geocodeAddress(user.address);
          if (coords) results.push({ user, lat: coords[0], lng: coords[1] });
        }
        setMarkers(results);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [mounted]);

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
          <MarkersLayer markers={markers} onMarkerClick={setSelectedUser} />
        </MapContainer>

        {/* Loading indicator */}
        {loading && (
          <div className="map-loading">
            <div className="map-loading-dot" />
            <span>Se încarcă utilizatorii...</span>
          </div>
        )}
      </div>

      {/* Profile card */}
      {selectedUser && (
        <ProfileCard user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  );
}