"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://localhost:7036/api/auth/register", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "User" })
      });

      if (!res.ok) {
        setError("Email-ul este deja folosit");
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
      className="w-100 max-w-[80%] h-full flex flex-col justify-center items-center gap-5 z-10"
    >
      <Input type="text" placeholder="Full Name" />
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex flex-col w-full justify-center items-baseline gap-2 mt-5">
        <label htmlFor="resident-code" className="text-white text-center pl-5">
          Please enter your resident code:
        </label>
        <Input type="text" placeholder="XX-XXX-X" className="tracking-wide" />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button text="Sign Up" type="submit" />

      <p className="text-white text-center text-sm mb-8">
        You already have an account?{" "}
        <Link href="/login" className="underline decoration-white/50 underline-offset-4">
          Log In
        </Link>
      </p>
    </form>
  );
}