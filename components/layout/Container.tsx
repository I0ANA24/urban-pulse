import MainPageImage from "../dashboard/MainPageImage";
import NavBar from "./NavBar";

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background w-screen flex justify-center pb-[8vh] overflow-x-hidden relative">
      <MainPageImage />
      <div className="container bg-background text-foreground font-inter flex justify-center px-6 py-6">
        <div className="w-full animate-fade-up">{children}</div>
      </div>
      <NavBar />
    </div>
  );
}