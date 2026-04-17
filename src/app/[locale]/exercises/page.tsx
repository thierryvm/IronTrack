import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';
import { requireUser } from '@/lib/auth';
import {
  getExercises,
  exerciseOwnershipSchema,
  exerciseTypeSchema,
  type ExerciseFilters,
  type ExerciseOwnership,
  type ExerciseTypeFilter,
} from '@/lib/exercises';

interface ExercisesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    type?: string;
    muscle?: string;
    ownership?: string;
    q?: string;
  }>;
}

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * Bibliothèque d'exercices — full SSR, filtrable via l'URL.
 *
 * Sécurité :
 *  - `requireUser()` → redirige /login si anonyme
 *  - RLS + `.or('user_id.eq.X,is_public.eq.true')` : on ne voit que ses
 *    exercices + les publics
 *  - Search échappe les wildcards LIKE côté fetcher
 */
export default async function ExercisesPage({
  params,
  searchParams,
}: ExercisesPageProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);

  const user = await requireUser(typedLocale);
  const sp = await searchParams;

  // --- Filtres (parsing défensif) ---
  const typeParse = exerciseTypeSchema.safeParse(sp.type);
  const type: ExerciseTypeFilter = typeParse.success ? typeParse.data : 'all';

  const ownershipParse = exerciseOwnershipSchema.safeParse(sp.ownership);
  const ownership: ExerciseOwnership = ownershipParse.success
    ? ownershipParse.data
    : 'all';

  const muscle =
    sp.muscle && sp.muscle.trim().length > 0 && sp.muscle.length <= 40
      ? sp.muscle.trim()
      : null;
  const search =
    sp.q && sp.q.trim().length > 0 && sp.q.length <= 80 ? sp.q.trim() : null;

  const filters: ExerciseFilters = { type, muscle, ownership, search };
  const list = await getExercises(user.id, filters);

  const t = await getTranslations({
    locale: typedLocale,
    namespace: 'exercises',
  });

  const buildHref = (
    override: Partial<{
      type: ExerciseTypeFilter;
      muscle: string | null;
      ownership: ExerciseOwnership;
      q: string | null;
    }>,
  ) => {
    const nextType = override.type ?? type;
    const nextMuscle = 'muscle' in override ? override.muscle : muscle;
    const nextOwnership = override.ownership ?? ownership;
    const nextSearch = 'q' in override ? override.q : search;

    const usp = new URLSearchParams();
    if (nextType !== 'all') usp.set('type', nextType);
    if (nextMuscle) usp.set('muscle', nextMuscle);
    if (nextOwnership !== 'all') usp.set('ownership', nextOwnership);
    if (nextSearch) usp.set('q', nextSearch);
    const qs = usp.toString();
    return `/${typedLocale}/exercises${qs ? `?${qs}` : ''}`;
  };

  const typeOptions: ExerciseTypeFilter[] = ['all', 'strength', 'cardio'];
  const ownershipOptions: ExerciseOwnership[] = ['all', 'mine', 'public'];

  const hasActiveFilter =
    type !== 'all' || ownership !== 'all' || muscle !== null || search !== null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{t('subtitle')}</p>
      </header>

      {/* Recherche (form GET, sans JS) */}
      <form
        method="get"
        action={`/${typedLocale}/exercises`}
        className="mb-6 flex flex-wrap gap-3"
        role="search"
      >
        {type !== 'all' && <input type="hidden" name="type" value={type} />}
        {ownership !== 'all' && (
          <input type="hidden" name="ownership" value={ownership} />
        )}
        {muscle && <input type="hidden" name="muscle" value={muscle} />}
        <label htmlFor="search" className="sr-only">
          {t('search.label')}
        </label>
        <input
          id="search"
          name="q"
          type="search"
          defaultValue={search ?? ''}
          placeholder={t('search.placeholder')}
          maxLength={80}
          className="min-h-11 flex-1 border-2 border-foreground bg-background px-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center border-2 border-foreground bg-foreground px-5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-foreground/90"
        >
          {t('search.submit')}
        </button>
      </form>

      {/* Filtres */}
      <section
        aria-labelledby="filters-heading"
        className="mb-8 border-2 border-foreground p-6"
      >
        <h2
          id="filters-heading"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
        >
          {t('filters.label')}
        </h2>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <FilterGroup label={t('filters.type.label')}>
            {typeOptions.map((ty) => (
              <FilterPill
                key={ty}
                active={ty === type}
                href={buildHref({ type: ty })}
                label={t(`filters.type.${ty}`)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label={t('filters.ownership.label')}>
            {ownershipOptions.map((o) => (
              <FilterPill
                key={o}
                active={o === ownership}
                href={buildHref({ ownership: o })}
                label={t(`filters.ownership.${o}`)}
              />
            ))}
          </FilterGroup>
        </div>

        {list.availableMuscles.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {t('filters.muscle.label')}
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                active={muscle === null}
                href={buildHref({ muscle: null })}
                label={t('filters.muscle.all')}
              />
              {list.availableMuscles.map((m) => (
                <FilterPill
                  key={m}
                  active={m === muscle}
                  href={buildHref({ muscle: m })}
                  label={m}
                />
              ))}
            </div>
          </div>
        )}

        {hasActiveFilter && (
          <Link
            href={`/${typedLocale}/exercises`}
            className="mt-6 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest underline-offset-4 hover:underline"
          >
            ← {t('filters.reset')}
          </Link>
        )}
      </section>

      {/* Comptage */}
      <p
        className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground"
        aria-live="polite"
      >
        {t('totalCount', { count: list.totalCount })}
      </p>

      {/* Liste / Empty */}
      {list.items.length === 0 ? (
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.items.map((ex) => (
            <li key={ex.id}>
              <article className="group flex h-full flex-col border-2 border-foreground p-5 transition hover:bg-muted">
                <header className="mb-3 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-lg leading-snug text-foreground break-words">
                    {ex.name}
                  </h3>
                  {ex.isMine && (
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t('badge.mine')}
                    </span>
                  )}
                </header>
                <dl className="space-y-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {ex.muscleGroup && (
                    <div className="flex justify-between gap-3">
                      <dt>{t('field.muscle')}</dt>
                      <dd className="text-foreground">{ex.muscleGroup}</dd>
                    </div>
                  )}
                  {ex.exerciseType && (
                    <div className="flex justify-between gap-3">
                      <dt>{t('field.type')}</dt>
                      <dd className="text-foreground">{ex.exerciseType}</dd>
                    </div>
                  )}
                  {ex.equipmentName && (
                    <div className="flex justify-between gap-3">
                      <dt>{t('field.equipment')}</dt>
                      <dd className="text-foreground">{ex.equipmentName}</dd>
                    </div>
                  )}
                  {ex.difficulty !== null && ex.difficulty > 0 && (
                    <div className="flex justify-between gap-3">
                      <dt>{t('field.difficulty')}</dt>
                      <dd className="text-foreground">
                        {'★'.repeat(Math.min(ex.difficulty, 5))}
                      </dd>
                    </div>
                  )}
                </dl>
              </article>
            </li>
          ))}
        </ul>
      )}

      {list.totalCount > list.items.length && (
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t('truncated', {
            shown: list.items.length,
            total: list.totalCount,
          })}
        </p>
      )}

      <nav className="mt-10 font-mono text-xs uppercase tracking-widest">
        <Link
          href={`/${typedLocale}/dashboard`}
          className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:underline"
        >
          ← {t('back')}
        </Link>
      </nav>
    </main>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        active
          ? 'inline-flex min-h-11 items-center border-2 border-foreground bg-foreground px-4 font-mono text-xs uppercase tracking-widest text-background'
          : 'inline-flex min-h-11 items-center border-2 border-foreground px-4 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-muted'
      }
    >
      {label}
    </Link>
  );
}
