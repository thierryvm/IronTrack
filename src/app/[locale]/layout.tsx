import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from 'next/script';

import { LOCALES, type Locale } from '@/i18n/request';
import '../globals.css';

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
  formatDetection: { telephone: false, email: false, address: false },
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

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!(LOCALES as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain">
        {/* JSON-LD SoftwareApplication — SEO + GEO (Generative Engine Optimization) */}
        <Script id="ld-json-software" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'IronTrack',
            description:
              'Fitness web app for strength training, cardio, nutrition and training partners. Belgian-made, multilingual FR/NL/EN, GDPR-compliant, free forever tier.',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web, iOS, Android (PWA)',
            inLanguage: ['fr-BE', 'nl-BE', 'en'],
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            author: { '@type': 'Person', name: 'Thierry VM' },
          })}
        </Script>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
