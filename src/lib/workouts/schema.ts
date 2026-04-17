import { z } from 'zod';

/**
 * Schémas Zod pour la page de détail d'une séance.
 *
 * Comme pour dashboard / history : validation DÉFENSIVE en sortie de Supabase.
 * Si la forme du retour dérive, on log et on retombe sur `null` plutôt que de
 * faire planter la page.
 */

/**
 * Une ligne `performance_logs` telle qu'on la sert au composant de détail.
 * Les champs cardio avancés sont optionnels — ils n'existent que pour certains
 * types d'exercice.
 */
export const performanceLogEntrySchema = z.object({
  id: z.number(),
  setNumber: z.number().int().nullable(),
  reps: z.number().int().nullable(),
  sets: z.number().int().nullable(),
  weightKg: z.number().nullable(),
  rpe: z.number().nullable(),
  restSeconds: z.number().int().nullable(),
  notes: z.string().nullable(),

  // Cardio avancé
  distance: z.number().nullable(),
  distanceUnit: z.string().nullable(),
  durationSeconds: z.number().int().nullable(),
  heartRate: z.number().int().nullable(),
  heartRateAvg: z.number().int().nullable(),
  heartRateMax: z.number().int().nullable(),
  watts: z.number().nullable(),
  strokeRate: z.number().int().nullable(),
  cadence: z.number().int().nullable(),
  resistance: z.number().nullable(),
  incline: z.number().nullable(),

  performedAt: z.string().nullable(),
});
export type PerformanceLogEntry = z.infer<typeof performanceLogEntrySchema>;

/**
 * Un exercice d'une séance, avec TOUS ses logs groupés.
 */
export const workoutExerciseGroupSchema = z.object({
  exerciseId: z.number(),
  exerciseName: z.string(),
  logs: z.array(performanceLogEntrySchema),
});
export type WorkoutExerciseGroup = z.infer<typeof workoutExerciseGroupSchema>;

/**
 * Détail complet d'une séance (métadonnées + exercices + logs).
 */
export const workoutDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().nullable(),
  status: z.string().nullable(),
  scheduledDate: z.string().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  durationSeconds: z.number().int().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  exercises: z.array(workoutExerciseGroupSchema),
});
export type WorkoutDetail = z.infer<typeof workoutDetailSchema>;
