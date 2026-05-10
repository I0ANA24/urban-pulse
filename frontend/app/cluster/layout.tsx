import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";

export default function ClusterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <TopBar back={true} notifications={true} settings={false} />
      {children}
    </Container>
  );
}
