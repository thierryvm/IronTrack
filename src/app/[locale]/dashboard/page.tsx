import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Avatar } from '@/components/avatar';
import { LOCALES, type Locale } from '@/i18n/request';
import { requireUser } from '@/lib/auth';
import { getDashboardStats } from '@/lib/dashboard';
import {
  formatDistance,
  formatDuration,
  formatRelativeDate,
} from '@/lib/dashboard/format';
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
  const [profile, stats] = await Promise.all([
    getProfile(),
    getDashboardStats(user.id),
  ]);
  const displayName = getDisplayName(profile, user);
  const showOnboarding = needsProfileOnboarding(profile);

  const t = await getTranslations({
    locale: typedLocale,
    namespace: 'dashboard',
  });

  const hasAnyData =
    stats.streak.current > 0 ||
    stats.sevenDaysWorkouts > 0 ||
    stats.recentWorkouts.length > 0 ||
    stats.lastPerformance !== null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:justify-between sm:gap-4">
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
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t('eyebrow')}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-foreground break-words sm:text-5xl">
              {t('hello', { name: displayName })}
            </h1>
            <p className="mt-3 break-words text-base text-muted-foreground">
              {t('greeting', { email: user.email ?? '' })}
            </p>
          </div>
        </div>
        <form action={signOut} className="shrink-0">
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

      {!hasAnyData && !showOnboarding && (
        <section className="mb-10 border-2 border-foreground p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('empty.label')}
          </p>
          <p className="mt-3 font-display text-2xl leading-snug text-foreground">
            {t('empty.body')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('empty.subtext')}
          </p>
        </section>
      )}

      {/* Stats grid : streak + 7 days */}
      <section
        aria-labelledby="stats-heading"
        className="mb-8 grid gap-6 sm:grid-cols-2"
      >
        <h2 id="stats-heading" className="sr-only">
          {t('stats.heading')}
        </h2>

        {/* Streak */}
        <article className="border-2 border-foreground p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('stats.streak.label')}
          </p>
          <p className="mt-4 font-display text-5xl leading-none text-foreground">
            {stats.streak.current}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('stats.streak.days', { count: stats.streak.current })}
          </p>
          {stats.streak.max > 0 && (
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t('stats.streak.record', { count: stats.streak.max })}
            </p>
          )}
        </article>

        {/* 7 jours */}
        <article className="border-2 border-foreground p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('stats.sevenDays.label')}
          </p>
          <p className="mt-4 font-display text-5xl leading-none text-foreground">
            {stats.sevenDaysWorkouts}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('stats.sevenDays.workouts', {
              count: stats.sevenDaysWorkouts,
            })}
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('stats.sevenDays.subtext')}
          </p>
        </article>
      </section>

      {/* Dernière performance */}
      {stats.lastPerformance && (
        <section className="mb-8 border-2 border-foreground p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('stats.lastPerformance.label')}
          </p>
          <h2 className="mt-3 font-display text-2xl leading-snug text-foreground">
            {stats.lastPerformance.exerciseName}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatRelativeDate(
              stats.lastPerformance.performedAt,
              typedLocale,
            )}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-widest">
            {stats.lastPerformance.weightKg !== null && (
              <div>
                <dt className="text-muted-foreground">
                  {t('stats.lastPerformance.weight')}
                </dt>
                <dd className="mt-1 font-display text-lg text-foreground">
                  {stats.lastPerformance.weightKg} kg
                </dd>
              </div>
            )}
            {stats.lastPerformance.reps !== null && (
              <div>
                <dt className="text-muted-foreground">
                  {t('stats.lastPerformance.reps')}
                </dt>
                <dd className="mt-1 font-display text-lg text-foreground">
                  {stats.lastPerformance.reps}
                </dd>
              </div>
            )}
            {formatDistance(
              stats.lastPerformance.distanceMeters,
              stats.lastPerformance.distanceUnit,
              typedLocale,
            ) && (
              <div>
                <dt className="text-muted-foreground">
                  {t('stats.lastPerformance.distance')}
                </dt>
                <dd className="mt-1 font-display text-lg text-foreground">
                  {formatDistance(
                    stats.lastPerformance.distanceMeters,
                    stats.lastPerformance.distanceUnit,
                    typedLocale,
                  )}
                </dd>
              </div>
            )}
            {stats.lastPerformance.durationSeconds !== null &&
              stats.lastPerformance.durationSeconds > 0 && (
                <div>
                  <dt className="text-muted-foreground">
                    {t('stats.lastPerformance.duration')}
                  </dt>
                  <dd className="mt-1 font-display text-lg text-foreground">
                    {formatDuration(
                      stats.lastPerformance.durationSeconds,
                      typedLocale,
                    )}
                  </dd>
                </div>
              )}
          </dl>
        </section>
      )}

      {/* Dernières séances */}
      <section className="mb-10 border-2 border-foreground p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t('stats.recentWorkouts.label')}
            </p>
            <h2 className="mt-3 font-display text-2xl leading-snug text-foreground">
              {t('stats.recentWorkouts.heading')}
            </h2>
          </div>
          {stats.recentWorkouts.length > 0 && (
            <Link
              href={`/${typedLocale}/history`}
              className="mt-1 shrink-0 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest underline-offset-4 hover:underline"
            >
              {t('stats.recentWorkouts.viewAll')} →
            </Link>
          )}
        </div>

        {stats.recentWorkouts.length === 0 ? (
          <p className="text-base text-muted-foreground">
            {t('stats.recentWorkouts.empty')}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.recentWorkouts.map((w) => (
              <li
                key={w.id}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg leading-snug text-foreground break-words">
                    {w.name}
                  </p>
                  {w.type && (
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {w.type}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground sm:text-right">
                  <span>{formatRelativeDate(w.endTime, typedLocale)}</span>
                  {w.durationSeconds !== null && w.durationSeconds > 0 && (
                    <span>
                      {formatDuration(w.durationSeconds, typedLocale)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav className="mt-10 flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest">
        <Link
          href={`/${typedLocale}/profile`}
          className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:underline"
        >
          {t('profileLink')} →
        </Link>
        <Link
          href={`/${typedLocale}`}
          className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:underline"
        >
          ← {t('back')}
        </Link>
      </nav>
    </main>
  );
}
