import { createServerClient } from '@/lib/supabase';

import {
  workoutDetailSchema,
  type PerformanceLogEntry,
  type WorkoutDetail,
  type WorkoutExerciseGroup,
} from './schema';

/**
 * Retourne le détail d'une séance de l'utilisateur courant, ou `null` si :
 *   - la séance n'existe pas
 *   - elle appartient à un autre user (RLS rejette, `.eq('user_id')` en plus)
 *   - la validation défensive échoue
 *
 * Stratégie : 2 queries parallèles (metadata workout + logs + exercise names
 * via embed), puis groupement par `exercise_id` côté Node pour garder un SQL
 * simple et lisible.
 */
export async function getWorkoutDetail(
  userId: string,
  workoutId: number,
): Promise<WorkoutDetail | null> {
  const supabase = await createServerClient();

  const [workoutRes, logsRes] = await Promise.all([
    supabase
      .from('workouts')
      .select(
        'id, name, type, status, scheduled_date, start_time, end_time, duration, notes, created_at',
      )
      .eq('id', workoutId)
      .eq('user_id', userId)
      .maybeSingle(),

    supabase
      .from('performance_logs')
      .select(
        `id, exercise_id, set_number, reps, sets, weight, rpe, rest_seconds, notes,
         distance, distance_unit, duration, heart_rate, heart_rate_avg, heart_rate_max,
         watts, stroke_rate, cadence, resistance, incline, performed_at,
         exercise:exercises(id, name)`,
      )
      .eq('workout_id', workoutId)
      .eq('user_id', userId)
      .order('performed_at', { ascending: true })
      .order('set_number', { ascending: true, nullsFirst: true }),
  ]);

  if (workoutRes.error) {
    console.error('[workouts] query failed:', workoutRes.error.message);
    return null;
  }
  if (!workoutRes.data) return null;

  if (logsRes.error) {
    console.error('[workouts] logs query failed:', logsRes.error.message);
    // On continue avec logs vides plutôt que d'échouer complètement.
  }

  // --- Groupement par exercice ---
  const groupsMap = new Map<number, WorkoutExerciseGroup>();

  for (const row of logsRes.data ?? []) {
    // Supabase renvoie `exercise` comme objet OU tableau selon la version du
    // client — on normalise.
    const exerciseRel = row.exercise as
      | { id: number; name: string }
      | { id: number; name: string }[]
      | null;
    const exercise = Array.isArray(exerciseRel) ? exerciseRel[0] : exerciseRel;

    const exerciseId = exercise?.id ?? row.exercise_id;
    if (exerciseId == null) continue;

    const exerciseName = exercise?.name ?? 'Exercise';

    const entry: PerformanceLogEntry = {
      id: row.id,
      setNumber: row.set_number,
      reps: row.reps,
      sets: row.sets,
      weightKg: row.weight,
      rpe: row.rpe,
      restSeconds: row.rest_seconds,
      notes: row.notes,
      distance: row.distance,
      distanceUnit: row.distance_unit,
      durationSeconds: row.duration,
      heartRate: row.heart_rate,
      heartRateAvg: row.heart_rate_avg,
      heartRateMax: row.heart_rate_max,
      watts: row.watts,
      strokeRate: row.stroke_rate,
      cadence: row.cadence,
      resistance: row.resistance,
      incline: row.incline,
      performedAt: row.performed_at,
    };

    const group = groupsMap.get(exerciseId);
    if (group) {
      group.logs.push(entry);
    } else {
      groupsMap.set(exerciseId, {
        exerciseId,
        exerciseName,
        logs: [entry],
      });
    }
  }

  const w = workoutRes.data;
  const parsed = workoutDetailSchema.safeParse({
    id: w.id,
    name: w.name,
    type: w.type,
    status: w.status,
    scheduledDate: w.scheduled_date,
    startTime: w.start_time,
    endTime: w.end_time,
    durationSeconds: w.duration,
    notes: w.notes,
    createdAt: w.created_at,
    exercises: Array.from(groupsMap.values()),
  });

  if (!parsed.success) {
    console.error(
      '[workouts] schema validation failed:',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    );
    return null;
  }

  return parsed.data;
}

export type {
  PerformanceLogEntry,
  WorkoutDetail,
  WorkoutExerciseGroup,
} from './schema';
