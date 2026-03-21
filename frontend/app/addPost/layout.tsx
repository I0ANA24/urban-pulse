import Container from "@/components/layout/Container";

export default function addPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      {children}
    </Container>
  );
}
