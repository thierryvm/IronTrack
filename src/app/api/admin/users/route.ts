/**
 * 🛡️ API ROUTE SÉCURISÉE : Gestion des Utilisateurs Admin
 * 
 * Cette API remplace les appels RPC côté client pour éviter
 * les problèmes d'authentification avec get_all_users_admin()
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// ULTRAHARDCORE: Force Node.js runtime pour éviter Edge Runtime
export const runtime = "nodejs"

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  pseudo: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
  is_banned: boolean
  workout_count: number
  badge_count: number
}

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API LOG] /api/admin/users - appelé à`, new Date().toISOString());
  }
  
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

    // 🔒 2. Vérification rôle admin via profiles.role
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_banned, banned_until')
      .eq('id', user.id)
      .single()
    
    if (profileError || !adminProfile) {
      return NextResponse.json({ error: 'Profil utilisateur introuvable' }, { status: 403 })
    }

    const adminRoles = ['moderator', 'admin', 'super_admin']
    if (!adminProfile.role || !adminRoles.includes(adminProfile.role)) {
      return NextResponse.json({ error: 'Permissions administrateur insuffisantes' }, { status: 403 })
    }

    // Vérifier si l'admin est vraiment banni (banned_until > maintenant)
    const now = new Date()
    const bannedUntil = adminProfile.banned_until ? new Date(adminProfile.banned_until) : null
    const isReallyBanned = bannedUntil ? bannedUntil > now : adminProfile.is_banned
    
    if (isReallyBanned) {
      return NextResponse.json({ error: 'Compte administrateur suspendu' }, { status: 403 })
    }

    // 🔒 3. Récupération sécurisée des utilisateurs
    // DÉSACTIVATION TEMPORAIRE RPC pour debug statut ban
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API ADMIN USERS] Utilisation fallback manuel forcé (debug mode)`);
    }

    // Fallback : récupération manuelle avec calculs
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        pseudo,
        avatar_url,
        role,
        created_at,
        updated_at,
        banned_until,
        ban_reason,
        is_banned,
        last_active,
        is_onboarding_complete
      `)
      .order('created_at', { ascending: false })

    if (profilesError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[API ADMIN USERS] Erreur récupération profiles:', profilesError);
      }
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 })
    }

    // DEBUG temporaire désactivé

    // Enrichir avec les statistiques
    const enrichedUsers: AdminUser[] = await Promise.all(
      (profilesData || []).map(async (profile) => {
        let workoutCount = 0
        let badgeCount = 0
        
        try {
          // Compter les workouts
          const workoutResult = await supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
          
          workoutCount = workoutResult.count || 0
          
          if (workoutResult.error && process.env.NODE_ENV === 'development') {
            console.warn(`[API ADMIN USERS] Erreur comptage workouts:`, workoutResult.error.message)
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[API ADMIN USERS] Erreur workouts:`, (error as Error).message)
          }
        }

        try {
          // Compter les badges
          const badgeResult = await supabase
            .from('user_badges')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
          
          badgeCount = badgeResult.count || 0
          
          if (badgeResult.error && process.env.NODE_ENV === 'development') {
            console.warn(`[API ADMIN USERS] Erreur comptage badges:`, badgeResult.error.message)
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[API ADMIN USERS] Erreur badges:`, (error as Error).message)
          }
        }

        // Calculer is_banned en fonction de banned_until ET is_banned
        const now = new Date()
        const bannedUntil = profile.banned_until ? new Date(profile.banned_until) : null
        const is_banned = bannedUntil ? bannedUntil > now : profile.is_banned

        // Calculer is_active basé sur last_active (actif dans les 30 derniers jours)
        const lastActive = profile.last_active ? new Date(profile.last_active) : null
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const is_active = lastActive ? lastActive > thirtyDaysAgo : false

        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || null,
          pseudo: profile.pseudo || null,
          avatar_url: profile.avatar_url || null,
          role: profile.role || 'user',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          is_banned: is_banned,
          banned_until: profile.banned_until,
          ban_reason: profile.ban_reason,
          is_active: is_active,
          last_active: profile.last_active,
          is_onboarding_complete: profile.is_onboarding_complete !== false,
          workout_count: workoutCount,
          badge_count: badgeCount
        }
      })
    )

    // 📊 4. Log de l'accès
    try {
      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        action: 'view_users_admin_fallback',
        target_type: 'admin_api',
        details: {
          endpoint: '/api/admin/users',
          role: adminProfile.role,
          users_count: enrichedUsers.length,
          method: 'manual_fallback',
          timestamp: new Date().toISOString()
        }
      })
    } catch (logError) {
      console.warn('[API ADMIN USERS] Erreur logging admin:', logError)
    }

    // DEBUG temporaire désactivé

    return NextResponse.json({ users: enrichedUsers })

  } catch (error) {
    console.error('[API ADMIN USERS] Erreur générale:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}