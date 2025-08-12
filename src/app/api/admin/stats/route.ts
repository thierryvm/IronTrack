/**
 * 🛡️ API ROUTE SÉCURISÉE : Statistiques Admin
 * 
 * Cette API remplace les appels admin côté client pour éviter
 * l'exposition du service key Supabase
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
  if (process.env.NODE_ENV === 'development') {}
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
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

    // 🔒 2. Vérification rôle admin
    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role, is_active, expires_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('role', ['moderator', 'admin', 'super_admin'])
      .single()
    
    if (roleError || !adminRole) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Vérifier expiration du rôle
    if (adminRole.expires_at && new Date(adminRole.expires_at) <= new Date()) {
      return NextResponse.json({ error: 'Rôle admin expiré' }, { status: 403 })
    }

    // 🔒 3. Récupération sécurisée des statistiques
    const stats: AdminStats = await getAdminStatsSecure(supabase)

    // 📊 4. Log de l'accès
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'view_admin_stats',
      target_type: 'admin_api',
      details: {
        endpoint: '/api/admin/stats',
        role: adminRole.role,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json(stats)

  } catch (error) {
    console.error('[API ADMIN STATS] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * 🔒 Fonction sécurisée pour récupérer les stats admin
 * Remplace les appels admin côté client
 */
// Interfaces pour typer les réponses Supabase
interface SupportTicket {
  id: string
  status: string
  category: string
  created_at: string
}

interface UserRole {
  user_id: string
  role: string
  created_at: string
  granted_at?: string
}

interface WorkoutExercise {
  id: string
  created_at: string
}

async function getAdminStatsSecure(supabase: SupabaseClient): Promise<AdminStats> {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  try {
    // 🛡️ SÉCURITÉ: Utiliser la fonction RPC sécurisée (remplace vue vulnérable)
    const { data: dashboardStats, error: statsError } = await supabase
      .rpc('get_admin_dashboard_stats')

    if (statsError) {
      console.error('[ADMIN STATS] Erreur RPC sécurisée:', statsError)
      // Fallback vers calcul manuel si RPC échoue
    } else if (dashboardStats && Array.isArray(dashboardStats) && dashboardStats.length > 0) {
      const stats = dashboardStats[0] // RPC retourne un array, prendre le premier élément
      
      // Mapper vers le format AdminStats attendu
      return {
        open_tickets: Number(stats.open_tickets || 0),
        in_progress_tickets: Number(stats.in_progress_tickets || 0),
        tickets_24h: Number(stats.tickets_24h || 0),
        tickets_7d: Number(stats.tickets_7d || 0),
        feedback_tickets: Number(stats.feedback_tickets || 0),
        new_users_24h: Number(stats.new_users_24h || 0),
        new_users_7d: Number(stats.new_users_7d || 0),
        admin_users: Number(stats.admin_users || 0),
        workouts_24h: Number(stats.workouts_24h || 0),
        workouts_7d: Number(stats.workouts_7d || 0)
      }
    }

    // Fallback : calcul manuel avec requêtes RLS protégées
    const [tickets, users, workouts] = await Promise.all([
      // Tickets stats
      supabase
        .from('support_tickets')
        .select('id, status, category, created_at')
        .order('created_at', { ascending: false }),
      
      // Users stats (via user_roles pour respecter RLS)
      supabase
        .from('user_roles')
        .select('user_id, role, created_at, granted_at'),
      
      // Workouts stats (estimation)
      supabase
        .from('workout_exercises')
        .select('id, created_at')
        .gte('created_at', weekAgo.toISOString())
    ])

    const ticketsData = tickets.data || []
    const usersData = users.data || []
    const workoutsData = workouts.data || []

    const typedTickets = ticketsData as SupportTicket[]
    const typedUsers = usersData as UserRole[]
    const typedWorkouts = workoutsData as WorkoutExercise[]

    return {
      open_tickets: typedTickets.filter(t => t.status === 'open').length,
      in_progress_tickets: typedTickets.filter(t => t.status === 'in_progress').length,
      tickets_24h: typedTickets.filter(t => new Date(t.created_at) >= yesterday).length,
      tickets_7d: typedTickets.filter(t => new Date(t.created_at) >= weekAgo).length,
      feedback_tickets: typedTickets.filter(t => t.category === 'feedback' && !['closed', 'resolved'].includes(t.status)).length,
      new_users_24h: typedUsers.filter(u => new Date(u.granted_at || u.created_at) >= yesterday).length,
      new_users_7d: typedUsers.filter(u => new Date(u.granted_at || u.created_at) >= weekAgo).length,
      admin_users: typedUsers.filter(u => ['admin', 'super_admin', 'moderator'].includes(u.role)).length,
      workouts_24h: typedWorkouts.filter(w => new Date(w.created_at) >= yesterday).length,
      workouts_7d: typedWorkouts.length
    }

  } catch (error) {
    console.error('[ADMIN STATS] Erreur récupération:', error)
    
    // Retour par défaut en cas d'erreur
    return {
      open_tickets: 0,
      in_progress_tickets: 0,
      tickets_24h: 0,
      tickets_7d: 0,
      feedback_tickets: 0,
      new_users_24h: 0,
      new_users_7d: 0,
      admin_users: 0,
      workouts_24h: 0,
      workouts_7d: 0
    }
  }
}