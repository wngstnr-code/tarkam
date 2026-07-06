import "@/polyfill";
import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TestnetBanner } from "@/components/common/TestnetBanner";
import { Navbar } from "@/components/common/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarkam — Brankas Hadiah Turnamen",
  description:
    "Hadiah turnamen yang tak bisa dibawa kabur. On-chain prize escrow untuk sepak bola akar rumput, dibangun dengan Tether WDK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased`}
      >
        <TestnetBanner />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
