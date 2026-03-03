"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = activeTab === "login" ? "login" : "register";
      const res = await fetch(`http://localhost:5248/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "User" }),
      });

      if (!res.ok) {
        setError(activeTab === "login" ? "Invalid email or password." : "Email already in use.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] font-sans">
      {/* Am eliminat animația custom din CSS, dar dacă vrei acel "fadeUp", o putem adăuga în tailwind.config.ts ulterior */}
      <div className="w-full max-w-[400px] px-9 pb-8">
        
        {/* Logo */}
        <div className="text-center mb-6">
          {/* Poți seta fontul Playfair Display din layout.tsx în Next.js */}
          <span className="font-serif text-[32px] font-medium text-white tracking-[-0.5px]">
            UrbanPulse
          </span>
          <span className="inline-block w-[7px] h-[7px] bg-[#4ade80] rounded-full ml-[3px] align-middle mb-[6px]" />
        </div>

        {/* Tabs */}
        <div className="flex rounded-[14px] p-1 mb-7 gap-1 bg-[#161616]">
          <button
            className={`flex-1 p-[10px] border-none rounded-[10px] text-[14px] font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === "login"
                ? "bg-[#4ade80] text-[#0a0a0a]"
                : "bg-transparent text-white/35 hover:text-white/50"
            }`}
            onClick={() => setActiveTab("login")}
            type="button"
          >
            Log In
          </button>
          <button
            className={`flex-1 p-[10px] border-none rounded-[10px] text-[14px] font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === "signup"
                ? "bg-[#4ade80] text-[#0a0a0a]"
                : "bg-transparent text-white/35 hover:text-white/50"
            }`}
            onClick={() => setActiveTab("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === "signup" && (
            <div className="mb-3">
              <label className="block text-[12px] font-medium text-white/35 uppercase tracking-[0.8px] mb-[7px]">
                Full Name
              </label>
              <input
                className="w-full py-[13px] px-4 bg-[#161616] border border-[#222] rounded-[12px] text-white text-[15px] outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#4ade80]"
                type="text"
                placeholder="FullStack Fusion"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="block text-[12px] font-medium text-white/35 uppercase tracking-[0.8px] mb-[7px]">
              Email
            </label>
            <input
              className="w-full py-[13px] px-4 bg-[#161616] border border-[#222] rounded-[12px] text-white text-[15px] outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#4ade80]"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-[12px] font-medium text-white/35 uppercase tracking-[0.8px] mb-[7px]">
              Password
            </label>
            <input
              className="w-full py-[13px] px-4 bg-[#161616] border border-[#222] rounded-[12px] text-white text-[15px] outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#4ade80]"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {activeTab === "login" && (
            <div className="text-right mt-1.5 mb-5">
              <Link
                href="/forgot-password"
                className="text-[12px] text-white/30 no-underline transition-colors duration-200 hover:text-white/60"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {activeTab === "signup" && <div className="mb-5" />}

          {error && (
            <div className="text-[13px] text-[#ff6b6b] text-center mb-[14px] py-[10px] px-[14px] bg-[#ff6b6b]/10 rounded-[10px] border border-[#ff6b6b]/15">
              {error}
            </div>
          )}

          <button
            className="w-full p-[14px] bg-[#4ade80] text-[#0a0a0a] border-none rounded-[12px] text-[15px] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : activeTab === "login" ? "Continue" : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-[1px] bg-[#222]" />
          <span className="text-[12px] text-white/20 font-medium">or</span>
          <div className="flex-1 h-[1px] bg-[#222]" />
        </div>

        {/* Google */}
        <button
          className="w-full py-[13px] bg-[#161616] border border-[#222] rounded-[12px] text-white/65 text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-[#1e1e1e] hover:border-[#333] hover:text-white"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Terms */}
        <p className="text-center mt-5 text-[11.5px] text-white/20 leading-[1.6]">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-white/30 underline decoration-white/10 underline-offset-2 transition-colors duration-200 hover:text-white/55">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white/30 underline decoration-white/10 underline-offset-2 transition-colors duration-200 hover:text-white/55">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}