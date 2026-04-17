import { createServerClient } from '@/lib/supabase';

import {
  EXERCISES_PAGE_SIZE,
  EXERCISE_TYPE_DB_MAP,
  exerciseListSchema,
  type ExerciseFilters,
  type ExerciseItem,
  type ExerciseList,
} from './schema';

/**
 * Retourne la bibliothèque d'exercices visible pour l'utilisateur courant :
 * ses exercices privés + les exercices publics.
 *
 * - RLS Supabase : un user ne voit JAMAIS les exercices privés d'un autre user.
 * - `.or('user_id.eq.X,is_public.eq.true')` en defense-in-depth.
 * - Pas de pagination cursor pour le moment : la bibliothèque reste petite
 *   (< quelques centaines de lignes). On tronque à EXERCISES_PAGE_SIZE et on
 *   invite à affiner les filtres si besoin.
 */
export async function getExercises(
  userId: string,
  filters: ExerciseFilters,
): Promise<ExerciseList> {
  const supabase = await createServerClient();

  let query = supabase
    .from('exercises')
    .select(
      'id, name, muscle_group, exercise_type, equipment_id, difficulty, image_url, is_public, user_id, equipment:equipment(name)',
      { count: 'exact' },
    )
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('name', { ascending: true })
    .limit(EXERCISES_PAGE_SIZE);

  if (filters.type !== 'all') {
    query = query.eq('exercise_type', EXERCISE_TYPE_DB_MAP[filters.type]);
  }
  if (filters.muscle) {
    query = query.eq('muscle_group', filters.muscle);
  }
  if (filters.ownership === 'mine') {
    query = query.eq('user_id', userId);
  } else if (filters.ownership === 'public') {
    query = query.eq('is_public', true);
  }
  if (filters.search) {
    // `ilike` pour une recherche insensible à la casse ; échappement des
    // wildcards pour éviter les LIKE injection.
    const escaped = filters.search.replace(/[%_\\]/g, (c) => `\\${c}`);
    query = query.ilike('name', `%${escaped}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[exercises] query failed:', error.message);
    return { items: [], totalCount: 0, availableMuscles: [] };
  }

  const items: ExerciseItem[] = (data ?? []).map((row) => {
    const equipmentRel = row.equipment as
      | { name: string }
      | { name: string }[]
      | null;
    const equipmentName = Array.isArray(equipmentRel)
      ? (equipmentRel[0]?.name ?? null)
      : (equipmentRel?.name ?? null);

    return {
      id: row.id,
      name: row.name,
      muscleGroup: row.muscle_group,
      exerciseType: row.exercise_type,
      equipmentId: row.equipment_id,
      equipmentName,
      difficulty: row.difficulty,
      imageUrl: row.image_url,
      isPublic: row.is_public ?? false,
      isMine: row.user_id === userId,
    };
  });

  const availableMuscles = Array.from(
    new Set(
      items
        .map((it) => it.muscleGroup)
        .filter((m): m is string => Boolean(m && m.trim())),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const parsed = exerciseListSchema.safeParse({
    items,
    totalCount: count ?? items.length,
    availableMuscles,
  });

  if (!parsed.success) {
    console.error(
      '[exercises] schema validation failed:',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    );
    return { items: [], totalCount: 0, availableMuscles: [] };
  }

  return parsed.data;
}

export type {
  ExerciseFilters,
  ExerciseItem,
  ExerciseList,
  ExerciseOwnership,
  ExerciseTypeFilter,
} from './schema';
export {
  EXERCISES_PAGE_SIZE,
  exerciseFiltersSchema,
  exerciseOwnershipSchema,
  exerciseTypeSchema,
} from './schema';
