import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import VercelProviders from "@/components/VercelProviders";
import ConditionalHeader from "@/components/layout/ConditionalHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://iron-track-dusky.vercel.app";
const APP_DESCRIPTION = "Application de suivi de musculation avec minuterie, nutrition et progression. Suis tes entraînements, ta nutrition et ta progression comme un(e) champion(ne) !";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "IronTrack - Ton coach muscu personnel",
    template: "%s | IronTrack",
  },
  description: APP_DESCRIPTION,
  keywords: ["musculation", "fitness", "nutrition", "entraînement", "progression", "minuterie", "coach", "sport"],
  authors: [{ name: "IronTrack Team" }],
  icons: {
    icon: [
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: APP_URL,
    title: "IronTrack - Ton coach muscu personnel",
    description: APP_DESCRIPTION,
    siteName: "IronTrack",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "IronTrack - Coach muscu personnel",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "IronTrack - Ton coach muscu personnel",
    description: APP_DESCRIPTION,
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // WCAG compliance - minimum 5x zoom
  userScalable: true, // Accessibilité requise pour zoom
  viewportFit: "cover", // Support iPhone safe areas
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#ea580c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`h-full ${inter.variable}`} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        {/* Préconnexions pour optimiser la latence réseau */}
        <link rel="preconnect" href="https://taspdceblvmpvdjixyit.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vitals.vercel-insights.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//vercel.app" />

        {/* Theme init - Garde dans head pour éviter le flash */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var s=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.remove('dark','light');(s==='dark'||(s!=='light'&&d))?document.documentElement.classList.add('dark'):document.documentElement.classList.add('light')}catch(e){}})();`
        }} />
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden" suppressHydrationWarning>
        <ClientProviders>
          <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
            <ConditionalHeader />
            <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        </ClientProviders>
        <VercelProviders />
      </body>
    </html>
  );
}
