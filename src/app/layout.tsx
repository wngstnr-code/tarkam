import "@/polyfill";
import type { Metadata } from "next";
import { Anton, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TestnetBanner } from "@/components/common/TestnetBanner";
import { Navbar } from "@/components/common/Navbar";
import { I18nProvider } from "@/lib/i18n/context";

// Tipografi Stitch: Plus Jakarta Sans (body/label) + JetBrains Mono (angka/alamat) + Anton (papan skor)
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarkam — Tournament Prize Vault",
  description:
    "Tournament prizes that can't run off. On-chain prize escrow for grassroots football, built with Tether WDK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${jetbrainsMono.variable} ${anton.variable} antialiased`}
      >
        <I18nProvider>
          <TestnetBanner />
          <Navbar />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
