"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ClipboardCheck, TriangleAlert } from "lucide-react";
import EventTag from "@/components/ui/EventTag";
import UserReportCard from "@/components/admin/UserReportCard";
import PortalModal from "@/components/ui/PortalModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { EventType } from "@/types/Event";
import { Trash2 } from "lucide-react";
import ResolveTaskModal from "@/components/ui/ResolveTaskModal";
import NumberOfReports from "@/components/admin/NumberOfReports";
import CheckButton from "@/components/admin/CheckButton";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";

interface Report {
  id: string;
  reporterName: string;
  reporterAvatar: string;
  date: string;
  time: string;
  title: string;
  description: string;
}

const mockPostData = {
  postedBy: "Carolina Gorge",
  avatar: "/profile.png",
  description:
    "A huge flood happened this morning...Let's do something now because we are blocked here",
  tag: "Emergency" as EventType,
  postedOn: "02/03/2026, 08:33",
  reports: [
    {
      id: "1",
      reporterName: "Ilia Malinin",
      reporterAvatar: "/profile.png",
      date: "05.03.2026",
      time: "7:20",
      title: "anskdfcbkvank",
      description: "Sorry, i don't know how to exit this window",
    },
  ] as Report[],
};

export default function FlaggedContentDetailPage() {
  const router = useRouter();
  const [resolved, setResolved] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDismiss = () => {
    setShowResolveModal(false);
    setResolved(true);
    setTimeout(() => router.back(), 500);
  };

  const handleOpenDeleteConfirm = () => {
    setShowResolveModal(false);
    setShowDeleteConfirm(true);
  };

  const handleDeletePost = () => {
    setShowDeleteConfirm(false);
    setResolved(true);
    // TODO: API call to delete post
    console.log("Post deleted");
    setTimeout(() => router.back(), 500);
  };

  return (
    <ThreeColumnLayoutAdmin>
      <div className="w-full flex flex-col gap-6 animate-fade-up pb-20">
        {/* Header — undo + Check button */}
        <div className="flex items-center justify-between relative">
          <button
            onClick={() => router.back()}
            className="cursor-pointer hover:scale-105 active:scale-95 z-10 lg:hidden"
          >
            <Image
              src="/undo.svg"
              alt="go_back"
              width={69}
              height={49}
              className="-ml-2"
            />
          </button>
          <div className="hidden lg:block" />

          <CheckButton onClick={() => setShowResolveModal(true)} />
        </div>

        {/* ── Post detail card ── */}
        <div className="bg-secondary rounded-[20] p-5 flex flex-col gap-4">
          {/* Posted by */}
          <div className="flex items-center gap-6">
            <span className="text-white font-bold text-base">Posted by:</span>
            <div className="w-10 h-10 -mr-4 rounded-full overflow-hidden shrink-0">
              <Image
                src={mockPostData.avatar}
                alt={mockPostData.postedBy}
                width={35}
                height={35}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-white font-semibold text-base">
              {mockPostData.postedBy}
            </span>
          </div>

          {/* Separator */}
          <div className="h-px bg-white" />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-white font-bold text-base">Description:</h3>
            <p className="text-white text-sm leading-relaxed">
              {mockPostData.description}
            </p>
          </div>

          {/* Separator */}
          <div className="h-px bg-white" />

          {/* Tag */}
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-base">Tag:</span>
            <EventTag type={mockPostData.tag} />
          </div>

          {/* Posted on */}
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base">Posted on:</span>
            <span className="text-yellow-primary text-base">
              {mockPostData.postedOn}
            </span>
          </div>
        </div>

        {/* ── Number of reports ── */}
        <NumberOfReports />

        {/* ── Reports list ── */}
        <div className="flex flex-col gap-4">
          {mockPostData.reports.map((report) => (
            <UserReportCard
              key={report.id}
              reporterName={report.reporterName}
              reporterAvatar={report.reporterAvatar}
              date={report.date}
              time={report.time}
              title={report.title}
              description={report.description}
            />
          ))}
        </div>
      </div>

      {/* ── Resolve Task Modal ── */}
      <ResolveTaskModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        handleDismiss={handleDismiss}
        handleOpenDeleteConfirm={handleOpenDeleteConfirm}
        greenButtonText="Decline"
        redButtonText="Delete post"
      />

      {/* ── Delete Post Confirmation Modal ── */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePost}
        icon={<Trash2 />}
        title="Delete post"
        boldText="delete this post"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reason"
            className="text-white font-bold"
          >
            Reason
          </label>

          <input
            type="text"
            id="reason"
            placeholder="e.g.: Wrong tag"
            className="w-full bg-input border border-red-emergency rounded-[10] px-3 py-2 text-white text-sm outline-none"
          />
        </div>
      </ConfirmModal>
    </ThreeColumnLayoutAdmin>
  );
}
