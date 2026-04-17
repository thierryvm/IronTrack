import { z } from 'zod';

/**
 * Schémas Zod pour valider les sorties des queries dashboard.
 *
 * On valide DÉFENSIVEMENT en sortie de Supabase : le type généré reflète le
 * schéma mais pas les règles métier (ex: `status` est `string | null` en base
 * alors qu'on attend 'completed'|'in_progress'|…). Une query qui renvoie des
 * données inattendues doit être loggée, pas faire planter la page.
 */

export const recentWorkoutSchema = z.object({
  id: z.number(),
  name: z.string(),
  endTime: z.string().datetime().nullable(),
  durationSeconds: z.number().int().nonnegative().nullable(),
  type: z.string().nullable(),
});

export const lastPerformanceSchema = z.object({
  exerciseName: z.string(),
  performedAt: z.string().datetime().nullable(),
  weightKg: z.number().nullable(),
  reps: z.number().int().nullable(),
  distanceMeters: z.number().nullable(),
  distanceUnit: z.string().nullable(),
  durationSeconds: z.number().int().nonnegative().nullable(),
});

export const dashboardStatsSchema = z.object({
  streak: z.object({
    current: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
    lastWorkoutDate: z.string().date().nullable(),
  }),
  sevenDaysWorkouts: z.number().int().nonnegative(),
  recentWorkouts: z.array(recentWorkoutSchema).max(5),
  lastPerformance: lastPerformanceSchema.nullable(),
});

export type RecentWorkout = z.infer<typeof recentWorkoutSchema>;
export type LastPerformance = z.infer<typeof lastPerformanceSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
