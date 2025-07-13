export interface Achievement {
  id: number;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status?: 'En cours' | 'Validé';
  goal_id?: number;
  unlocked_at?: string;
  created_at?: string;
} 