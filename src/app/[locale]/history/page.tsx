import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';
import { requireUser } from '@/lib/auth';
import {
  formatDuration,
  formatRelativeDate,
} from '@/lib/dashboard/format';
import {
  getHistoryPage,
  historyPeriodSchema,
  historyTypeSchema,
  type HistoryFilters,
  type HistoryPeriod,
  type HistoryType,
} from '@/lib/history';

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    period?: string;
    type?: string;
    cursor?: string;
  }>;
}

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * Historique complet des séances — filtrable (période + type) et paginé
 * par curseur (end_time desc).
 *
 * Full-SSR : filtres et pagination passent par des liens (`?period=…`).
 * Aucun JS nécessaire — accessibilité maximale, navigation fluide et
 * partageable via URL.
 */
export default async function HistoryPage({
  params,
  searchParams,
}: HistoryPageProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);

  const user = await requireUser(typedLocale);
  const sp = await searchParams;

  // --- Filtres (parsing défensif) ---
  const periodParse = historyPeriodSchema.safeParse(sp.period);
  const typeParse = historyTypeSchema.safeParse(sp.type);
  const period: HistoryPeriod = periodParse.success ? periodParse.data : '30d';
  const type: HistoryType = typeParse.success ? typeParse.data : 'all';
  // Le cursor vient toujours de NOUS (on le régénère à chaque page), donc si
  // un utilisateur modifie la query string et entre un truc invalide, on
  // remet `null` plutôt que de planter.
  const cursor =
    sp.cursor && /^\d{4}-\d{2}-\d{2}T/.test(sp.cursor) ? sp.cursor : null;

  const filters: HistoryFilters = { period, type, cursor };
  const pageData = await getHistoryPage(user.id, filters);

  const t = await getTranslations({
    locale: typedLocale,
    namespace: 'history',
  });

  const buildHref = (override: Partial<{ period: HistoryPeriod; type: HistoryType; cursor: string | null }>) => {
    const nextPeriod = override.period ?? period;
    const nextType = override.type ?? type;
    // Cursor: override explicit (incl. `null` pour reset)
    const nextCursor =
      'cursor' in override ? override.cursor : null;
    const usp = new URLSearchParams();
    if (nextPeriod !== '30d') usp.set('period', nextPeriod);
    if (nextType !== 'all') usp.set('type', nextType);
    if (nextCursor) usp.set('cursor', nextCursor);
    const qs = usp.toString();
    return `/${typedLocale}/history${qs ? `?${qs}` : ''}`;
  };

  const periodOptions: HistoryPeriod[] = ['7d', '30d', '90d', 'all'];
  const typeOptions: HistoryType[] = ['all', 'strength', 'cardio'];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{t('subtitle')}</p>
      </header>

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
          <FilterGroup label={t('filters.period.label')}>
            {periodOptions.map((p) => (
              <FilterPill
                key={p}
                active={p === period}
                href={buildHref({ period: p, cursor: null })}
                label={t(`filters.period.${p}`)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label={t('filters.type.label')}>
            {typeOptions.map((ty) => (
              <FilterPill
                key={ty}
                active={ty === type}
                href={buildHref({ type: ty, cursor: null })}
                label={t(`filters.type.${ty}`)}
              />
            ))}
          </FilterGroup>
        </div>

        {(period !== '30d' || type !== 'all' || cursor) && (
          <Link
            href={`/${typedLocale}/history`}
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
        {t('totalCount', { count: pageData.totalCount })}
      </p>

      {/* Liste / Empty */}
      {pageData.items.length === 0 ? (
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
        <section className="border-2 border-foreground p-6">
          <ul className="divide-y divide-border">
            {pageData.items.map((w) => (
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

          <div className="mt-6 flex items-center justify-between gap-4">
            {pageData.nextCursor ? (
              <Link
                href={buildHref({ cursor: pageData.nextCursor })}
                className="inline-flex min-h-11 items-center border-2 border-foreground px-5 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-muted"
              >
                {t('loadMore')} →
              </Link>
            ) : (
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {t('endOfList')}
              </p>
            )}
          </div>
        </section>
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
