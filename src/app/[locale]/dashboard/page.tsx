import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';
import { requireUser } from '@/lib/auth';

import { signOut } from '../actions';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);
  const user = await requireUser(typedLocale);
  const t = await getTranslations({
    locale: typedLocale,
    namespace: 'dashboard',
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-foreground">
            {t('title')}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            {t('greeting', { email: user.email ?? '' })}
          </p>
        </div>
        <form action={signOut}>
          <input type="hidden" name="locale" value={typedLocale} />
          <button
            type="submit"
            className="min-h-[44px] border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-muted"
          >
            {t('logout')}
          </button>
        </form>
      </header>

      <section className="border-2 border-foreground p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t('placeholder.label')}
        </p>
        <p className="mt-3 font-display text-2xl leading-snug text-foreground">
          {t('placeholder.body')}
        </p>
        <Link
          href={`/${typedLocale}`}
          className="mt-6 inline-flex font-mono text-xs uppercase tracking-widest underline-offset-4 hover:underline"
        >
          ← {t('back')}
        </Link>
      </section>
    </main>
  );
}
