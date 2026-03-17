import type { Metadata } from "next";
import { Montagu_Slab, Inter } from "next/font/google";
import { SignalRProvider } from "@/context/SignalRContext";
import "./globals.css";

const montagu = Montagu_Slab({
  subsets: ["latin"],
  variable: "--font-montagu",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-next",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UrbanPulse",
  description:
    "UrbanPulse connects neighbors, encourages the circular economy by sharing resources, and facilitates rapid help in your community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montagu.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="font-inter antialiased">
        <SignalRProvider>{children}</SignalRProvider>
      </body>
    </html>
  );
}
