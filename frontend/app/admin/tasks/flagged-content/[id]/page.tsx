"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import UserReportCard from "@/components/admin/UserReportCard";
import CheckButton from "@/components/admin/CheckButton";
import ResolveTaskModal from "@/components/ui/ResolveTaskModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EventTag from "@/components/ui/EventTag";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { EventType } from "@/types/Event";

const API = process.env.NEXT_PUBLIC_API_URL;

interface ContentReport {
  id: number;
  reporterName: string;
  reporterAvatarUrl: string | null;
  details: string;
  createdAt: string;
}

interface FlaggedContentDetail {
  id: number;
  description: string;
  type: number;
  tags: string;
  imageUrl: string | null;
  createdAt: string;
  createdByFullName: string | null;
  createdByAvatarUrl: string | null;
  flagCount: number;
  reports: ContentReport[];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
}

const typeMap: Record<number, EventType> = {
  0: "General",
  1: "Emergency",
  2: "Skill",
  3: "Lend",
};

export default function FlaggedContentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<FlaggedContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/flagged-content/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDismiss = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/admin/flagged-content/${id}/dismiss`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowResolveModal(false);
    setResolved(true);
    setTimeout(() => router.back(), 500);
  };

  const handleDeletePost = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/admin/flagged-content/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowDeleteConfirm(false);
    setResolved(true);
    setTimeout(() => router.back(), 500);
  };

  const handleOpenDeleteConfirm = () => {
    setShowResolveModal(false);
    setShowDeleteConfirm(true);
  };

  if (loading) return <ThreeColumnLayoutAdmin><p className="text-white/40 text-center mt-20">Loading...</p></ThreeColumnLayoutAdmin>;
  if (!data) return <ThreeColumnLayoutAdmin><p className="text-white/40 text-center mt-20">Not found.</p></ThreeColumnLayoutAdmin>;

  const eventType = typeMap[data.type] ?? "General";
  const postedOn = new Date(data.createdAt).toLocaleString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const authorName = data.createdByFullName ?? "Unknown";

  return (
    <ThreeColumnLayoutAdmin>
      <div className="w-full flex flex-col gap-6 animate-fade-up pb-20">
        {/* Header */}
        <div className="flex items-center justify-between relative">
          <button
            onClick={() => router.back()}
            className="cursor-pointer hover:scale-105 active:scale-95 z-10 lg:hidden"
          >
            <Image src="/undo.svg" alt="go_back" width={69} height={49} className="-ml-2" />
          </button>
          <div className="hidden lg:block" />
          {!resolved && <CheckButton onClick={() => setShowResolveModal(true)} />}
          {resolved && <span className="text-green-light font-bold text-sm">✓ Resolved</span>}
        </div>

        {/* Post detail card */}
        <div className="bg-secondary rounded-[20] p-5 flex flex-col gap-4">
          {/* Posted by */}
          <div className="flex items-center gap-4">
            <span className="text-white font-bold text-base">Posted by:</span>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-third flex items-center justify-center shrink-0">
              {data.createdByAvatarUrl ? (
                <Image src={data.createdByAvatarUrl} alt={authorName} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <span className="text-white font-bold text-xs">{getInitials(authorName)}</span>
              )}
            </div>
            <span className="text-white font-semibold text-base">{authorName}</span>
          </div>

          <div className="h-px bg-white" />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-white font-bold text-base">Description:</h3>
            <p className="text-white text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: data.description }} />
          </div>

          <div className="h-px bg-white" />

          {/* Tag */}
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-base">Tag:</span>
            <EventTag type={eventType} />
          </div>

          {/* Posted on */}
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base">Posted on:</span>
            <span className="text-yellow-primary text-base">{postedOn}</span>
          </div>
        </div>

        {/* Reports count */}
        <div className="flex items-center gap-2 px-2 mt-4">
          <span className="text-red-emergency text-xl">⚠ Number of reports: {data.flagCount}</span>
        </div>

        {/* Reports list */}
        <div className="flex flex-col gap-4">
          {data.reports.map((report) => {
            const { date, time } = formatDate(report.createdAt);
            return (
              <UserReportCard
                key={report.id}
                reporterName={report.reporterName}
                reporterAvatar={report.reporterAvatarUrl ?? "/profile.png"}
                date={date}
                time={time}
                description={report.details}
              />
            );
          })}
        </div>
      </div>

      <ResolveTaskModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        handleDismiss={handleDismiss}
        handleOpenDeleteConfirm={handleOpenDeleteConfirm}
        greenButtonText="Decline"
        redButtonText="Delete post"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePost}
        icon={<Trash2 />}
        title="Delete post"
        boldText="delete this post"
      />
    </ThreeColumnLayoutAdmin>
  );
}