/**
 * 🛡️ API ROUTE SÉCURISÉE : Activité Admin 
 * 
 * Récupère l'activité récente des admins sans exposer getUserById côté client
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 🔒 2. Vérification permissions admin
    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .in('role', ['admin', 'super_admin']) // Seuls admin+ peuvent voir l'activité
      .single()
    
    if (roleError || !adminRole) {
      return NextResponse.json({ error: 'Permissions admin requises' }, { status: 403 })
    }

    // 🔒 3. Récupération optimisée de l'activité avec fallback
    let recentActivity = null
    let activityError = null
    
    // Essayer d'abord la dernière heure
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data: hourActivity, error: hourError } = await supabase
      .from('admin_logs')
      .select(`
        id,
        action,
        target_type,
        created_at,
        details,
        admin_id
      `)
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(5)

    if (hourError) {
      activityError = hourError
    } else if (hourActivity && hourActivity.length > 0) {
      recentActivity = hourActivity
    } else {
      // Fallback: récupérer les 24 dernières heures si aucune activité dans l'heure
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: dayActivity, error: dayError } = await supabase
        .from('admin_logs')
        .select(`
          id,
          action,
          target_type,
          created_at,
          details,
          admin_id
        `)
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(3) // Encore moins si on va chercher plus loin
        
      recentActivity = dayActivity || []
      activityError = dayError
    }

    if (activityError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[ADMIN ACTIVITY] Erreur:', activityError);
      }
      return NextResponse.json({ error: 'Erreur récupération activité' }, { status: 500 })
    }

    // 🔒 4. Enrichir avec les emails admin de manière sécurisée
    // Utiliser une requête sur user_roles au lieu de getUserById
    const adminIds = [...new Set(recentActivity?.map(log => log.admin_id) || [])]
    
    const { data: adminUsers, error: usersError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role
      `)
      .in('user_id', adminIds)
      .eq('is_active', true)

    if (usersError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[ADMIN ACTIVITY] Erreur récupération utilisateurs:', usersError);
      }
    }

    // Créer un mapping sécurisé (sans exposer les emails complets)
    const adminMap = new Map()
    adminUsers?.forEach(admin => {
      // Masquer partiellement l'email pour la sécurité
      adminMap.set(admin.user_id, {
        role: admin.role,
        email_masked: `admin_${admin.user_id.slice(0, 8)}...` // Email masqué
      })
    })

    // 🔒 5. Enrichir l'activité avec les infos sécurisées
    const enrichedActivity = recentActivity?.map(log => ({
      id: log.id,
      action: log.action,
      target_type: log.target_type,
      created_at: log.created_at,
      details: log.details,
      admin_info: adminMap.get(log.admin_id) || { 
        role: 'unknown', 
        email_masked: 'admin_supprimé' 
      }
    })) || []

    // 📊 6. Log de l'accès
    await supabase.from('admin_logs').insert({
      admin_id: session.user.id,
      action: 'view_admin_activity',
      target_type: 'admin_api',
      details: {
        endpoint: '/api/admin/activity',
        role: adminRole.role,
        records_returned: enrichedActivity.length,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      activity: enrichedActivity,
      total: enrichedActivity.length
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API ADMIN ACTIVITY] Erreur:', error);
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}