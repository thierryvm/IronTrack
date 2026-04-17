import { z } from 'zod';

/**
 * Schémas Zod pour la page d'historique des séances.
 *
 * Comme pour le dashboard, on valide en sortie de Supabase pour se protéger
 * des dérives de schéma DB et des valeurs inattendues côté runtime.
 */

export const HISTORY_PAGE_SIZE = 20;

export const historyPeriodSchema = z.enum(['7d', '30d', '90d', 'all']);
export type HistoryPeriod = z.infer<typeof historyPeriodSchema>;

export const historyTypeSchema = z.enum(['all', 'strength', 'cardio']);
export type HistoryType = z.infer<typeof historyTypeSchema>;

/**
 * Mapping filtre UI -> valeurs legacy stockées en base.
 * La contrainte `workouts_type_check` n'accepte que
 * 'Musculation' | 'Cardio' | 'Étirement' | 'Repos'.
 */
export const TYPE_DB_MAP: Record<Exclude<HistoryType, 'all'>, string[]> = {
  strength: ['Musculation'],
  cardio: ['Cardio'],
};

export const historyFiltersSchema = z.object({
  period: historyPeriodSchema.default('30d'),
  type: historyTypeSchema.default('all'),
  /** ISO date : fetch only workouts ended strictly before this cursor. */
  cursor: z.string().datetime().nullable().default(null),
});
export type HistoryFilters = z.infer<typeof historyFiltersSchema>;

export const historyItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  endTime: z.string().datetime(),
  durationSeconds: z.number().int().nonnegative().nullable(),
  type: z.string().nullable(),
});
export type HistoryItem = z.infer<typeof historyItemSchema>;

export const historyPageSchema = z.object({
  items: z.array(historyItemSchema).max(HISTORY_PAGE_SIZE),
  /** Curseur vers la page suivante (ISO end_time du dernier item) ou null. */
  nextCursor: z.string().datetime().nullable(),
  /** Total estimé, renvoyé par Supabase via count: 'exact'. */
  totalCount: z.number().int().nonnegative(),
});
export type HistoryPage = z.infer<typeof historyPageSchema>;
