"use client";

import { useState } from "react";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import EventCard from "@/components/events/EventCard";
import GoBackButton from "@/components/ui/GoBackButton";
import { Event, EventType } from "@/types/Event";
import { Search } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const typeMap: Record<number, EventType> = {
  0: "General", 1: "Emergency", 2: "Skill",
  3: "Lend", 4: "LostPet", 5: "FoundPet", 6: "FoundDocument",
};

type SearchType = "NAME" | "CNP" | "DOC_NUMBER" | null;

const SEARCH_OPTIONS: { key: SearchType; label: string; placeholder: string; hint: string }[] = [
  { key: "NAME", label: "NAME", placeholder: "First 3 letters of last name...", hint: "Enter at least 3 letters" },
  { key: "CNP", label: "CNP", placeholder: "Last 6 digits of CNP...", hint: "Enter last 6 digits" },
  { key: "DOC_NUMBER", label: "DOC NUMBER", placeholder: "Document number (ex: AB123456)...", hint: "Enter full document number" },
];

export default function DocumentSearchPage() {
  const [selectedType, setSelectedType] = useState<SearchType>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || query.length < 3) return;

    setLoading(true);
    setSearched(true);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API}/api/event/documents/search?q=${encodeURIComponent(query.toUpperCase())}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((e: Event) => ({
          ...e,
          type: typeof e.type === "number" ? typeMap[e.type] : e.type,
        }));
        setResults(mapped);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: SearchType) => {
    setSelectedType(type);
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  const currentOption = SEARCH_OPTIONS.find((o) => o.key === selectedType);

  return (
    <ThreeColumnLayout>
      <div className="w-full pb-[8vh] lg:pb-0 flex flex-col mt-4">

        <div className="flex items-center gap-3 mb-6">
          <GoBackButton />
          <h1 className="text-white font-black text-2xl font-montagu uppercase">
            Find your document
          </h1>
        </div>
        <div className="flex flex-col items-center mb-6">
          <span className="text-7xl mb-3">🔍</span>
          <p className="text-white/40 text-sm text-center px-4">
            Select one of the listed options for your search:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 px-2">
          {SEARCH_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => handleTypeSelect(option.key)}
              className={`py-3 rounded-2xl font-bold text-sm uppercase transition-all cursor-pointer border
                ${selectedType === option.key
                  ? "bg-blue text-white border-blue scale-105"
                  : "bg-blue/10 text-blue border-blue/30 hover:bg-blue/20"
                }`}
            >
              {option.label}
            </button>
          ))}
          <div />
        </div>

        <div className="relative mb-6">
          <div className="flex items-center bg-[#2B2B2B] rounded-2xl px-4 py-3.5 border border-white/10 gap-3">
            <Search size={18} className="text-white/30 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={currentOption?.placeholder ?? "Select a search type above..."}
              disabled={!selectedType}
              className="bg-transparent text-white placeholder-white/30 outline-none w-full text-sm"
            />
          </div>
          {currentOption && (
            <p className="text-white/30 text-xs mt-1.5 px-1">{currentOption.hint}</p>
          )}
        </div>

        {selectedType && (
          <button
            onClick={handleSearch}
            disabled={query.length < 3 || loading}
            className="w-full bg-blue text-white font-bold py-3.5 rounded-2xl mb-6 disabled:opacity-40 hover:bg-blue/85 transition-colors cursor-pointer"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="flex flex-col items-center mt-6 gap-2">
            <span className="text-4xl">😔</span>
            <p className="text-white/40 text-sm text-center">
              No documents found. Try a different search.
            </p>
          </div>
        )}

        {results.map((doc) => (
          <EventCard
            key={doc.id}
            event={{
              ...doc,
              imageUrl: doc.aiTags ? doc.imageUrl : null,
            }}
          />
        ))}
      </div>
    </ThreeColumnLayout>
  );
}