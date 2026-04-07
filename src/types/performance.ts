/**
 * Types pour les performances - Instances d'exécution d'exercices
 * Séparés des exercices pour clarté conceptuelle
 */

/**
 * Interface principale Performance - Instance d'exécution
 */
export interface Performance {
 id?: number;
 exercise_id: number;
 workout_id?: number; // Optionnel si log hors séance
 user_id: string;
 performed_at: Date;
 
 // Métriques selon le type d'exercice
 metrics: StrengthMetrics | CardioMetrics;
 notes?: string;
 
 // Métadonnées
 created_at?: Date;
 updated_at?: Date;
}

/**
 * Métriques musculation - Poids, répétitions, séries
 */
export interface StrengthMetrics {
 weight: number; // kg
 reps: number; // répétitions
 sets: number; // séries
 rest_seconds?: number; // temps de repos entre séries
 rpe?: number; // Rate of Perceived Exertion (1-10)
}

/**
 * Métriques cardio - Base + spécialisations par équipement
 */
export interface CardioMetrics {
 duration_seconds: number;
 distance?: number;
 distance_unit:'km' |'m' |'miles';
 heart_rate?: number; // BPM
 calories?: number;
 
 // Spécialisations par équipement
 rowing?: RowingMetrics;
 running?: RunningMetrics;
 cycling?: CyclingMetrics;
}

/**
 * Métriques spécialisées Rameur
 */
export interface RowingMetrics {
 stroke_rate?: number; // SPM (strokes per minute)
 watts?: number; // Puissance
 split_time?: string; // Temps au 500m (format"2:05.4")
}

/**
 * Métriques spécialisées Course/Tapis
 */
export interface RunningMetrics {
 pace?: number; // min/km
 speed?: number; // km/h
 incline?: number; // % inclinaison
 elevation_gain?: number; // mètres (course extérieure)
}

/**
 * Métriques spécialisées Vélo
 */
export interface CyclingMetrics {
 cadence?: number; // RPM
 resistance?: number; // Niveau 1-20
 average_speed?: number; // km/h
 max_speed?: number; // km/h
}

/**
 * Union type pour toutes les métriques
 */
export type ExerciseMetrics = StrengthMetrics | CardioMetrics;

/**
 * Données pour création de performance (formulaire)
 */
export interface PerformanceCreationData {
 exercise_id: number;
 workout_id?: number;
 metrics: ExerciseMetrics;
 notes?: string;
 performed_at?: Date; // Default: now
}

/**
 * Données pour modification de performance
 */
export interface PerformanceUpdateData {
 metrics?: ExerciseMetrics;
 notes?: string;
 performed_at?: Date;
}

/**
 * Statistiques de progression pour un exercice
 */
export interface ProgressionStats {
 exercise_id: number;
 total_sessions: number;
 best_performance: Performance;
 recent_trend:'improving' |'stable' |'declining';
 personal_records: PersonalRecord[];
}

/**
 * Record personnel pour un exercice
 */
export interface PersonalRecord {
 type:'max_weight' |'max_reps' |'best_time' |'longest_distance';
 value: number;
 unit: string;
 achieved_at: Date;
 performance_id: number;
}
