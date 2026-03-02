"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://localhost:7036/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        setError("Email sau parola incorecta");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/dashboard");

    } catch (err) {
      setError("Eroare conexiune");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-100 max-w-[80%] h-full flex flex-col justify-center items-center gap-5"
    >
      <Input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button text="Log In" type="submit" />

      <p className="text-white text-center text-sm mb-8">
        You don't have an account yet?{" "}
        <Link href="/signup" className="underline decoration-white/50 underline-offset-4">
          Sign Up
        </Link>
      </p>
    </form>
  );
}