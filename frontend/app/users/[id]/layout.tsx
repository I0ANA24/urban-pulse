"use client";

import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <TopBar back={true} notifications={false} settings={false} />
      {children}
    </Container>
  );
}
