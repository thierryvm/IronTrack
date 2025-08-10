import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import RegisterSW from "@/components/register-sw";

// ULTRAHARDCORE: Police système uniquement
// const inter = Inter({ subsets: ["latin"], variable: "--font-inter", });

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
  userScalable: false, // Empêche zoom mobile
  viewportFit: "cover", // Support iPhone safe areas
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
        {/* ULTRAHARDCORE: CSS critique désactivé, CriticalCSS composant supprimé */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {/* Préconnexions pour optimiser la latence réseau */}
        <link rel="preconnect" href="https://taspdceblvmpvdjixyit.supabase.co" />
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        {/* TEMPORAIRE: Désactivé pour résoudre conflits SW, DNS prefetch Google Fonts supprimé */}
        <link rel="dns-prefetch" href="//vercel.app" />
        {/* Meta pour performance */}
        <meta name="format-detection" content="telephone=no" />
        {/* PRELOAD - Font supprimé (fichier inexistant causait 404) */}
        {/* Preload logo principal pour éviter warning */}
        <link rel="preload" href="/logo.png" as="image" />
        {/* Init dark theme early to avoid flash of light theme */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                const saved = localStorage.getItem('theme');
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                // Nettoyer toutes les classes de thème
                document.documentElement.classList.remove('dark', 'light');
                
                if (saved === 'dark' || (!saved && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              } catch (e) {
                // Fallback selon préférence système  
                document.documentElement.classList.remove('dark', 'light');
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              }
            })();`
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-surface-lightAlt text-gray-900 dark:bg-surface-dark dark:text-gray-100 overflow-x-hidden">
        <RegisterSW />
        <ThemeProvider>
          <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
            <ConditionalHeader />
            <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}