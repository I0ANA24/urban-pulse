"use client";
import { useState } from "react";

export default function ThemeSelector() {
  const [theme, setTheme] = useState("dark");

  return (
    <div className="w-full h-13 flex items-center bg-secondary rounded-2xl">
      <button className="flex-1 h-full flex justify-center items-center rounded-2xl">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21V3Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`flex-2 h-full flex justify-center items-center rounded-2xl font-bold transition-colors duration-200 cursor-pointer ${
          theme === "dark" ? "bg-green-light text-background" : "text-white"
        }`}
      >
        Dark
      </button>

      {/* light button */}
      <button
        onClick={() => setTheme("light")}
        className={`flex-2 h-full flex justify-center items-center rounded-2xl font-bold transition-colors duration-200 cursor-pointer ${
          theme === "light" ? "bg-green-light text-background" : "text-white"
        }`}
      >
        Light
      </button>
    </div>
  );
}
