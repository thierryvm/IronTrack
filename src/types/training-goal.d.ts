export interface TrainingGoal {
  id: number;
  user_id: string;
  exercise_id: number;
  target_weight?: number | null;
  target_reps?: number | null;
  created_at: string;
  exercises?: { name: string };
  status?: 'Atteint' | 'En cours' | 'Non atteint';
  updated_at?: string;
} 