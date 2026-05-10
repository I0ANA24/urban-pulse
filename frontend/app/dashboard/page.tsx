"use client";

import { useEffect, useState, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PawPrint, FileText } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import ClusterCard from "@/components/events/ClusterCard";
import CrisisBanner from "@/components/layout/CrisisBanner";
import EventFilters from "@/components/dashboard/EventFilters";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import { Event, EventType } from "@/types/Event";
import { Cluster } from "@/types/Cluster";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { useSignalR } from "@/context/SignalRContext";
import { useSevereWeather } from "@/context/SevereWeatherContext";
import { useUser } from "@/context/UserContext";
import UrbanTitle from "@/components/ui/UrbanTitle";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

const API = "https://urbanpulsebackend-gedpgwakd5euh2bp.switzerlandnorth-01.azurewebsites.net";

function MobileSafetyPortal({ onClick }: { onClick: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 z-200 px-4 pb-2 bg-background transition-[top] duration-300 ease-out lg:hidden"
      style={{ top: scrolled ? 0 : "12vh" }}
    >
      <SafetyBanner onClick={onClick} />
    </div>,
    document.body
  );
}

function SafetyBanner({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative w-full animate-fade-up mt-4">
      <div className="absolute inset-0 bg-red-emergency rounded-2xl opacity-30" />
      <div
        onClick={onClick}
        className="relative w-full bg-red-emergency rounded-2xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📌</span>
          <div>
            <p className="text-white font-bold text-sm">Safety Check-in</p>
            <p className="text-white/60 text-xs">Tap to let neighbors know you&apos;re safe</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function MobileFabs() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-22 right-6 z-50 flex flex-col gap-3 items-center lg:hidden">
      <Link
        href="/documents"
        className="w-12 h-12 rounded-full bg-blue flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <FileText size={22} strokeWidth={2} className="text-white" />
      </Link>
      <Link
        href="/pets"
        className="w-14 h-14 rounded-full bg-green-light flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <PawPrint size={26} strokeWidth={2} fill="black" className="text-black" />
      </Link>
    </div>,
    document.body
  );
}

type FeedItem = { kind: "event"; data: Event } | { kind: "cluster"; data: Cluster };

function DashboardContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const { connection } = useSignalR();
  const { isSevereWeather } = useSevereWeather();
  const { isAdmin } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetEventId = searchParams.get("eventId");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [eventsRes, clustersRes] = await Promise.all([
          fetch(`${API}/api/event`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/cluster`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } else {
          setEvents([]);
        }

        if (clustersRes.ok) {
          const clustersData = await clustersRes.json();
          setClusters(Array.isArray(clustersData) ? clustersData : []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!connection) return;

    const handleNewEvent = (newEvent: Event) => {
      setEvents((prev) => [newEvent, ...prev]);
    };
    const handleEventDeactivated = (eventId: number) => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    };
    const handleClusterCreated = (cluster: Cluster) => {
      setClusters((prev) => [cluster, ...prev]);
    };
    const handleClusterUpdated = (cluster: Cluster) => {
      setClusters((prev) => prev.map((c) => (c.id === cluster.id ? cluster : c)));
    };
    const handleClusterResolved = (clusterId: number) => {
      setClusters((prev) => prev.filter((c) => c.id !== clusterId));
    };

    connection.on("NewEvent", handleNewEvent);
    connection.on("EventDeactivated", handleEventDeactivated);
    connection.on("ClusterCreated", handleClusterCreated);
    connection.on("ClusterUpdated", handleClusterUpdated);
    connection.on("ClusterResolved", handleClusterResolved);

    return () => {
      connection.off("NewEvent", handleNewEvent);
      connection.off("EventDeactivated", handleEventDeactivated);
      connection.off("ClusterCreated", handleClusterCreated);
      connection.off("ClusterUpdated", handleClusterUpdated);
      connection.off("ClusterResolved", handleClusterResolved);
    };
  }, [connection]);

  useEffect(() => {
    if (loading || !targetEventId) return;
    const el = document.getElementById(`event-${targetEventId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [loading, targetEventId]);

  const typeMap: Record<number, EventType> = {
    0: "General",
    1: "Emergency",
    2: "Skill",
    3: "Lend",
  };

  const filteredEvents = events.filter((e) => {
    const mappedType = typeof e.type === "number" ? typeMap[e.type] : (e.type as EventType);
    if (activeFilter !== "ALL" && EVENT_TAG_STYLES[mappedType]?.title !== activeFilter) {
      return false;
    }
    return true;
  });

  const filteredClusters = activeFilter === "ALL" || activeFilter === "EMERGENCY"
    ? clusters
    : [];

  const feedItems: FeedItem[] = [
    ...filteredEvents.map((e): FeedItem => ({ kind: "event", data: e })),
    ...filteredClusters.map((c): FeedItem => ({ kind: "cluster", data: c })),
  ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());

  return (
    <ThreeColumnLayout>
      {!isAdmin && <MobileFabs />}

      {isSevereWeather && (
        <MobileSafetyPortal onClick={() => router.push("/severe-chat")} />
      )}
      {isSevereWeather && <div className="lg:hidden h-[calc(5vh)]" />}
      {isSevereWeather && (
        <div className="hidden lg:block sticky top-0 z-50 w-full pt-2 pb-1 bg-background">
          <SafetyBanner onClick={() => router.push("/severe-chat")} />
        </div>
      )}

      <div className="hidden lg:block sticky top-0 z-40 w-full pt-2 pb-1 bg-background">
        <CrisisBanner />
      </div>

      <div className="w-full py-2 flex flex-col items-center gap-4 mb-4 mt-4">
        <div className="lg:hidden">
          <UrbanTitle />
        </div>
        <div className="lg:hidden w-full">
          <DashboardBanner />
        </div>
        <EventFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading...</p>
        )}
        {!loading && feedItems.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">
            No posts yet.
          </p>
        )}
        {feedItems.map((item) =>
          item.kind === "event" ? (
            <EventCard key={`event-${item.data.id}`} event={item.data} />
          ) : (
            <ClusterCard key={`cluster-${item.data.id}`} cluster={item.data} />
          )
        )}
      </div>
    </ThreeColumnLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}