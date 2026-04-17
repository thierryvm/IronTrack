'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/request';

/**
 * Error boundary localisé (runtime errors côté serveur OU client, à partir du
 * `[locale]/layout.tsx`). Reste client-component car Next.js impose
 * `"use client"` pour les `error.tsx`.
 *
 * On ne log PAS `error.message` côté utilisateur (fuite d'info interne) — on
 * se contente du `digest` (hash anonymisé Next.js) utile pour le support.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const rawLocale = useLocale();
  const locale: Locale = (LOCALES as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : DEFAULT_LOCALE;
  const t = useTranslations('error');

  useEffect(() => {
    // Trace serveur déjà capturée par Next, on log juste une confirmation
    // côté client pour faciliter le debug en dev.
    if (process.env.NODE_ENV !== 'production') {
      console.error('[error.tsx] runtime error:', error);
    }
  }, [error]);

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
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center border-2 border-foreground bg-foreground px-5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-foreground/90"
        >
          {t('retry')} ↻
        </button>
        <Link
          href={`/${locale}`}
          className="inline-flex min-h-11 items-center border-2 border-foreground px-5 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-muted"
        >
          ← {t('home')}
        </Link>
      </nav>
      {error.digest && (
        <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {t('digest')} : <code className="text-foreground">{error.digest}</code>
        </p>
      )}
    </main>
  );
}
