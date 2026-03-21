"use client";

import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";
import { usePathname } from "next/navigation";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Container>
      <TopBar
        back={pathname.startsWith("/profile")}
        notifications={true}
        settings={pathname === "/profile"}
      />
      {children}
    </Container>
  );
}
