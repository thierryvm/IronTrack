import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import RegisterSW from '../components/register-sw';
import { MascotGlobal } from "@/components/ui/Mascot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IronTrack - Ton coach muscu personnel",
  description: "Application de suivi de musculation avec minuterie, nutrition et progression",
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a855f7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} antialiased h-full bg-gray-50 dark:bg-gray-900`} suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <ClientMascotWrapper />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}
