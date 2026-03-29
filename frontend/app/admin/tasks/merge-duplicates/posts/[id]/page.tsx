"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BadgeCheck, Check, ThumbsUp, MessageCircle } from "lucide-react";
import EventTag from "@/components/ui/EventTag";
import { EventType } from "@/types/Event";
import GoBackButton from "@/components/ui/GoBackButton";
import CardMedia from "@/components/events/card/CardMedia";
import CardContent from "@/components/events/card/CardContent";

// ── Types ──
interface DuplicatePost {
  id: string;
  authorName: string;
  authorAvatar: string;
  isVerified: boolean;
  date: string;
  time: string;
  description: string;
  likes: number;
  comments: number;
  tag: EventType;
  imageUrl: string;
}

const mockMatchCriteria = ["description", "user", "date"];

const mockDuplicatePosts: DuplicatePost[] = [
  {
    id: "1a",
    authorName: "Tyler Lockwood",
    authorAvatar: "/profile.png",
    isVerified: true,
    date: "15.02.2026",
    time: "7:20",
    description:
      "My TV is suddenly not working anymore and I really don\u2019t know what to do. I tried to contact those who put my TV but they are soo busy right now. Is there anyone who can help, please?",
    likes: 32,
    comments: 10,
    tag: "Skill" as EventType,
    imageUrl:
      "https://www.lg.com/content/dam/channel/wcms/global/lg-experience/tech-hub/what-is-a-smart-tv/desktop/desktop-aem-what-is-a-smartv.jpg",
  },
  {
    id: "1b",
    authorName: "Tyler Lockwood",
    authorAvatar: "/profile.png",
    isVerified: true,
    date: "15.02.2026",
    time: "7:15",
    description:
      "My TV is suddenly not working anymore and I really don\u2019t know what to do. I tried to contact those who put my TV but they are soo busy right now. Is there anyone who can help, please?",
    likes: 0,
    comments: 0,
    tag: "General" as EventType,
    imageUrl:
      "https://www.lg.com/content/dam/channel/wcms/global/lg-experience/tech-hub/what-is-a-smart-tv/desktop/desktop-aem-what-is-a-smartv.jpg",
  },
];

export default function ReviewDuplicatePostsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleKeep = () => {
    if (!selectedId) return;
    console.log("Keep post:", selectedId);
    router.back();
  };

  const handleIgnore = () => {
    console.log("Ignore merge suggestion");
    router.back();
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-up pb-32">
      {/* Header — back button */}
      <div className="flex items-center">
        <GoBackButton />
      </div>

      {/* Matches info */}
      <div className="flex flex-col gap-1">
        <h2 className="text-yellow-primary font-bold text-xl">Matches:</h2>
        <p className="text-white font-bold text-xl">
          {mockMatchCriteria.join(", ")}
        </p>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-white/60 -mt-3 mb-1" />

      {/* Instruction */}
      <div className="flex flex-col gap-2">
        <p className="text-white text-base">
          Select which post is{" "}
          <span className="text-red-emergency font-bold">permanent</span>:
        </p>
        <p className="text-white/40 text-[13px] mt-4 -mb-2">
          *The other one/ones will be deleted
        </p>
      </div>

      {/* Post cards */}
      <div className="flex flex-col gap-5">
        {mockDuplicatePosts.map((post) => {
          const isSelected = selectedId === post.id;

          return (
            <button
              key={post.id}
              onClick={() => setSelectedId(post.id)}
              className={`w-full bg-secondary rounded-[30px] p-5 flex flex-col gap-3 transition-all cursor-pointer text-left
              }`}
            >
              {/* Header: avatar, name, verified, date, checkbox */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4 justify-center items-center">
                  <div className="w-10 h-10">
                    <Image
                      src="/profile.png"
                      width={40}
                      height={40}
                      alt="profile_image"
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-start">
                    <div className="flex items-center">
                      <p className="w-full font-bold">Niklaus</p>
                      {post.isVerified && (
                        <BadgeCheck
                          size={18}
                          className="text-green-light fill-green-light/20"
                        />
                      )}
                    </div>
                    <span className="text-white/40 text-xs">{post.date}</span>
                  </div>
                </div>
                {/* Checkbox */}
                <div
                  className={`w-7 h-7 bg-white rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? "bg-yellow-primary border-yellow-primary"
                      : "bg-transparent border-white/60"
                  }`}
                >
                  {isSelected && (
                    <Check
                      size={18}
                      className="text-[#1a1a1a]"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>

              {/* Card Image */}
              {/* <CardMedia imageUrl={post.imageUrl} /> */}

              {/* Post description */}
              <CardContent
                description={post.description}
                isVerified={post.tag === "Emergency"}
              />

              {/* Divider */}
              <div className="h-px bg-white/50 mt-1" />

              {/* Footer: likes, comments, tag */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {/* Likes */}
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp size={22} className="text-green-light" />
                    <span className="text-white font-bold text-sm">
                      {post.likes}
                    </span>
                  </div>

                  {/* Comments */}
                  <div className="flex items-center gap-1.5">
                    <MessageCircle
                      size={22}
                      className="text-green-light fill-green-light"
                    />
                    <span className="text-white font-bold text-sm">
                      {post.comments}
                    </span>
                  </div>
                </div>

                {/* Event tag */}
                <EventTag type={post.tag} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom action buttons — fixed */}
      {/* Bottom action buttons — fixed */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 px-6 z-40">
        <button
          onClick={handleKeep}
          disabled={!selectedId}
          className={`w-36.5 h-11.5 rounded-full font-bold text-[20px] text-black transition-all cursor-pointer ${
            selectedId
              ? "bg-green-light hover:bg-green-light/80 active:scale-95"
              : "bg-green-light/40 text-black/50 cursor-not-allowed"
          }`}
        >
          Keep
        </button>
        <button
          onClick={handleIgnore}
          className="w-36.5 h-11.5 rounded-full font-bold text-[20px] bg-red-emergency hover:bg-emergency/80 active:scale-95 transition-all text-base cursor-pointer"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
