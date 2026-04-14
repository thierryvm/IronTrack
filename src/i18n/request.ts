import { getRequestConfig } from 'next-intl/server';

export const LOCALES = ['fr', 'nl', 'en'] as const;
export const DEFAULT_LOCALE = 'fr' as const;
export type Locale = (typeof LOCALES)[number];

/**
 * next-intl request config.
 * Activera le routing /[locale]/ à l'étape 2 via middleware.ts.
 * Pour l'instant, FR est servi par défaut sans préfixe d'URL.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = (LOCALES as readonly string[]).includes(requested ?? '')
    ? (requested as Locale)
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
