import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { SiteHeader } from "@/shared/components/layout/SiteHeader";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const sora = Sora({ subsets: ["latin"], display: "swap", variable: "--font-sora" });

export const metadata: Metadata = {
  title: "MathQuest Arena",
  description: "Play polished educational math mini-games, build streaks, and climb the leaderboard."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${sora.variable} min-h-screen antialiased`}>
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
