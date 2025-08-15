import type { Metadata, Viewport } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import ClientProviders from "@/components/ClientProviders";

// Lazy loading pour optimiser le bundle initial  
const ConditionalHeader = dynamic(() => import("@/components/layout/ConditionalHeader").then(mod => ({ default: mod.ConditionalHeader })), {
  ssr: true,
  loading: () => <div className="h-16 bg-orange-600" />
});

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
  maximumScale: 5, // WCAG compliance - minimum 5x zoom
  userScalable: true, // Accessibilité requise pour zoom
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
        {/* Preload logo supprimé - causait warning "not used within a few seconds" */}
        {/* TEMPORAIRE: Désactivé pour résoudre conflits SW, DNS prefetch Google Fonts supprimé */}
        <link rel="dns-prefetch" href="//vercel.app" />
        {/* Meta pour performance */}
        <meta name="format-detection" content="telephone=no" />
        {/* PRELOAD - Font supprimé (fichier inexistant causait 404) */}
        {/* Preload logo supprimé - inexistant, causait warnings */}
        {/* Extension Error Shield - Optimisé en composant séparé */}
        
        {/* ULTRAHARDCORE: Script d'interception supprimé - causait erreurs Object.defineProperty */}

        {/* Theme init - Garde dans head pour performance */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{const s=localStorage.getItem('theme'),d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.remove('dark','light');s==='dark'||(!s&&d)?document.documentElement.classList.add('dark'):document.documentElement.classList.add('light')}catch{document.documentElement.classList[window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'add':'remove']('dark')}})();`
        }} />
      </head>
      <body className="antialiased min-h-screen bg-surface-lightAlt text-gray-900 dark:bg-surface-dark dark:text-gray-100 overflow-x-hidden" suppressHydrationWarning>
        <ClientProviders>
          <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
            <ConditionalHeader />
            <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}