"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Ban } from "lucide-react";
import UserReportCard from "@/components/admin/UserReportCard";
import CheckButton from "@/components/admin/CheckButton";
import ResolveTaskModal from "@/components/ui/ResolveTaskModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { API_BASE_URL as API } from "@/lib/api";

interface UserReport {
  id: number;
  reporterName: string;
  reporterAvatarUrl: string | null;
  details: string;
  createdAt: string;
}

interface FlaggedUserDetail {
  userId: number;
  userName: string;
  avatarUrl: string | null;
  trustScore: number;
  reportsCount: number;
  reports: UserReport[];
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

export default function FlaggedUserDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<FlaggedUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/flagged-users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDismiss = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/admin/flagged-users/${id}/dismiss`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowResolveModal(false);
    setResolved(true);
    setTimeout(() => router.back(), 800);
  };

  const handleBanUser = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/admin/flagged-users/${id}/ban`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowBanModal(false);
    setResolved(true);
    setTimeout(() => router.back(), 800);
  };

  const handleOpenBanModal = () => {
    setShowResolveModal(false);
    setShowBanModal(true);
  };

  if (loading) return <ThreeColumnLayoutAdmin><p className="text-white/40 text-center mt-20">Loading...</p></ThreeColumnLayoutAdmin>;
  if (!userData) return <ThreeColumnLayoutAdmin><p className="text-white/40 text-center mt-20">User not found.</p></ThreeColumnLayoutAdmin>;

  const nameParts = userData.userName.split(" ");

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

        {/* User info */}
        <section className="w-full flex justify-around items-center px-2">
          <div className="w-36 h-36 rounded-full overflow-hidden bg-secondary flex items-center justify-center shrink-0">
            {userData.avatarUrl ? (
              <Image src={userData.avatarUrl} alt={userData.userName} width={144} height={144} className="object-cover w-full h-full" />
            ) : (
              <span className="text-white text-4xl font-bold">{getInitials(userData.userName)}</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold font-montagu text-center leading-tight">
              {nameParts.length > 1 ? (
                <>{nameParts[0]}<br />{nameParts.slice(1).join(" ")}</>
              ) : (
                nameParts[0]
              )}
            </h1>

            {/* Trust score */}
            <div className="flex justify-center items-center rounded-full px-4 py-1 bg-linear-to-b from-[#FFFADC]/50 to-[#FFF197]/50 shadow-[0px_11.3915px_22.3363px_rgba(255,227,42,0.19),inset_0px_-2px_1px_rgba(255,241,151,0.4)] backdrop-blur-[2px] border border-yellow-primary">
              <p className="font-montagu font-medium text-xs text-yellow-primary leading-3">Trust<br />score</p>
              <div className="h-6 w-1 border-r border-yellow-primary mx-2"></div>
              <p className="font-montagu text-xl text-yellow-primary font-bold text-center ml-3">{Math.round(userData.trustScore)}%</p>
            </div>
          </div>
        </section>

        {/* Reports count */}
        <div className="flex items-center gap-2 px-2 mt-8">
          <span className="text-red-emergency text-xl">⚠ Number of reports: {userData.reportsCount}</span>
        </div>

        {/* Reports list */}
        <div className="flex flex-col gap-4">
          {userData.reports.map((report) => {
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
        handleOpenDeleteConfirm={handleOpenBanModal}
        greenButtonText="Dismiss"
        redButtonText="Ban user"
      />

      <ConfirmModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleBanUser}
        icon={<Ban />}
        title="Ban user"
        boldText="ban this user"
      />
    </ThreeColumnLayoutAdmin>
  );
}