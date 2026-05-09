"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import EventCard from "@/components/events/EventCard";
import ClusterCard from "@/components/events/ClusterCard";
import { Event } from "@/types/Event";
import { Cluster } from "@/types/Cluster";
import { GlobalCrisis } from "@/types/GlobalCrisis";
import GoBackButton from "@/components/ui/GoBackButton";

const API = "http://localhost:5248";

interface EmergencySubtype {
  id: number;
  name: string;
  createdAt: string;
}

export default function CrisesHandlingPage() {
  const [subtypes, setSubtypes] = useState<EmergencySubtype[]>([]);
  const [newSubtype, setNewSubtype] = useState("");
  const [subtypesLoading, setSubtypesLoading] = useState(true);
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [emergencyPosts, setEmergencyPosts] = useState<Event[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [globalCrises, setGlobalCrises] = useState<GlobalCrisis[]>([]);
  const [crisisLoading, setCrisisLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/emergencysubtype`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubtypes(data);
        setSubtypesLoading(false);
      })
      .catch(() => setSubtypesLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch(`${API}/api/event/type/Emergency`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${API}/api/cluster`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${API}/api/crisis`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([postsData, clustersData, crisisData]) => {
        setEmergencyPosts(Array.isArray(postsData) ? postsData : []);
        setClusters(Array.isArray(clustersData) ? clustersData : []);
        setGlobalCrises(Array.isArray(crisisData) ? crisisData : []);
        setPostsLoading(false);
        setCrisisLoading(false);
      })
      .catch(() => {
        setPostsLoading(false);
        setCrisisLoading(false);
      });
  }, []);

  const handleAddSubtype = async () => {
    const trimmed = newSubtype.trim();
    if (!trimmed || adding) return;
    setAddError(null);
    setAdding(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/emergencysubtype`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const created = await res.json();
        setSubtypes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        setNewSubtype("");
      } else if (res.status === 409) {
        setAddError("This subtype already exists.");
      } else {
        setAddError("Failed to add subtype.");
      }
    } catch {
      setAddError("Failed to add subtype.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSubtype = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/emergencysubtype/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setSubtypes((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleDeletePost = (id: number) => {
    setEmergencyPosts((prev) => prev.filter((e) => e.id !== id));
  };

  const handleActivateGlobal = async (subType: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/crisis/activate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ subType }),
    });
    if (res.ok) {
      const created = await res.json();
      setGlobalCrises((prev) => [created, ...prev.filter((g) => g.subType !== subType)]);
    }
  };

  const handleDeactivateGlobal = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/crisis/${id}/deactivate`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setGlobalCrises((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const standalonePosts = emergencyPosts.filter((e) => e.clusterId == null);
  const totalCount = clusters.length + standalonePosts.length;

  return (
    <ThreeColumnLayoutAdmin>
      <div className="w-full flex flex-col gap-6 animate-fade-up pb-20 mt-4">
        {/* Mobile header */}
        <div className="flex items-center relative mb-2 lg:hidden">
          <GoBackButton />
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <h1 className="text-white font-bold text-xl">Crises Handling</h1>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-3 mb-2">
          <div className="flex-1 h-px bg-white/60" />
          <h1 className="text-white font-bold text-xl">Crises Handling</h1>
          <div className="flex-1 h-px bg-white/60" />
        </div>

        {/* Emergency Subtypes section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-white/70 font-bold text-sm uppercase tracking-widest border-b border-white/10 pb-2">
            Emergency Subtypes
          </h2>

          {subtypesLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 w-28 bg-secondary rounded-[10px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subtypes.length === 0 && (
                <p className="text-white/30 text-sm">No subtypes yet. Add the first one below.</p>
              )}
              {subtypes.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] cursor-default"
                  style={{ backgroundColor: "#A53A3A" }}
                >
                  <span className="text-[10px] font-bold uppercase text-white tracking-wide">
                    {sub.name}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtype(sub.id)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newSubtype}
              onChange={(e) => {
                setNewSubtype(e.target.value);
                setAddError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubtype();
              }}
              placeholder="New subtype (e.g. Gas Leak)"
              className="flex-1 bg-secondary text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-white/10 focus:border-white/30 transition-colors placeholder:text-white/30"
            />
            <button
              onClick={handleAddSubtype}
              disabled={!newSubtype.trim() || adding}
              className="bg-red-emergency text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-red-emergency/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
          {addError && (
            <p className="text-red-400 text-xs px-1">{addError}</p>
          )}
        </section>

        {/* Global Crisis section */}
        <section className="flex flex-col gap-4 mt-2">
          <h2 className="text-white/70 font-bold text-sm uppercase tracking-widest border-b border-white/10 pb-2">
            Global Crisis
          </h2>

          {crisisLoading ? (
            <div className="h-8 w-48 bg-secondary rounded-xl animate-pulse" />
          ) : (
            <div className="flex flex-col gap-3">
              {globalCrises.length === 0 && (
                <p className="text-white/30 text-sm">No active global crisis.</p>
              )}
              {globalCrises.map((g) => (
                <div key={g.id} className="flex items-center justify-between bg-red-emergency/10 border border-red-emergency/30 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">{g.subType}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-emergency text-white">
                      {g.isManuallyActivated ? "Manual" : "Auto"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeactivateGlobal(g.id)}
                    className="text-white/50 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Deactivate
                  </button>
                </div>
              ))}

              {/* Activate buttons for subtypes not already in global crisis */}
              <div className="flex flex-wrap gap-2 mt-1">
                {subtypes
                  .filter((s) => !globalCrises.some((g) => g.subType === s.name))
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleActivateGlobal(s.name)}
                      className="px-3 py-1.5 rounded-[10px] text-[10px] font-bold uppercase text-white border border-red-emergency/50 hover:bg-red-emergency/20 transition-colors cursor-pointer"
                    >
                      + {s.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </section>

        {/* Emergency content section */}
        <section className="flex flex-col gap-4 mt-2">
          <h2 className="text-white/70 font-bold text-sm uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
            Emergency Posts
            {!postsLoading && (
              <span className="text-white/40 font-normal normal-case tracking-normal">
                ({totalCount})
              </span>
            )}
          </h2>

          {postsLoading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full bg-secondary rounded-2xl p-5 animate-pulse h-32" />
              ))}
            </div>
          )}

          {!postsLoading && totalCount === 0 && (
            <p className="text-white/40 text-sm text-center mt-10">
              No active emergency posts.
            </p>
          )}

          {!postsLoading && (
            <div className="flex flex-col gap-3">
              {/* Active clusters */}
              {clusters.map((cluster) => (
                <ClusterCard key={`cluster-${cluster.id}`} cluster={cluster} />
              ))}

              {/* Standalone (non-clustered) posts */}
              {standalonePosts.map((event) => (
                <EventCard
                  key={`event-${event.id}`}
                  event={event}
                  isAdminView={true}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </ThreeColumnLayoutAdmin>
  );
}
