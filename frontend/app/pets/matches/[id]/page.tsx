"use client";

import { useEffect, useState, Suspense } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import EventCard from "@/components/events/EventCard";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { Event } from "@/types/Event";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL as API } from "@/lib/api";

interface Match {
  score: number;
  event: Event;
}

function PetMatchesContent({ postId }: { postId: number }) {
  const searchParams = useSearchParams();
  const imgSrc = searchParams.get("img") ?? null;
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const h = { Authorization: `Bearer ${token}` };

        const matchesRes = await fetch(`${API}/api/event/${postId}/matches`, { headers: h });

        if (matchesRes.ok) {
          const data = await matchesRes.json();
          setMatches(data.map((m: any) => ({
            score: m.score,
            event: m.event,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  return (
    <div className="flex flex-col gap-4 py-2">
      {imgSrc ? (
        <div className="relative w-full h-52 rounded-3xl overflow-hidden">
          <Image src={imgSrc} alt="Your lost pet" fill className="object-cover" />
        </div>
      ) : (
        <div className="w-full h-52 rounded-3xl bg-secondary flex items-center justify-center">
          <span className="text-white/20 text-sm">No image</span>
        </div>
      )}

      <div className="flex items-center gap-2 px-1">
        <Sparkles size={18} className="text-white" />
        <p className="text-white font-bold text-lg">
          {loading
            ? "Searching for matches..."
            : `You have ${matches.length} ${matches.length === 1 ? "match" : "matches"}!`}
        </p>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm text-center mt-10">AI is analyzing...</p>
      ) : matches.length === 0 ? (
        <p className="text-white/40 text-sm text-center mt-10">No matches found yet.</p>
      ) : (
        <div className="flex flex-col">
          {matches.map(({ score, event }) => (
            <div key={event.id}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Sparkles size={14} className="text-white/60" />
                <p className="text-white/60 text-sm font-bold">
                  Match score: <span className="text-white">{score}%</span>
                </p>
              </div>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PetMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postId = Number(id);

  return (
    <ThreeColumnLayout>
      <Suspense fallback={<p className="text-white/40 text-sm text-center mt-10">Loading...</p>}>
        <PetMatchesContent postId={postId} />
      </Suspense>
    </ThreeColumnLayout>
  );
}