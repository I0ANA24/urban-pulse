"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
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
        body: JSON.stringify({ email, password, role: "User", fullName: activeTab === "signup" ? fullName : undefined }),
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
    <div className="min-h-screen w-full flex justify-center items-center bg-background text-foreground font-inter relative">
      <Image
        src="desktop-bg-login.png"
        width={1500}
        height={700}
        alt="background-image"
        className="absolute w-full h-full object-cover hidden md:block"
      />

      <div className="w-full max-w-100 md:max-w-110 xl:max-w-120 px-5 md:px-8 py-6 md:py-8 pb-8 animate-fade-up relative z-10">

        {/* Logo */}
        <div className="text-center mb-6 md:mb-8 lg:mb-8">
          <span className="font-montagu text-4xl md:text-[40px] xl:text-[44px] font-medium text-foreground tracking-[-0.5px]">
            UrbanPulse
          </span>
          <span className="inline-block w-3 h-3 md:w-4 md:h-4 bg-green-light rounded-full ml-0.75 md:ml-1.5 align-middle mb-1.5 md:mb-2.5 lg:mb-3" />
        </div>

        {/* Tabs */}
        <div className="flex rounded-[14px] mb-7 gap-1 bg-[#161616]">
          <button
            className={`flex-1 p-3 2xl:p-3.5 border-none rounded-[10px] text-[14px] lg:text-[16px] font-semibold cursor-pointer transition-all duration-200 font-inter ${
              activeTab === "login"
                ? "bg-green-light text-background"
                : "bg-transparent text-foreground/35 hover:text-foreground/50"
            }`}
            onClick={() => setActiveTab("login")}
            type="button"
          >
            Log In
          </button>
          <button
            className={`flex-1 p-3 2xl:p-3.5 border-none rounded-[10px] text-[14px] lg:text-[16px] font-semibold cursor-pointer transition-all duration-200 font-inter ${
              activeTab === "signup"
                ? "bg-green-light text-background"
                : "bg-transparent text-foreground/35 hover:text-foreground/50"
            }`}
            onClick={() => setActiveTab("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "signup" && (
            <div className="mb-3 md:mb-4 lg:mb-5">
              <label className="block text-[12px] 2xl:text-[14px] font-medium text-foreground/35 uppercase tracking-[0.8px] mb-1">
                Full Name
              </label>
              <input
                className="w-full py-3.25 md:py-3.5 px-4 bg-[#161616] rounded-xl text-foreground text-[15px] xl:text-[16px] 2xl:text-[17px] outline-none transition-colors duration-200 placeholder:text-foreground/20 focus:border-green-light"
                type="text"
                placeholder="FullStack Fusion"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="mb-3 md:mb-4 lg:mb-5">
            <label className="block text-[12px] 2xl:text-[14px] font-medium text-foreground/35 uppercase tracking-[0.8px] mb-1">
              Email
            </label>
            <input
              className="w-full py-3.25 md:py-3.5 px-4 bg-[#161616] rounded-xl text-foreground text-[15px] xl:text-[16px] 2xl:text-[17px] outline-none transition-colors duration-200 placeholder:text-foreground/20 focus:border-green-light"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 md:mb-4 lg:mb-5">
            <label className="block text-[12px] 2xl:text-[14px] font-medium text-foreground/35 uppercase tracking-[0.8px] mb-1">
              Password
            </label>
            <input
              className="w-full py-3.25 md:py-3.5 px-4 bg-[#161616] rounded-xl text-foreground text-[15px] xl:text-[16px] 2xl:text-[17px] outline-none transition-colors duration-200 placeholder:text-foreground/20 focus:border-green-light"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {activeTab === "login" && (
            <div className="text-right mt-1.5 mb-5 md:mb-6">
              <Link
                href="/forgot-password"
                className="text-[12px] md:text-[13px] lg:text-[14px] text-foreground/30 no-underline transition-colors duration-200 hover:text-foreground/60"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {activeTab === "signup" && <div className="mb-5 md:mb-6" />}

          {error && (
            <div className="text-[13px] md:text-[14px] text-[#ff6b6b] text-center mb-3.5 py-2.5 px-3.5 bg-[#ff6b6b]/10 rounded-[10px] border border-[#ff6b6b]/15">
              {error}
            </div>
          )}

          <button
            className="w-full p-3.5 bg-green-light text-background border-none rounded-xl text-[15px] md:text-[16px] xl:text-[17px] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : activeTab === "login" ? "Continue" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-[12px] md:text-[13px] text-foreground/20 font-medium">or</span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        <button
          className="w-full py-3.25 md:py-3.5 lg:py-4 bg-[#161616] rounded-xl text-foreground/65 text-[14px] md:text-[15px] lg:text-[16px] font-medium cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-[#1e1e1e] hover:border-[#333] hover:text-foreground"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="md:w-5 md:h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center mt-5 md:mt-6 text-[11.5px] md:text-[13px] lg:text-[14px] text-foreground/20 leading-[1.6]">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-foreground/30 underline decoration-foreground/10 underline-offset-2 transition-colors duration-200 hover:text-foreground/55">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-foreground/30 underline decoration-foreground/10 underline-offset-2 transition-colors duration-200 hover:text-foreground/55">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}