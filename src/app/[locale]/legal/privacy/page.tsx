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
    title: t('privacy.title'),
    description: t('privacy.lede'),
  };
}

export default async function PrivacyPage({ params }: PageProps) {
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
          {t('privacy.title')}
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {t('privacy.lede')}
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
        <h2 className="font-display text-2xl">{t('privacy.collect.title')}</h2>
        <p>{t('privacy.collect.body')}</p>
        <h2 className="font-display text-2xl">{t('privacy.usage.title')}</h2>
        <p>{t('privacy.usage.body')}</p>
        <h2 className="font-display text-2xl">{t('privacy.rights.title')}</h2>
        <p>{t('privacy.rights.body')}</p>
        <h2 className="font-display text-2xl">{t('privacy.contact.title')}</h2>
        <p>{t('privacy.contact.body')}</p>
      </section>
    </article>
  );
}
