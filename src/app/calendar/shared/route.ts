import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhc3BkY2VibHZtcHZkaml4eWl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc1NDc3NiwiZXhwIjoyMDY3MzMwNzc2fQ.K32qBRR6E5gmNFtSNYxaKKH9kcYbF0Wc73ewBwq3QkI'
);

export async function GET() {
  // Supprimer les variables searchParams et userError non utilisées

  // Étape 1 : Récupérer les user_id qui partagent leur planning
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('user_id')
    .eq('share_planning', true);

  const userIds = userSettings?.map((u: unknown) => (u as { user_id: string }).user_id) || [];
  console.log('API /calendar/shared - userIds partageant leur planning:', userIds);

  if (userIds.length === 0) {
    console.log('API /calendar/shared - Aucun userId trouvé avec share_planning = true');
    return NextResponse.json({ workouts: [] });
  }

  // Étape 2 : Récupérer les workouts de ces users avec jointure sur profiles
  const query = supabase
    .from('workouts')
    .select('id, user_id, name, type, status, scheduled_date, start_time, end_time, notes, created_at, updated_at, profiles:profiles(avatar_url, full_name)')
    .in('user_id', userIds)
    .in('status', ['Planifié', 'Réalisé']);

  const { data: workouts, error: workoutError } = await query;
  console.log('API /calendar/shared - workouts récupérés:', workouts);

  if (workoutError) {
    return NextResponse.json({ error: workoutError.message }, { status: 500 });
  }

  return NextResponse.json({ workouts });
} 