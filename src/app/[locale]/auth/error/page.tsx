import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';

interface AuthErrorPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthErrorPage({ params }: AuthErrorPageProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);
  const t = await getTranslations({ locale: typedLocale, namespace: 'auth.error' });

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-4xl text-foreground">{t('title')}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t('body')}</p>
      <Link
        href={`/${typedLocale}/login`}
        className="mt-6 inline-flex min-h-[44px] items-center justify-center border border-border bg-foreground px-6 font-mono text-sm uppercase tracking-widest text-background transition hover:bg-foreground/90"
      >
        {t('cta')}
      </Link>
    </main>
  );
}
