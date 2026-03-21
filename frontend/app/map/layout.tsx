import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <TopBar back={false} notifications={true} settings={false} />
      {children}
    </Container>
  );
}
