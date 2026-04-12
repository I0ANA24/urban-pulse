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
        const data = await res.json();
        if (data.message === "banned") {
          setError("Your account has been banned. Please contact support.");
        } else {
          setError(activeTab === "login" ? "Invalid email or password." : "Email already in use.");
        }
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

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

        <p className="text-center mt-8 md:mt-10 text-[13px] md:text-[14px] lg:text-[15px] text-foreground/30 leading-[1.8]">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-white/60 underline decoration-white/20 underline-offset-2 transition-colors duration-200 hover:text-white">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white/60 underline decoration-white/20 underline-offset-2 transition-colors duration-200 hover:text-white">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}