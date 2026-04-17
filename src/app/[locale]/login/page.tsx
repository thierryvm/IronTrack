import type { Metadata } from 'next';
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

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-16">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t('login.eyebrow')}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-foreground">
          {t('login.title')}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{t('login.lede')}</p>
      </header>

      <LoginForm />
    </main>
  );
}
