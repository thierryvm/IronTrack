import type { Metadata, Viewport } from "next";
import "./globals.css";
// HMR optimization disabled in production
import ClientProviders from "@/components/ClientProviders";
import VercelProviders from "@/components/VercelProviders";
import ConditionalHeader from "@/components/layout/ConditionalHeader";

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
        {/* Viewport géré automatiquement par export viewport ci-dessus */}
        <meta name="description" content="Application de suivi de musculation avec minuterie, nutrition et progression. Suivi tes entraînements, ta nutrition et ta progression comme un(e) champion(ne) !" />
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

        {/* Extension Error Shield ULTRAHARDCORE + Performance - Bloque erreurs et optimise messages */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){if(typeof chrome!=='undefined'){const orig={error:console.error,warn:console.warn};console.error=console.warn=function(...a){const msg=a[0]?.toString?.()??'';if(msg.includes('runtime.lastError')||msg.includes('Receiving end does not exist')||msg.includes('message port closed')||msg.includes('Could not establish connection')||msg.includes('Extension context')||msg.includes('chrome-extension://')||msg.includes('unload')||msg.includes('Violation')||a[1]?.url?.includes?.('chrome-extension'))return;return orig.error.apply(console,a)};window.addEventListener('error',e=>{const src=e.filename||e.target?.src||'';if(src.includes('chrome-extension')||src.includes('content.js'))e.stopImmediatePropagation()},true);window.addEventListener('message',e=>{if(e.source!==window&&(e.origin.includes('chrome-extension')||e.data?.type?.includes('extension')))e.stopImmediatePropagation()},{passive:true,capture:true})}})();`
        }} />

        {/* Theme init - Garde dans head pour performance */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{const s=localStorage.getItem('theme'),d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.remove('dark','light');s==='dark'||(!s&&d)?document.documentElement.classList.add('dark'):document.documentElement.classList.add('light')}catch{document.documentElement.classList[window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'add':'remove']('dark')}})();`
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