/**
 * 🛡️ API ROUTE SÉCURISÉE : Logs Système Admin
 * 
 * Cette API permet de récupérer les logs d'administration de manière sécurisée
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// ULTRAHARDCORE: Force Node.js runtime pour éviter Edge Runtime
export const runtime = "nodejs"

interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin_email: string
  admin_full_name: string | null
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'development') {}
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100 par page
    const action = searchParams.get('action')
    const target_type = searchParams.get('target_type')
    const admin_id = searchParams.get('admin_id')
    const date_range = searchParams.get('date_range') || '24h'
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    // Calcul de la date de début selon le filtre date_range
    const dateRangeMap: Record<string, number> = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 }
    const hoursBack = dateRangeMap[date_range] ?? 24
    const startDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
    
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
    
    if (sessionError ||!user) {
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

    // Seuls les admins et super_admins peuvent voir les logs
    const allowedRoles = ['admin', 'super_admin']
    if (!adminProfile.role || !allowedRoles.includes(adminProfile.role)) {
      return NextResponse.json({ error: 'Permissions administrateur insuffisantes - accès logs restreint' }, { status: 403 })
    }

    if (adminProfile.is_banned) {
      return NextResponse.json({ error: 'Compte administrateur suspendu' }, { status: 403 })
    }

    // 🔒 3. Construction de la requête avec filtres
    let query = supabase
      .from('admin_logs')
      .select(`
        id,
        admin_id,
        action,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent,
        created_at
      `, { count: 'exact' })
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Appliquer les filtres
    if (action) {
      query = query.eq('action', action)
    }
    if (target_type) {
      query = query.eq('target_type', target_type)
    }
    if (admin_id) {
      query = query.eq('admin_id', admin_id)
    }
    if (search) {
      query = query.ilike('action', `%${search}%`)
    }

    const { data: logsData, error: logsError, count } = await query

    if (logsError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[API ADMIN LOGS] Erreur récupération logs:', logsError);
      }
      return NextResponse.json({ error: 'Erreur lors de la récupération des logs' }, { status: 500 })
    }

    // 4. Enrichir avec les informations admin
    const enrichedLogs: AdminLog[] = await Promise.all(
      (logsData || []).map(async (log) => {
        // Récupérer les infos de l'admin
        let adminInfo = null
        if (log.admin_id) {
          const { data: adminProf } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', log.admin_id)
            .single()
          adminInfo = adminProf
        }

        return {
          id: log.id,
          admin_id: log.admin_id,
          action: log.action,
          target_type: log.target_type,
          target_id: log.target_id,
          details: log.details || {},
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          created_at: log.created_at,
          admin_email: adminInfo?.email || 'Admin inconnu',
          admin_full_name: adminInfo?.full_name
        }
      })
    )

    // 5. Récupérer le nombre total pour la pagination (count inclus dans la requête principale)
    const totalCount = count ?? 0

    // 📊 6. Log de l'accès aux logs
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'view_admin_logs',
      target_type: 'admin_api',
      details: {
        endpoint: '/api/admin/logs',
        role: adminProfile.role,
        page,
        limit,
        filters: { action, target_type, admin_id, date_range, search },
        logs_returned: enrichedLogs.length,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      logs: enrichedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil((totalCount || 0) / limit),
        hasNext: offset + limit < (totalCount || 0),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API ADMIN LOGS] Erreur générale:', error);
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}