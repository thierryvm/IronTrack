import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import RegisterSW from '../components/register-sw';
import { MascotGlobal } from "@/components/ui/Mascot";
import { FloatingSupport } from "@/components/ui/FloatingSupport";
import { ErrorHandler } from "@/components/ui/ErrorHandler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IronTrack - Ton coach muscu personnel",
  description: "Application de suivi de musculation avec minuterie, nutrition et progression. Suivi tes entraînements, ta nutrition et ta progression comme un(e) champion(ne) !",
  keywords: ["musculation", "fitness", "nutrition", "entraînement", "progression", "minuterie"],
  authors: [{ name: "IronTrack Team" }],
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

// Wrapper client pour la mascotte
function ClientMascotWrapper() {
  'use client';
  return <MascotGlobal />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} antialiased h-full bg-gray-50 dark:bg-gray-900`} suppressHydrationWarning>
        <ThemeProvider>
          <ErrorHandler />
          <div className="min-h-screen flex flex-col">
            <Header />
            <ClientMascotWrapper />
            <main className="flex-1">
              {children}
            </main>
            <FloatingSupport />
          </div>
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}
