import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';

interface LegalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LegalLayout({
  children,
  params,
}: LegalLayoutProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);
  const t = await getTranslations({ locale: typedLocale, namespace: 'legal' });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <nav className="mb-12 flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest">
        <Link
          href={`/${typedLocale}`}
          className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:underline"
        >
          ← {t('nav.home')}
        </Link>
        <Link
          href={`/${typedLocale}/legal/privacy`}
          className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:underline"
        >
          {t('nav.privacy')}
        </Link>
        <Link
          href={`/${typedLocale}/legal/terms`}
          className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:underline"
        >
          {t('nav.terms')}
        </Link>
      </nav>
      {children}
    </main>
  );
}
