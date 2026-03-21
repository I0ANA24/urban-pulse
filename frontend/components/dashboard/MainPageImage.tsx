"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function MainPageImage() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  if (!isDashboard) {
    return null;
  }

  return (
    <Image
      src="/dashboard-image.png"
      alt="Background Image"
      priority
      width={500}
      height={300}
      className="absolute top-0 left-0 w-full h-[15vh] object-cover object-top"
    />
  );
}
