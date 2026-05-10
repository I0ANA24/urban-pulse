"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import GoBackButton from "@/components/ui/GoBackButton";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { useUser } from "@/context/UserContext";
import { Event, EventType } from "@/types/Event";
import { Search, Eye } from "lucide-react";

const API = "https://urbanpulsebackend-gedpgwakd5euh2bp.switzerlandnorth-01.azurewebsites.net";

const typeMap: Record<number, EventType> = {
  0: "General",
  1: "Emergency",
  2: "Skill",
  3: "Lend",
  4: "LostPet",
  5: "FoundPet",
  6: "FoundDocument",
};

export default function DocumentPostsPage() {
  const { isAdmin } = useUser();
  const Layout = isAdmin ? ThreeColumnLayoutAdmin : ThreeColumnLayout;
  const [docs, setDocs] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/event/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = (Array.isArray(data) ? data : []).map((e: Event) => ({
          ...e,
          type: typeof e.type === "number" ? typeMap[e.type] : e.type,
        }));
        setDocs(mapped);
      })
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnblur = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/event/${id}/unblur`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, originalImageUrl: null } : d
        )
      );
    }
  };

  useEffect(() => {
    const hasAnalyzing = docs.some((d) => !d.aiTags);
    if (!hasAnalyzing) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/event/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((e: Event) => ({
          ...e,
          type: typeof e.type === "number" ? typeMap[e.type] : e.type,
        }));
        setDocs(mapped);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [docs]);

  return (
    <>
      <div className="flex items-center relative mb-4 lg:hidden">
        <GoBackButton />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white font-bold text-base font-montagu uppercase">
            📄 Found Documents
          </h1>
        </div>
      </div>

      <Layout>
      <div className="w-full pb-[8vh] lg:pb-0 flex flex-col mt-4">

        <h1 className="hidden lg:block text-white font-black text-2xl font-montagu uppercase mb-4">
          📄 Found Documents
        </h1>

        <button
          onClick={() => router.push("/documents/search")}
          className="w-full flex items-center justify-between bg-blue/10 border border-blue/30 rounded-2xl px-5 py-4 mb-6 hover:bg-blue/20 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Search size={20} className="text-blue" />
            <div className="text-left">
              <p className="text-blue font-bold text-sm">Lost a document?</p>
              <p className="text-white/40 text-xs">Search if someone found it</p>
            </div>
          </div>
          <span className="text-blue/60 text-xs font-bold">Search →</span>
        </button>

        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading...</p>
        )}

        {!loading && docs.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">
            No found documents reported yet.
          </p>
        )}

        {docs.map((doc) => (
          <div key={doc.id}>
            {!isAdmin && !doc.aiTags && (
              <div className="w-full bg-blue/10 border border-blue/20 rounded-2xl px-4 py-3 mb-2 flex items-center gap-3 animate-pulse">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="text-blue font-bold text-sm">Securing your document...</p>
                  <p className="text-white/40 text-xs">Blurring sensitive data before publishing</p>
                </div>
              </div>
            )}
            <EventCard
              event={{
                ...doc,
                imageUrl: isAdmin ? doc.imageUrl : (doc.aiTags ? doc.imageUrl : null),
              }}
            />
            {isAdmin && doc.originalImageUrl && (
              <button
                onClick={() => handleUnblur(doc.id)}
                className="w-full flex items-center justify-center gap-2 mb-4 -mt-2 bg-yellow-primary/10 hover:bg-yellow-primary/20 border border-yellow-primary/40 text-yellow-primary font-semibold text-sm rounded-2xl px-4 py-3 transition-colors cursor-pointer"
              >
                <Eye size={16} />
                Unblur for all users
              </button>
            )}
          </div>
        ))}
      </div>
      </Layout>
    </>
  );
}