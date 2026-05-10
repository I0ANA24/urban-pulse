"use client";

import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";
import { useUser } from "@/context/UserContext";

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useUser();

  return (
    <Container>
      {!isAdmin && (
        <div className="hidden lg:block">
          <TopBar back={true} notifications={true} settings={false} />
        </div>
      )}

      {children}
    </Container>
  );
}
