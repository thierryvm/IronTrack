import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  const t = await getTranslations({ locale: typedLocale, namespace: 'legal' });
  return {
    title: t('terms.title'),
    description: t('terms.lede'),
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);
  const t = await getTranslations({ locale: typedLocale, namespace: 'legal' });

  return (
    <article className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground break-words sm:text-5xl">
          {t('terms.title')}
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {t('terms.lede')}
        </p>
      </header>

      <section
        className="border-2 p-6"
        style={{
          borderColor: 'var(--color-brand, var(--color-foreground))',
          background: 'color-mix(in oklab, var(--color-brand) 8%, transparent)',
        }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t('draft.label')}
        </p>
        <p className="mt-2 font-display text-xl leading-snug text-foreground">
          {t('draft.body')}
        </p>
      </section>

      <section className="space-y-4 text-base text-foreground">
        <h2 className="font-display text-2xl">{t('terms.service.title')}</h2>
        <p>{t('terms.service.body')}</p>
        <h2 className="font-display text-2xl">{t('terms.account.title')}</h2>
        <p>{t('terms.account.body')}</p>
        <h2 className="font-display text-2xl">{t('terms.content.title')}</h2>
        <p>{t('terms.content.body')}</p>
        <h2 className="font-display text-2xl">{t('terms.liability.title')}</h2>
        <p>{t('terms.liability.body')}</p>
      </section>
    </article>
  );
}
