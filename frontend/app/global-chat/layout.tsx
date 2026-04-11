"use client";

import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";

export default function GlobalChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <div className="hidden lg:block">
        <TopBar back={false} notifications={true} settings={false} />
      </div>
      {children}
    </Container>
  );
}
