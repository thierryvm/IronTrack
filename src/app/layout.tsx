import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import RegisterSW from '../components/register-sw';
import { ClientIronBuddyWrapper } from "@/components/ui/ClientIronBuddyWrapper";
import { ErrorHandler } from "@/components/ui/ErrorHandler";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

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
            <ClientIronBuddyWrapper />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <RegisterSW />
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
