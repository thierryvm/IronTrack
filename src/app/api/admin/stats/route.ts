/**
 * 🛡️ API ROUTE SÉCURISÉE : Statistiques Admin
 * Auth vérifiée via createServerClient + vérification rôle profiles.role
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string) {
            cookieStore.set({ name, value: '', maxAge: 0 })
          },
        },
      }
    )

    // 🔒 1. Vérification authentification
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 🔒 2. Vérification rôle admin via profiles.role
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', user.id)
      .single()

    if (profileError || !adminProfile) {
      return NextResponse.json({ error: 'Profil utilisateur introuvable' }, { status: 403 })
    }

    const adminRoles = ['moderator', 'admin', 'super_admin']
    if (!adminProfile.role || !adminRoles.includes(adminProfile.role)) {
      return NextResponse.json({ error: 'Permissions administrateur insuffisantes' }, { status: 403 })
    }

    if (adminProfile.is_banned) {
      return NextResponse.json({ error: 'Compte administrateur suspendu' }, { status: 403 })
    }

    // ✅ Utilisateur authentifié et admin confirmé
    // Récupérer les vraies statistiques depuis Supabase
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Tickets ouverts
    const [
      openTickets,
      inProgressTickets,
      tickets24h,
      tickets7d,
      feedbackTickets,
      newUsers24h,
      newUsers7d,
      adminUsers,
      workouts24h,
      workouts7d,
    ] = await Promise.all([
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).gte('created_at', yesterday),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('category', 'feedback'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', yesterday),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', adminRoles),
      supabase.from('workouts').select('id', { count: 'exact', head: true }).gte('created_at', yesterday),
      supabase.from('workouts').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    ])

    const stats: AdminStats = {
      open_tickets: openTickets.count ?? 0,
      in_progress_tickets: inProgressTickets.count ?? 0,
      tickets_24h: tickets24h.count ?? 0,
      tickets_7d: tickets7d.count ?? 0,
      feedback_tickets: feedbackTickets.count ?? 0,
      new_users_24h: newUsers24h.count ?? 0,
      new_users_7d: newUsers7d.count ?? 0,
      admin_users: adminUsers.count ?? 0,
      workouts_24h: workouts24h.count ?? 0,
      workouts_7d: workouts7d.count ?? 0,
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('[API ADMIN STATS] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}