import type { Metadata } from "next";
import { Montaga, Montagu_Slab } from "next/font/google";
import "./globals.css";

const montaga = Montaga({
  weight: "400",
  variable: "--font-montaga",
  subsets: ["latin"],
});

const montaguSlab = Montagu_Slab({
  variable: "--font-montagu-slab",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${montaga.variable} ${montaguSlab.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
