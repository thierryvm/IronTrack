import type { Metadata, Viewport} from"next";
import { Inter} from"next/font/google";
import"./globals.css";
import ClientProviders from"@/components/ClientProviders";
import VercelProviders from"@/components/VercelProviders";
import ConditionalHeader from"@/components/layout/ConditionalHeader";
import {
 APP_DESCRIPTION,
 APP_NAME,
 APP_URL,
 DEFAULT_OG_IMAGE,
} from"./metadata";

const inter = Inter({
 subsets: ["latin"],
 variable:"--font-inter",
 display:"swap",
});

export const metadata: Metadata = {
 metadataBase: new URL(APP_URL),
 applicationName: APP_NAME,
 title: {
 default:"IronTrack - Fitness, musculation et nutrition",
 template:`%s | ${APP_NAME}`,
},
 description: APP_DESCRIPTION,
 keywords: ["musculation","fitness","nutrition","entraînement","progression","planning sportif","coach","sport"],
 authors: [{ name:"IronTrack Team"}],
 creator:"IronTrack Team",
 publisher: APP_NAME,
 category:"fitness",
 icons: {
 icon: [
 { url:"/icon.svg", type:"image/svg+xml"},
 { url:"/logo-32.webp", sizes:"32x32", type:"image/webp"},
 { url:"/logo-128.webp", sizes:"128x128", type:"image/webp"},
 ],
 apple:"/logo-128.webp",
},
 manifest:"/manifest.json",
 robots: {
 index: true,
 follow: true,
 googleBot: {
 index: true,
 follow: true,
"max-video-preview": -1,
"max-image-preview":"large",
"max-snippet": -1,
},
},
 alternates: {
 canonical: APP_URL,
},
 openGraph: {
 type:"website",
 locale:"fr_BE",
 url: APP_URL,
 title:"IronTrack - Fitness, musculation et nutrition",
 description: APP_DESCRIPTION,
 siteName: APP_NAME,
 images: [DEFAULT_OG_IMAGE],
},
 twitter: {
 card:"summary_large_image",
 title:"IronTrack - Fitness, musculation et nutrition",
 description: APP_DESCRIPTION,
 images: [DEFAULT_OG_IMAGE.url],
},
};

export const viewport: Viewport = {
 width:"device-width",
 initialScale: 1,
 maximumScale: 5, // WCAG compliance - minimum 5x zoom
 userScalable: true, // Accessibilité requise pour zoom
 viewportFit:"cover", // Support iPhone safe areas
 themeColor: "#FF6B00",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="fr" className={`dark h-full ${inter.variable}`}>
 <head>
 <meta name="mobile-web-app-capable" content="yes" />
 <meta name="apple-mobile-web-app-capable" content="yes" />
 <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
 <meta name="format-detection" content="telephone=no" />
 </head>
 <body className="antialiased min-h-screen overflow-x-hidden" suppressHydrationWarning>
 <ClientProviders>
 <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
 <ConditionalHeader />
 <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden pb-20 md:pb-0">
 {children}
 </main>
 </div>
 </ClientProviders>
 <VercelProviders />
 </body>
 </html>
 );
}
