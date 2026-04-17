import { createServerClient } from '@/lib/supabase';

import {
  dashboardStatsSchema,
  type DashboardStats,
  type LastPerformance,
  type RecentWorkout,
} from './schema';

/**
 * Statuts "séance terminée" côté legacy IronTrack v1 (contrainte CHECK sur la
 * colonne `workouts.status`). On garde les deux valeurs pour rester rétro-compat.
 * Toute normalisation future (vers 'completed') se fera via migration.
 */
const COMPLETED_STATUSES = ['Terminé', 'Réalisé'] as const;

/**
 * Stats affichées sur le dashboard v2.
 *
 * Toutes les queries sont faites via `createServerClient` (cookies utilisateur) :
 * les RLS Supabase garantissent qu'un user ne voit que ses propres données.
 *
 * Pas de service_role, pas de tenant leaking possible.
 *
 * En cas d'erreur Supabase, on retombe sur des valeurs vides plutôt que de
 * faire planter la page — le dashboard doit rester robuste.
 */
export async function getDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const supabase = await createServerClient();

  const sevenDaysAgoISO = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // 4 queries en parallèle — 1 round-trip réseau effectif côté Postgres.
  // Chacune est filtrée par `user_id` redondamment avec la RLS (defense in depth).
  const [streakRes, sevenDaysRes, recentRes, lastPerfRes] = await Promise.all([
    supabase
      .from('workout_streaks')
      .select('streak, max_streak, last_workout_date')
      .eq('user_id', userId)
      .maybeSingle(),

    supabase
      .from('workouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', COMPLETED_STATUSES)
      .gte('end_time', sevenDaysAgoISO),

    supabase
      .from('workouts')
      .select('id, name, end_time, duration, type, status')
      .eq('user_id', userId)
      .in('status', COMPLETED_STATUSES)
      .not('end_time', 'is', null)
      .order('end_time', { ascending: false })
      .limit(5),

    supabase
      .from('performance_logs')
      .select(
        'performed_at, weight, reps, distance, distance_unit, duration, exercise:exercises(name)',
      )
      .eq('user_id', userId)
      .not('performed_at', 'is', null)
      .order('performed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // --- Streak ---
  const streak = {
    current: streakRes.data?.streak ?? 0,
    max: streakRes.data?.max_streak ?? 0,
    lastWorkoutDate: streakRes.data?.last_workout_date ?? null,
  };
  if (streakRes.error) {
    console.error('[dashboard] streak query failed:', streakRes.error.message);
  }

  // --- 7 days count ---
  const sevenDaysWorkouts = sevenDaysRes.count ?? 0;
  if (sevenDaysRes.error) {
    console.error(
      '[dashboard] sevenDays query failed:',
      sevenDaysRes.error.message,
    );
  }

  // --- Recent workouts ---
  const recentWorkouts: RecentWorkout[] = (recentRes.data ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    endTime: w.end_time,
    durationSeconds: w.duration,
    type: w.type,
  }));
  if (recentRes.error) {
    console.error('[dashboard] recent query failed:', recentRes.error.message);
  }

  // --- Last performance ---
  let lastPerformance: LastPerformance | null = null;
  if (lastPerfRes.data) {
    const exerciseRel = lastPerfRes.data.exercise as
      | { name: string }
      | { name: string }[]
      | null;
    const exerciseName = Array.isArray(exerciseRel)
      ? (exerciseRel[0]?.name ?? 'Exercise')
      : (exerciseRel?.name ?? 'Exercise');

    lastPerformance = {
      exerciseName,
      performedAt: lastPerfRes.data.performed_at,
      weightKg: lastPerfRes.data.weight,
      reps: lastPerfRes.data.reps,
      distanceMeters: lastPerfRes.data.distance,
      distanceUnit: lastPerfRes.data.distance_unit,
      durationSeconds: lastPerfRes.data.duration,
    };
  }
  if (lastPerfRes.error) {
    console.error(
      '[dashboard] lastPerf query failed:',
      lastPerfRes.error.message,
    );
  }

  // Validation défensive : si la forme est inattendue on log et on renvoie vide.
  const parsed = dashboardStatsSchema.safeParse({
    streak,
    sevenDaysWorkouts,
    recentWorkouts,
    lastPerformance,
  });

  if (!parsed.success) {
    console.error(
      '[dashboard] schema validation failed:',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    );
    return {
      streak: { current: 0, max: 0, lastWorkoutDate: null },
      sevenDaysWorkouts: 0,
      recentWorkouts: [],
      lastPerformance: null,
    };
  }

  return parsed.data;
}

export type { DashboardStats, RecentWorkout, LastPerformance } from './schema';
