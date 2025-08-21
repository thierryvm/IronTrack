import { NextResponse } from 'next/server'

export const runtime = "nodejs"

interface AdminStats {
  open_tickets: number
  in_progress_tickets: number
  tickets_24h: number
  tickets_7d: number
  feedback_tickets: number
  new_users_24h: number
  new_users_7d: number
  admin_users: number
  workouts_24h: number
  workouts_7d: number
}

export async function GET() {
  try {
    console.log('[ADMIN STATS] API simplifiée appelée')
    
    // Stats de démonstration pour diagnostiquer le problème
    const stats: AdminStats = {
      open_tickets: 2,
      in_progress_tickets: 1,
      tickets_24h: 0,
      tickets_7d: 3,
      feedback_tickets: 1,
      new_users_24h: 0,
      new_users_7d: 1,
      admin_users: 1,
      workouts_24h: 0,
      workouts_7d: 2
    }
    
    console.log('[ADMIN STATS] Retour des stats:', stats)
    return NextResponse.json(stats)

  } catch (error) {
    console.error('[API ADMIN STATS] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}