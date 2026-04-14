export interface TrainingGoal {
 id: number;
 user_id: string;
 exercise_id: number;
 target_weight?: number | null;
 target_reps?: number | null;
 target_duration?: number | null;
 target_distance?: number | null;
 target_speed?: number | null;
 target_calories?: number | null;
 extra_kg?: number | null;
 extra_duration?: number | null;
 created_at: string;
 exercises?: { name: string};
 status?:'Atteint' |'En cours' |'Non atteint';
 updated_at?: string;
} 