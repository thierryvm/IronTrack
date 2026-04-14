/**
 * Types pour les exercices - Propriétés intrinsèques uniquement
 * Séparation claire avec les performances (instances)
 */

export type ExerciseType ='Musculation' |'Cardio';
// Type pour l'affichage (string)
export type DifficultyLevel ='Débutant' |'Intermédiaire' |'Avancé' |'Expert' |'Élite';

// Type pour la base de données (integer)
export type DifficultyValue = 1 | 2 | 3 | 4 | 5;

// Mapping entre valeurs numériques et libelés
export const DIFFICULTY_MAPPING: Record<DifficultyValue, DifficultyLevel> = {
 1:'Débutant',
 2:'Intermédiaire', 
 3:'Avancé',
 4:'Expert',
 5:'Élite'
};

// Mapping inverse
export const DIFFICULTY_VALUE_MAPPING: Record<DifficultyLevel, DifficultyValue> = {
'Débutant': 1,
'Intermédiaire': 2,
'Avancé': 3,
'Expert': 4,
'Élite': 5
};

/**
 * Interface principale Exercice - Propriétés qui ne changent jamais
 */
export interface Exercise {
 id?: number;
 name: string;
 exercise_type: ExerciseType;
 muscle_group: string; // Nom du groupe musculaire
 muscle_group_id?: number; // ID référence dans muscle_groups
 equipment: string;
 equipment_id?: number; // ID référence dans equipment
 difficulty: DifficultyValue; // Valeur numérique en base
 instructions?: string;
 image_url?: string;
 
 // Métadonnées
 is_template: boolean; // true = template public, false = exercice personnel
 user_id?: string; // UUID utilisateur pour exercices personnels
 is_public?: boolean; // Visibilité publique
 created_at?: Date;
 updated_at?: Date;
}

/**
 * Données minimales pour création d'exercice (formulaire)
 */
export interface ExerciseCreationData {
 name: string;
 exercise_type: ExerciseType;
 muscle_group: string;
 equipment: string;
 difficulty?: DifficultyLevel;
 instructions?: string;
}

/**
 * Données pour modification d'exercice (propriétés uniquement)
 */
export interface ExerciseUpdateData {
 name?: string;
 muscle_group?: string;
 equipment?: string;
 difficulty?: DifficultyLevel;
 instructions?: string;
 image_url?: string;
}

/**
 * Résultat de détection de doublons
 */
export interface DuplicateResult {
 exercise: Exercise;
 similarity: number;
 factors: {
 name: number;
 muscle_group: number;
 equipment: number;
};
}

/**
 * Actions de résolution de doublons
 */
export type DuplicateAction ='use-existing' |'rename-new' |'create-anyway';

export interface DuplicateResolution {
 action: DuplicateAction;
 selected_exercise?: Exercise;
 new_name?: string;
}