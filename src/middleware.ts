import createMiddleware from 'next-intl/middleware';
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/request';

/**
 * next-intl middleware — gère le routing par locale.
 * - `/` → détecte la langue via Accept-Language puis redirige vers `/fr`, `/nl` ou `/en`
 * - `/fr/*`, `/nl/*`, `/en/*` → servis tels quels
 * - `localePrefix: 'as-needed'` : le préfixe est toujours visible (pas de URL sans locale)
 */
export default createMiddleware({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeDetection: true,
});

export const config = {
  // Match toutes les routes sauf :
  // - /api/*       (API routes)
  // - /_next/*     (Next internals)
  // - /_vercel/*   (Vercel infra)
  // - /*.xxx       (fichiers statiques avec extension)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
