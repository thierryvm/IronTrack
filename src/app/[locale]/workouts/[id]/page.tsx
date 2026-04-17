import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';
import { requireUser } from '@/lib/auth';
import {
  formatDistance,
  formatDuration,
  formatRelativeDate,
} from '@/lib/dashboard/format';
import {
  getWorkoutDetail,
  type PerformanceLogEntry,
  type WorkoutExerciseGroup,
} from '@/lib/workouts';

interface WorkoutDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * Détail d'une séance — full SSR, lecture seule.
 *
 * Sécurité :
 *  - `requireUser()` → redirige vers /login si non connecté
 *  - `getWorkoutDetail()` filtre par `user_id` + RLS : un autre user renverra
 *    `null` → `notFound()` localisé (pas d'exfiltration : même réponse qu'une
 *    séance inexistante).
 *  - `id` parsé avec parseInt + isFinite (rejette NaN, Infinity, flottants).
 */
export default async function WorkoutDetailPage({
  params,
}: WorkoutDetailPageProps) {
  const { locale, id: idParam } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);

  // Auth AVANT tout parsing — un anonyme ne doit pas pouvoir sonder
  // l'espace des URLs (même pour se voir renvoyer un 404).
  const user = await requireUser(typedLocale);

  // Parsing strict : rejette "abc", "1.5", "1e10", négatifs.
  const workoutId = Number.parseInt(idParam, 10);
  if (
    !Number.isFinite(workoutId) ||
    workoutId <= 0 ||
    String(workoutId) !== idParam
  ) {
    notFound();
  }

  const detail = await getWorkoutDetail(user.id, workoutId);
  if (!detail) notFound();

  const t = await getTranslations({
    locale: typedLocale,
    namespace: 'workoutDetail',
  });

  const sessionDate =
    detail.endTime ?? detail.scheduledDate ?? detail.createdAt;

  const totalSets = detail.exercises.reduce(
    (acc, g) => acc + g.logs.length,
    0,
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground break-words sm:text-5xl">
          {detail.name}
        </h1>
        <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {detail.type && <span>{detail.type}</span>}
          {detail.status && <span>· {detail.status}</span>}
          <span>· {formatRelativeDate(sessionDate, typedLocale)}</span>
        </div>
      </header>

      {/* Métadonnées de séance */}
      <section className="mb-10 grid gap-4 border-2 border-foreground p-6 sm:grid-cols-3">
        <StatTile
          label={t('stats.duration')}
          value={formatDuration(detail.durationSeconds, typedLocale)}
        />
        <StatTile
          label={t('stats.exercises')}
          value={String(detail.exercises.length)}
        />
        <StatTile label={t('stats.sets')} value={String(totalSets)} />
      </section>

      {/* Notes séance */}
      {detail.notes && (
        <section className="mb-10 border-2 border-foreground p-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t('notes.label')}
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-base text-foreground">
            {detail.notes}
          </p>
        </section>
      )}

      {/* Exercices */}
      {detail.exercises.length === 0 ? (
        <section className="border-2 border-foreground p-8 text-center">
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
      ) : (
        <section aria-labelledby="exercises-heading" className="space-y-6">
          <h2
            id="exercises-heading"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            {t('exercises.heading')}
          </h2>
          {detail.exercises.map((group) => (
            <ExerciseBlock
              key={group.exerciseId}
              group={group}
              locale={typedLocale}
              tSet={t('set.label')}
            />
          ))}
        </section>
      )}

      <nav className="mt-12 flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest">
        <Link
          href={`/${typedLocale}/history`}
          className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:underline"
        >
          ← {t('back.history')}
        </Link>
        <Link
          href={`/${typedLocale}/dashboard`}
          className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:underline"
        >
          {t('back.dashboard')} →
        </Link>
      </nav>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl leading-snug text-foreground">
        {value}
      </p>
    </div>
  );
}

function ExerciseBlock({
  group,
  locale,
  tSet,
}: {
  group: WorkoutExerciseGroup;
  locale: Locale;
  tSet: string;
}) {
  return (
    <article className="border-2 border-foreground p-6">
      <header className="mb-4">
        <h3 className="font-display text-xl leading-snug text-foreground break-words">
          {group.exerciseName}
        </h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {group.logs.length}&nbsp;×&nbsp;{tSet}
        </p>
      </header>
      <ul className="divide-y divide-border">
        {group.logs.map((log, idx) => (
          <li
            key={log.id}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {tSet} {log.setNumber ?? idx + 1}
            </span>
            <SetMetrics log={log} locale={locale} />
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Affiche les métriques pertinentes d'un set — skip les null/0 pour garder
 * un rendu dense et lisible. Charte brutaliste : typo mono, pas d'icônes.
 */
function SetMetrics({
  log,
  locale,
}: {
  log: PerformanceLogEntry;
  locale: Locale;
}) {
  const metrics: string[] = [];

  if (log.reps !== null && log.reps > 0) {
    metrics.push(`${log.reps} reps`);
  }
  if (log.weightKg !== null && log.weightKg > 0) {
    metrics.push(`${log.weightKg} kg`);
  }

  const distance = formatDistance(log.distance, log.distanceUnit, locale);
  if (distance) metrics.push(distance);

  if (log.durationSeconds !== null && log.durationSeconds > 0) {
    metrics.push(formatDuration(log.durationSeconds, locale));
  }
  if (log.watts !== null && log.watts > 0) metrics.push(`${log.watts} W`);
  if (log.strokeRate !== null && log.strokeRate > 0) {
    metrics.push(`${log.strokeRate} SPM`);
  }
  if (log.cadence !== null && log.cadence > 0) {
    metrics.push(`${log.cadence} RPM`);
  }
  if (log.resistance !== null && log.resistance > 0) {
    metrics.push(`R${log.resistance}`);
  }
  if (log.incline !== null && log.incline > 0) {
    metrics.push(`${log.incline}%`);
  }
  if (log.heartRate !== null && log.heartRate > 0) {
    metrics.push(`${log.heartRate} bpm`);
  }
  if (log.rpe !== null && log.rpe > 0) metrics.push(`RPE ${log.rpe}`);

  if (metrics.length === 0) {
    return (
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        —
      </span>
    );
  }

  return (
    <span className="font-mono text-sm tabular-nums text-foreground">
      {metrics.join(' · ')}
    </span>
  );
}
