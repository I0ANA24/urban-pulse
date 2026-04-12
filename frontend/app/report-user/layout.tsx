import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";

export default function ReportUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <TopBar back={false} notifications={false} settings={false} />
      {children}
    </Container>
  );
}
