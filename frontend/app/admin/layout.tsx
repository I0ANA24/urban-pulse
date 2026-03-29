import Container from "@/components/layout/Container";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Container>{children}</Container>;
}