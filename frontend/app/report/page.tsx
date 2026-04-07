"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flag } from "lucide-react";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import Image from "next/image";
import GoBackButton from "@/components/ui/GoBackButton";

function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5248/api/event/${eventId}/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, description }),
      });
      router.back();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-up pb-10">
      {/* Header */}
      <div className="flex w-full items-center relative lg:hidden">
        <GoBackButton />
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-xl font-montagu">Report</h1>
        </div>
      </div>
      {/* Illustration */}
      <div className="flex items-center justify-center w-58 h-56">
        <Image
          src="report-image.png"
          width="232"
          height="224"
          alt="Report Image"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Question */}
      <p className="text-white font-medium text-xl text-center px-4 pt-4">
        What is wrong with this content?
      </p>

      {/* Inputs */}
      <div className="w-full flex flex-col gap-3 px-1">
        <input
          type="text"
          placeholder="Reason:"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-13 rounded-full overflow-hidden bg-input border border-red-emergency px-5 text-white placeholder-white/50 outline-none"
        />
        <textarea
          placeholder="Describe..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-3xl bg-secondary px-5 py-4 text-white placeholder-white/40 outline-none resize-none"
        />
      </div>

      {/* Button */}
      <button
        onClick={handleReport}
        disabled={!reason.trim() || loading}
        className="w-50 h-13 rounded-2xl bg-red-emergency text-white font-bold text-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-emergency/90"
      >
        {loading ? "Reporting..." : "Report"}
      </button>
    </div>
  );
}

export default function ReportPage() {
  return (
    <ThreeColumnLayout>
      <Suspense
        fallback={
          <div className="text-white/40 text-sm text-center mt-20">
            Loading...
          </div>
        }
      >
        <ReportForm />
      </Suspense>
    </ThreeColumnLayout>
  );
}
