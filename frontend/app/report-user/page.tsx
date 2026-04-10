"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import GoBackButton from "@/components/ui/GoBackButton";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

const API = "http://localhost:5248";

function ReportUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleReport = async () => {
    if (!details.trim() || !userId) return;
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/user-report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportedUserId: parseInt(userId),
        details,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
    setTimeout(() => router.back(), 1500);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-up pb-10">
      {/* Mobile header */}
      <div className="flex w-full items-center relative lg:hidden">
        <GoBackButton />
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-xl font-montagu">Report User</h1>
        </div>
      </div>

      {/* Illustration */}
      <div className="flex items-center justify-center w-58 h-56">
        <Image
          src="/report-image.png"
          width={232}
          height={224}
          alt="Report Image"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Question */}
      <p className="text-white font-medium text-xl text-center px-4 pt-4">
        Why are you reporting this user?
      </p>

      {submitted ? (
        <div className="flex flex-col items-center gap-4 text-center mt-4">
          <span className="text-4xl">✅</span>
          <p className="text-white font-semibold">Report submitted!</p>
          <p className="text-white/40 text-sm">
            Thank you for keeping the community safe.
          </p>
        </div>
      ) : (
        <>
          {/* Textarea */}
          <div className="w-full max-w-130 flex flex-col gap-2 px-1">
            <textarea
              placeholder="Describe the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              maxLength={500}
              className="w-full rounded-3xl bg-secondary px-5 py-4 lg:px-6 lg:py-5 text-white placeholder-white/40 outline-none resize-none"
            />
            <span className="text-white/20 text-xs text-right">
              {details.length}/500
            </span>
          </div>

          {error && (
            <div className="w-full py-3 px-4 bg-red-emergency/10 border border-red-emergency/30 rounded-2xl">
              <p className="text-red-emergency text-sm text-center">{error}</p>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleReport}
            disabled={!details.trim() || loading}
            className="w-50 h-13 rounded-2xl bg-red-emergency text-white font-bold text-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-emergency/90"
          >
            {loading ? "Reporting..." : "Report"}
          </button>
        </>
      )}
    </div>
  );
}

export default function ReportUserPage() {
  return (
    <ThreeColumnLayout>
      <Suspense
        fallback={
          <div className="text-white/40 text-sm text-center mt-20">
            Loading...
          </div>
        }
      >
        <ReportUserForm />
      </Suspense>
    </ThreeColumnLayout>
  );
}