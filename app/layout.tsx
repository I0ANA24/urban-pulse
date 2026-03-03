import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

// Configurăm DM Sans (fontul principal)
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"], // Am adăugat greutățile pe care le foloseai în vechiul CSS
});

// Configurăm Playfair Display (fontul pentru logo/titluri)
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600"],
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
      {/* Injectăm ambele variabile de font în <body> */}
      <body
        className={`${dmSans.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}