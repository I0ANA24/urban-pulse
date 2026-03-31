import NavBar from "@/components/layout/NavBar";

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NavBar />
    </>
  );
}