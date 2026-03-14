"use client";

import { useEffect, useState } from "react";
import HorizontalCard from "@/components/ui/profile/HorizontalCard";
import ProfilePageTemplate from "@/components/ui/profile/ProfilePageTemplate";

export default function SecurityPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setEmail(data.email ?? ""));
  }, []);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5248/api/user/change-password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        setError("Current password is incorrect.");
        return;
      }

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfilePageTemplate title="Security Data">
      <div className="w-full flex flex-col gap-4">

        <HorizontalCard
          title="Email"
          type="email"
          placeholder={email}
        />

        <div className="w-full h-px bg-white/10 my-2" />

        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">
          Change Password
        </p>

        <HorizontalCard
          title="Current"
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <HorizontalCard
          title="New"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <HorizontalCard
          title="Confirm"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && (
          <div className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="w-full px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all bg-yellow-primary text-black disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

      </div>
    </ProfilePageTemplate>
  );
}