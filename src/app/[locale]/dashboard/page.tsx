import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Avatar } from '@/components/avatar';
import { LOCALES, type Locale } from '@/i18n/request';
import { requireUser } from '@/lib/auth';
import { getDisplayName, getProfile, needsProfileOnboarding } from '@/lib/profile';

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
  const profile = await getProfile();
  const displayName = getDisplayName(profile, user);
  const showOnboarding = needsProfileOnboarding(profile);

  const t = await getTranslations({
    locale: typedLocale,
    namespace: 'dashboard',
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12 flex items-start justify-between gap-4">
        <div className="flex items-start gap-5">
          <Link
            href={`/${typedLocale}/profile`}
            aria-label={t('profileLink')}
            className="mt-1 shrink-0"
          >
            <Avatar
              src={profile?.avatar_url ?? null}
              displayName={displayName}
              size="lg"
            />
          </Link>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t('eyebrow')}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-foreground">
              {t('hello', { name: displayName })}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {t('greeting', { email: user.email ?? '' })}
            </p>
          </div>
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

      {showOnboarding && (
        <section
          className="mb-10 border-2 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"
          style={{
            background: 'color-mix(in oklab, var(--color-brand) 8%, transparent)',
            borderColor: 'var(--color-brand, var(--color-foreground))',
          }}
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t('onboarding.label')}
            </p>
            <p className="mt-2 font-display text-xl leading-snug text-foreground">
              {t('onboarding.body')}
            </p>
          </div>
          <Link
            href={`/${typedLocale}/profile`}
            className="mt-4 inline-flex min-h-[44px] items-center border-2 border-foreground bg-foreground px-5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-foreground/90 sm:mt-0 sm:shrink-0"
          >
            {t('onboarding.cta')}
          </Link>
        </section>
      )}

      <section className="border-2 border-foreground p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t('placeholder.label')}
        </p>
        <p className="mt-3 font-display text-2xl leading-snug text-foreground">
          {t('placeholder.body')}
        </p>
        <div className="mt-6 flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest">
          <Link
            href={`/${typedLocale}/profile`}
            className="underline-offset-4 hover:underline"
          >
            {t('profileLink')} →
          </Link>
          <Link
            href={`/${typedLocale}`}
            className="underline-offset-4 hover:underline"
          >
            ← {t('back')}
          </Link>
        </div>
      </section>
    </main>
  );
}
