import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/request';

export const metadata = {
  title: '404 · IronTrack',
  robots: { index: false, follow: false },
};

/**
 * 404 localisée. next-intl fournit la locale via `getLocale()` dans les
 * Not Found components grâce à `setRequestLocale()` exécuté plus haut
 * (layout + pages). Fallback explicit au DEFAULT_LOCALE si jamais l'appel
 * arrive hors contexte localisé.
 */
export default async function LocaleNotFound() {
  const rawLocale = await getLocale();
  const locale: Locale = (LOCALES as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : DEFAULT_LOCALE;

  const t = await getTranslations({ locale, namespace: 'notFound' });

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {t('eyebrow')}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-tight text-foreground sm:text-6xl">
        {t('title')}
      </h1>
      <p className="mt-5 max-w-prose text-base text-muted-foreground">
        {t('body')}
      </p>
      <nav className="mt-10 flex flex-wrap gap-4">
        <Link
          href={`/${locale}`}
          className="inline-flex min-h-11 items-center border-2 border-foreground bg-foreground px-5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-foreground/90"
        >
          ← {t('home')}
        </Link>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex min-h-11 items-center border-2 border-foreground px-5 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-muted"
        >
          {t('dashboard')} →
        </Link>
      </nav>
    </main>
  );
}
