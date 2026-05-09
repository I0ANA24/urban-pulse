"use client";

import { useState, useEffect } from "react";
import { X, Plus, AlertTriangle, ShieldCheck, ShieldOff } from "lucide-react";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { useCrisisMode } from "@/context/CrisisModeContext";
import { DEFAULT_INCIDENT_TYPES } from "@/lib/constants";
import { Event, EventType } from "@/types/Event";
import EventCard from "@/components/events/EventCard";

const API = "http://localhost:5248";

const INCIDENT_KEYS = new Set(DEFAULT_INCIDENT_TYPES.map((t) => t.key));

export default function AdminCrisisPage() {
  const { isCrisisActive, setIsCrisisActive } = useCrisisMode();

  const [incidentTypes, setIncidentTypes] = useState(DEFAULT_INCIDENT_TYPES);
  const [newTypeLabel, setNewTypeLabel] = useState("");

  const [incidentEvents, setIncidentEvents] = useState<Event[]>([]);
  const [verifiedIds, setVerifiedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/event`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Event[]) => {
        const typeMap: Record<number, EventType> = {
          0: "General", 1: "Emergency", 2: "Skill", 3: "Lend", 4: "LostPet", 5: "FoundPet",
        };
        const emergencyIncidents = data.filter((e) => {
          const t = typeof e.type === "number" ? typeMap[e.type] : e.type;
          return t === "Emergency" && Array.isArray(e.tags) && e.tags.some((tag) => INCIDENT_KEYS.has(tag));
        });
        setIncidentEvents(emergencyIncidents);
      })
      .catch(() => {});
  }, []);

  const handleAddType = () => {
    const trimmed = newTypeLabel.trim();
    if (!trimmed) return;
    const key = trimmed.toUpperCase().replace(/\s+/g, "_");
    if (incidentTypes.some((t) => t.key === key)) return;
    setIncidentTypes((prev) => [...prev, { key, label: trimmed, icon: "⚠️" }]);
    setNewTypeLabel("");
  };

  const handleRemoveType = (key: string) => {
    setIncidentTypes((prev) => prev.filter((t) => t.key !== key));
  };

  const handleVerifyAndActivate = (eventId: number) => {
    setVerifiedIds((prev) => new Set(prev).add(eventId));
    setIsCrisisActive(true);
    // TODO: colleague connects: PUT /api/event/{eventId}/admin-verify
  };

  return (
    <ThreeColumnLayoutAdmin>
      <div className="w-full flex flex-col gap-6 py-6">

        {/* Crisis Mode Toggle */}
        <div className="bg-secondary rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-xl font-montagu uppercase">Crisis Mode</h2>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase
                ${isCrisisActive ? "bg-red-emergency/20 text-red-emergency" : "bg-white/10 text-white/50"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isCrisisActive ? "bg-red-emergency animate-pulse" : "bg-white/30"}`}
              />
              {isCrisisActive ? "Active" : "Inactive"}
            </div>
          </div>

          <p className="text-white/40 text-sm">
            {isCrisisActive
              ? "Crisis mode is currently active. Users see only Emergency posts."
              : "Activate crisis mode to restrict the feed to Emergency posts and alert all users."}
          </p>

          <button
            onClick={() => setIsCrisisActive(!isCrisisActive)}
            className={`w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer
              ${isCrisisActive
                ? "bg-white/10 text-white hover:bg-white/15"
                : "bg-red-emergency text-white hover:bg-red-emergency/85"}`}
          >
            {isCrisisActive ? (
              <><ShieldOff size={20} /> Deactivate Crisis Mode</>
            ) : (
              <><ShieldCheck size={20} /> Activate Crisis Mode</>
            )}
          </button>
        </div>

        {/* Emergency Incident Reports */}
        <div className="bg-secondary rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-emergency" />
            <h2 className="text-white font-bold text-xl font-montagu uppercase">Incident Reports</h2>
            {incidentEvents.length > 0 && (
              <span className="ml-auto bg-red-emergency/20 text-red-emergency text-xs font-bold px-2.5 py-1 rounded-full">
                {incidentEvents.length}
              </span>
            )}
          </div>
          <p className="text-white/40 text-sm">
            Emergency posts with incident sub-types. Verifying one activates Crisis Mode.
          </p>

          {incidentEvents.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-4">No incident reports yet.</p>
          ) : (
            <div className="flex flex-col">
              {incidentEvents.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  crisisVerify={{
                    isVerified: verifiedIds.has(e.id),
                    onVerify: () => handleVerifyAndActivate(e.id),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Incident Types Manager */}
        <div className="bg-secondary rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-emergency" />
            <h2 className="text-white font-bold text-xl font-montagu uppercase">Incident Types</h2>
          </div>
          <p className="text-white/40 text-sm">
            These types appear when users report an emergency. Admins can add or remove custom types.
          </p>

          <div className="flex flex-wrap gap-2">
            {incidentTypes.map((incident) => (
              <div
                key={incident.key}
                className="flex items-center gap-1.5 bg-background border border-red-emergency/30 rounded-[10px] px-3 py-2"
              >
                <span className="text-sm">{incident.icon}</span>
                <span className="text-red-emergency/90 text-xs font-bold uppercase">{incident.label}</span>
                <button
                  onClick={() => handleRemoveType(incident.key)}
                  className="ml-1 text-white/30 hover:text-red-emergency transition-colors cursor-pointer"
                >
                  <X size={13} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newTypeLabel}
              onChange={(e) => setNewTypeLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddType()}
              placeholder="New incident type..."
              className="flex-1 bg-input border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-red-emergency/50 transition-colors"
            />
            <button
              onClick={handleAddType}
              disabled={!newTypeLabel.trim()}
              className="bg-red-emergency text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-red-emergency/85 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add
            </button>
          </div>
        </div>

      </div>
    </ThreeColumnLayoutAdmin>
  );
}
