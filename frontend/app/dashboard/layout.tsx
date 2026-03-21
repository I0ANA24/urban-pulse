import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <TopBar
        back={false}
        notifications={true}
        settings={false}
        addPost={true}
      />
      {children}
    </Container>
  );
}
