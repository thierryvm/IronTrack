import { createServerClient } from '@/lib/supabase';

import {
  HISTORY_PAGE_SIZE,
  TYPE_DB_MAP,
  historyPageSchema,
  type HistoryFilters,
  type HistoryItem,
  type HistoryPage,
} from './schema';

/**
 * Mêmes statuts "terminés" que le dashboard — contrainte legacy FR.
 * @see src/lib/dashboard/index.ts
 */
const COMPLETED_STATUSES = ['Terminé', 'Réalisé'] as const;

/**
 * Retourne une page d'historique des séances de l'utilisateur courant.
 *
 * - Pagination cursor sur `end_time DESC` : stable même si de nouvelles
 *   séances sont insérées entre deux pages (pas de "jumping rows").
 * - RLS Supabase + `.eq('user_id')` en defense-in-depth.
 * - Erreur → page vide plutôt que crash (la page parente affichera l'état
 *   vide).
 */
export async function getHistoryPage(
  userId: string,
  filters: HistoryFilters,
): Promise<HistoryPage> {
  const supabase = await createServerClient();

  // --- Période ---
  const periodStart = periodStartISO(filters.period);

  // --- Query ---
  let query = supabase
    .from('workouts')
    .select('id, name, end_time, duration, type, status', { count: 'exact' })
    .eq('user_id', userId)
    .in('status', COMPLETED_STATUSES)
    .not('end_time', 'is', null)
    .order('end_time', { ascending: false })
    // +1 pour détecter "y a-t-il une page suivante ?" sans second round-trip
    .limit(HISTORY_PAGE_SIZE + 1);

  if (periodStart) {
    query = query.gte('end_time', periodStart);
  }
  if (filters.type !== 'all') {
    query = query.in('type', TYPE_DB_MAP[filters.type]);
  }
  if (filters.cursor) {
    // Strictly less than : pas de doublon entre pages.
    query = query.lt('end_time', filters.cursor);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[history] query failed:', error.message);
    return { items: [], nextCursor: null, totalCount: 0 };
  }

  const rawRows = data ?? [];
  const hasMore = rawRows.length > HISTORY_PAGE_SIZE;
  const trimmed = hasMore ? rawRows.slice(0, HISTORY_PAGE_SIZE) : rawRows;

  const items: HistoryItem[] = trimmed
    // Guard défensif : on a `.not('end_time', 'is', null)`, mais on reste prudent.
    .filter((w): w is typeof w & { end_time: string } => w.end_time !== null)
    .map((w) => ({
      id: w.id,
      name: w.name,
      endTime: w.end_time,
      durationSeconds: w.duration,
      type: w.type,
    }));

  const nextCursor =
    hasMore && items.length > 0
      ? (items[items.length - 1]?.endTime ?? null)
      : null;

  const parsed = historyPageSchema.safeParse({
    items,
    nextCursor,
    totalCount: count ?? items.length,
  });

  if (!parsed.success) {
    console.error(
      '[history] schema validation failed:',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    );
    return { items: [], nextCursor: null, totalCount: 0 };
  }

  return parsed.data;
}

function periodStartISO(period: HistoryFilters['period']): string | null {
  if (period === 'all') return null;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export type {
  HistoryFilters,
  HistoryItem,
  HistoryPage,
  HistoryPeriod,
  HistoryType,
} from './schema';
export {
  HISTORY_PAGE_SIZE,
  historyFiltersSchema,
  historyPeriodSchema,
  historyTypeSchema,
} from './schema';
