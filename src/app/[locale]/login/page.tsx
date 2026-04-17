import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';

import { LoginForm } from './login-form';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  const t = await getTranslations({ locale: typedLocale, namespace: 'auth' });
  return {
    title: t('login.metaTitle'),
    description: t('login.metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);
  const t = await getTranslations({ locale: typedLocale, namespace: 'auth' });
  const tBrand = await getTranslations({
    locale: typedLocale,
    namespace: 'brand',
  });

  return (
    <main className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1fr_minmax(420px,520px)]">
      {/* COLONNE GAUCHE — éditoriale brutaliste */}
      <aside className="relative hidden flex-col justify-between bg-foreground p-12 text-background lg:flex">
        <header className="flex items-center justify-between">
          <Link
            href={`/${typedLocale}`}
            className="font-mono text-xs uppercase tracking-[0.3em] text-background/70 transition hover:text-background"
          >
            ← {tBrand('name')}
          </Link>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-background/50">
            {t('login.eyebrow')}
          </span>
        </header>

        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[oklch(0.85_0.20_120)]">
            {t('login.editorialKicker')}
          </p>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight xl:text-6xl">
            {t('login.editorialQuote')}
          </h2>
          <p className="max-w-md text-base leading-relaxed text-background/70">
            {t('login.editorialAttribution')}
          </p>
        </div>

        <footer className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-background/50">
          <span>© IronTrack 2026</span>
          <span>v2.0.0-alpha</span>
        </footer>
      </aside>

      {/* COLONNE DROITE — formulaire */}
      <section className="flex flex-col justify-center bg-background px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          {/* Brand mobile only */}
          <Link
            href={`/${typedLocale}`}
            className="mb-12 inline-flex items-center font-mono text-xs uppercase tracking-[0.3em] text-foreground lg:hidden"
          >
            ← {tBrand('name')}
          </Link>

          <header className="mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t('login.eyebrow')}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              {t('login.title')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t('login.lede')}
            </p>
          </header>

          <Suspense
            fallback={<div className="h-[420px]" aria-hidden="true" />}
          >
            <LoginForm />
          </Suspense>

          <p className="mt-10 text-xs text-muted-foreground">
            {t('login.terms')}{' '}
            <Link
              href={`/${typedLocale}/legal/privacy`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t('login.privacy')}
            </Link>{' '}
            ·{' '}
            <Link
              href={`/${typedLocale}/legal/terms`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t('login.termsLink')}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
