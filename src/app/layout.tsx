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
import SkipLink from "@/components/accessibility/SkipLink";

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
        {/* Préconnexions pour optimiser la latence réseau */}
        <link rel="preconnect" href="https://taspdceblvmpvdjixyit.supabase.co" />
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//vercel.app" />
        {/* Préchargement CSS critique */}
        <link rel="preload" href="/globals.css" as="style" />
      </head>
      <body className={`${inter.variable} antialiased h-full bg-gray-50 dark:bg-gray-900`} suppressHydrationWarning>
        <ThemeProvider>
          <SkipLink />
          <ErrorHandler />
          <div className="min-h-screen flex flex-col">
            <Header />
            <ClientIronBuddyWrapper />
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
          </div>
          <RegisterSW />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
      </body>
    </html>
  );
}
