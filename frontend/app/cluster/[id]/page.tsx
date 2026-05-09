"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import GoBackButton from "@/components/ui/GoBackButton";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { Cluster } from "@/types/Cluster";
import { Event } from "@/types/Event";
import { useUser } from "@/context/UserContext";

const API = "http://localhost:5248";

export default function ClusterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useUser();

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/cluster/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCluster(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleResolve = async () => {
    if (!cluster || resolving) return;
    setResolving(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/cluster/${id}/resolve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setResolving(false);
    }
  };

  const handleDeletePost = (eventId: number) => {
    setCluster((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        events: prev.events?.filter((e) => e.id !== eventId),
        eventCount: (prev.eventCount ?? 1) - 1,
      };
    });
  };

  const Layout = isAdmin ? ThreeColumnLayoutAdmin : ThreeColumnLayout;

  if (loading) {
    return (
      <Layout>
        <div className="w-full flex flex-col gap-4 mt-4 pb-20">
          <div className="h-10 w-40 bg-secondary rounded-xl animate-pulse mx-auto" />
          {[1, 2].map((i) => (
            <div key={i} className="w-full bg-secondary rounded-2xl p-5 animate-pulse h-40" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!cluster) {
    return (
      <Layout>
        <div className="flex items-center justify-center mt-20">
          <p className="text-white/40 text-sm">Cluster not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4 animate-fade-up pb-20 mt-4">
        {/* Mobile header */}
        <div className="flex items-center relative mb-2 lg:hidden">
          <GoBackButton />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white font-bold text-xl font-montagu">{cluster.subType}</h1>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-3 mb-2">
          <GoBackButton />
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-white font-bold text-2xl font-montagu">{cluster.subType}</h1>
            <span className="text-white/40 text-sm">+{cluster.eventCount} posts</span>
          </div>
        </div>

        {/* Mobile post count */}
        <p className="text-white/40 text-sm text-center lg:hidden">+{cluster.eventCount} posts</p>

        {/* Admin: Has this been resolved? */}
        {isAdmin && (
          <div className="flex flex-col items-center gap-3 py-4 border-y border-white/10">
            <p className="text-white/60 text-sm">— Has this been resolved? —</p>
            <div className="flex gap-4">
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="px-8 py-3 rounded-2xl bg-green-light text-black font-bold text-sm hover:bg-green-light/80 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resolving ? "Resolving..." : "Yes"}
              </button>
              <button
                className="px-8 py-3 rounded-2xl bg-red-emergency text-white font-bold text-sm hover:bg-red-emergency/80 transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Post list */}
        <div className="flex flex-col gap-3 mt-2">
          {(cluster.events ?? []).map((event: Event) => (
            <EventCard
              key={event.id}
              event={event}
              isAdminView={isAdmin}
              onDelete={handleDeletePost}
            />
          ))}
          {(cluster.events ?? []).length === 0 && (
            <p className="text-white/40 text-sm text-center mt-10">No active posts in this cluster.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
