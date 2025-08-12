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
        {/* Extension Error Shield - Production Ready */}
        <script
          id="extension-error-shield"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              // BOUCLIER ANTI-EXTENSIONS CHROME - Production Ready
              
              // 1. Intercepter les erreurs globales
              const originalAddEventListener = window.addEventListener;
              let errorShieldActive = true;
              
              window.addEventListener = function(type, listener, options) {
                if (type === 'error' && errorShieldActive) {
                  const wrappedListener = function(event) {
                    // Filtrer les erreurs d'extensions Chrome
                    if (event.filename && (
                      event.filename.includes('chrome-extension://') ||
                      event.filename.includes('moz-extension://') ||
                      event.filename.includes('safari-extension://') ||
                      event.message?.includes('runtime.lastError') ||
                      event.message?.includes('message channel') ||
                      event.message?.includes('message port')
                    )) {
                      console.debug('[IronTrack] Extension error filtered:', event.message);
                      event.stopImmediatePropagation?.();
                      event.preventDefault?.();
                      return;
                    }
                    return listener.call(this, event);
                  };
                  return originalAddEventListener.call(this, type, wrappedListener, options);
                }
                return originalAddEventListener.call(this, type, listener, options);
              };
              
              // 2. Intercepter window.onerror
              const originalOnError = window.onerror;
              window.onerror = function(message, source, lineno, colno, error) {
                if (source && (
                  source.includes('chrome-extension://') ||
                  source.includes('moz-extension://') ||
                  String(message).includes('runtime.lastError') ||
                  String(message).includes('message channel')
                )) {
                  console.debug('[IronTrack] Extension window.onerror filtered');
                  return true; // Empêcher propagation
                }
                return originalOnError ? originalOnError.call(this, message, source, lineno, colno, error) : false;
              };
              
              // 3. Intercepter unhandledrejection
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && String(event.reason).includes('runtime.lastError')) {
                  console.debug('[IronTrack] Extension promise rejection filtered');
                  event.preventDefault();
                  return;
                }
              });
              
              // 4. Console.error sélectif
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = String(args[0] || '');
                if (message.includes('runtime.lastError') || 
                    message.includes('message channel') ||
                    message.includes('message port') ||
                    message.includes('Receiving end does not exist')) {
                  return; // Ignorer silencieusement
                }
                return originalConsoleError.apply(console, args);
              };
              
              // 5. Protection setTimeout/setInterval
              const originalSetTimeout = window.setTimeout;
              const originalSetInterval = window.setInterval;
              
              window.setTimeout = function(fn, delay, ...args) {
                const wrappedFn = function() {
                  try {
                    return fn.apply(this, arguments);
                  } catch (error) {
                    if (String(error).includes('runtime.lastError')) {
                      console.debug('[IronTrack] Extension setTimeout error filtered');
                      return;
                    }
                    throw error;
                  }
                };
                return originalSetTimeout.call(this, wrappedFn, delay, ...args);
              };
              
              // Marquer le système comme protégé
              window.__irontrack_extension_shield = true;
              console.log('[IronTrack] 🛡️ Extension Error Shield activated');
              
            })();`
          }}
        />
        
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
      <body className="antialiased min-h-screen bg-surface-lightAlt text-gray-900 dark:bg-surface-dark dark:text-gray-100 overflow-x-hidden" suppressHydrationWarning>
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