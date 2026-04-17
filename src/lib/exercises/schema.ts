import { z } from 'zod';

/**
 * Schémas Zod pour la bibliothèque d'exercices.
 *
 * Validation défensive en sortie Supabase (même pattern que dashboard /
 * history / workouts). Sur dérive de schéma DB on log et on renvoie vide.
 */

export const EXERCISES_PAGE_SIZE = 40;

export const exerciseTypeSchema = z.enum(['all', 'strength', 'cardio']);
export type ExerciseTypeFilter = z.infer<typeof exerciseTypeSchema>;

/**
 * Mapping filtre UI -> valeurs stockées en base.
 * La colonne `exercises.exercise_type` contient 'Musculation' | 'Cardio'.
 */
export const EXERCISE_TYPE_DB_MAP: Record<
  Exclude<ExerciseTypeFilter, 'all'>,
  string
> = {
  strength: 'Musculation',
  cardio: 'Cardio',
};

export const exerciseOwnershipSchema = z.enum(['all', 'mine', 'public']);
export type ExerciseOwnership = z.infer<typeof exerciseOwnershipSchema>;

export const exerciseFiltersSchema = z.object({
  type: exerciseTypeSchema.default('all'),
  muscle: z.string().trim().min(1).max(40).nullable().default(null),
  ownership: exerciseOwnershipSchema.default('all'),
  search: z.string().trim().min(1).max(80).nullable().default(null),
});
export type ExerciseFilters = z.infer<typeof exerciseFiltersSchema>;

export const exerciseItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  muscleGroup: z.string().nullable(),
  exerciseType: z.string().nullable(),
  equipmentId: z.number().nullable(),
  equipmentName: z.string().nullable(),
  difficulty: z.number().int().nullable(),
  imageUrl: z.string().url().nullable(),
  isPublic: z.boolean(),
  isMine: z.boolean(),
});
export type ExerciseItem = z.infer<typeof exerciseItemSchema>;

export const exerciseListSchema = z.object({
  items: z.array(exerciseItemSchema).max(EXERCISES_PAGE_SIZE),
  totalCount: z.number().int().nonnegative(),
  /** Muscles distincts présents dans le résultat (pour alimenter le filtre). */
  availableMuscles: z.array(z.string()),
});
export type ExerciseList = z.infer<typeof exerciseListSchema>;
