/**
 * Types pour les séances d'entraînement
 * Organisation des exercices en sessions structurées
 */

import type { Exercise} from'./exercise';
import type { Performance} from'./performance';

/**
 * Interface principale Séance
 */
export interface Workout {
 id?: number;
 user_id: string;
 name: string;
 description?: string;
 started_at: Date;
 completed_at?: Date;
 
 // Structure de la séance
 exercises: WorkoutExercise[];
 
 // Statistiques calculées
 total_duration_seconds?: number;
 total_volume_kg?: number; // Pour musculation
 total_calories?: number; // Pour cardio
 
 // Métadonnées
 created_at?: Date;
 updated_at?: Date;
}

/**
 * Exercice dans une séance - Liaison avec performances
 */
export interface WorkoutExercise {
 id?: number;
 workout_id: number;
 exercise_id: number;
 order_in_workout: number; // Position dans la séance
 
 // Référence aux données exercice
 exercise?: Exercise;
 
 // Performances réalisées pour cet exercice dans cette séance
 performances: Performance[];
 
 // Configuration prévue (optionnel)
 planned_sets?: number;
 planned_reps?: number;
 planned_weight?: number;
 planned_duration?: number;
 
 // Notes spécifiques à cet exercice dans cette séance
 notes?: string;
}

/**
 * Template de séance - Modèle réutilisable
 */
export interface WorkoutTemplate {
 id?: number;
 name: string;
 description?: string;
 category:'Push' |'Pull' |'Legs' |'Upper' |'Lower' |'Full Body' |'Cardio' |'Custom';
 difficulty:'Débutant' |'Intermédiaire' |'Avancé';
 estimated_duration_minutes: number;
 
 // Exercices prévus dans le template
 template_exercises: WorkoutTemplateExercise[];
 
 // Métadonnées
 is_public: boolean;
 created_by?: string;
 created_at?: Date;
}

/**
 * Exercice dans un template de séance
 */
export interface WorkoutTemplateExercise {
 id?: number;
 template_id: number;
 exercise_id: number;
 order_in_template: number;
 
 // Configuration suggérée
 suggested_sets: number;
 suggested_reps?: number; // Optionnel pour cardio
 suggested_weight?: number; // Optionnel pour cardio
 suggested_duration?: number; // Optionnel pour musculation
 suggested_rest_seconds?: number;
 
 notes?: string;
}

/**
 * Données pour création de séance
 */
export interface WorkoutCreationData {
 name: string;
 description?: string;
 template_id?: number; // Optionnel si basé sur template
 exercises: {
 exercise_id: number;
 order: number;
 planned_sets?: number;
 planned_reps?: number;
 planned_weight?: number;
}[];
}

/**
 * Statistiques de séance
 */
export interface WorkoutStats {
 workout_id: number;
 total_exercises: number;
 completed_exercises: number;
 total_sets: number;
 completed_sets: number;
 duration_seconds: number;
 estimated_calories: number;
 volume_kg?: number; // Pour musculation
 distance_km?: number; // Pour cardio
}