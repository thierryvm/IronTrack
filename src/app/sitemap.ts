import type { MetadataRoute } from 'next';

import { LOCALES } from '@/i18n/request';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iron-track-dusky.vercel.app';

/**
 * Sitemap multilingue FR / NL / EN — déclare chaque route pour chaque locale
 * avec les alternates hreflang pour le SEO international (Google, Bing, DuckDuckGo).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [''] as const; // La landing pour l'instant. On ajoutera /workouts, /progress, etc. au fil des PRs.
  const now = new Date();

  return routes.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${route}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((alt) => [alt, `${SITE_URL}/${alt}${route}`]),
        ),
      },
    })),
  );
}
