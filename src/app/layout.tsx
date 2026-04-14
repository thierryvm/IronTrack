import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F1EA' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: {
    default: 'IronTrack — Train heavier, live lighter.',
    template: '%s · IronTrack',
  },
  description:
    "Une app fitness pensée comme un carnet d'atelier. Précise, éditoriale, brutaliste. Musculation, cardio, nutrition.",
  applicationName: 'IronTrack',
  keywords: [
    'fitness',
    'musculation',
    'cardio',
    'nutrition',
    'workout tracker',
    'strength training',
    'Belgique',
  ],
  authors: [{ name: 'Thierry VM' }],
  creator: 'Thierry VM',
  publisher: 'IronTrack',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'IronTrack',
    title: 'IronTrack — Train heavier, live lighter.',
    description:
      "Une app fitness pensée comme un carnet d'atelier. Précise, éditoriale, brutaliste.",
    locale: 'fr_BE',
    alternateLocale: ['nl_BE', 'en_BE'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IronTrack — Train heavier, live lighter.',
    description: "Une app fitness pensée comme un carnet d'atelier.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain">{children}</body>
    </html>
  );
}
