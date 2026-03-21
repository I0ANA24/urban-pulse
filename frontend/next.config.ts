import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5248",
        pathname: "/uploads/**",
      },
      { protocol: "https", hostname: "openweathermap.org", pathname: "/img/wn/**" },
    ],
    unoptimized: true,
  },
};


export default nextConfig;
