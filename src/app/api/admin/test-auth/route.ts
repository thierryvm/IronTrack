/**
 * 🛡️ API ROUTE TEST : Vérification de l'authentification Admin
 * 
 * Cette API permet de tester le système d'authentification admin
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  console.log(`[API LOG] /api/admin/test-auth - appelé à`, new Date().toISOString());
  
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
    
    // 🔒 1. Test authentification de base
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    const authResult = {
      hasSession: !!session,
      sessionError: sessionError?.message || null,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      sessionExpires: session?.expires_at || null
    }
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Aucune session utilisateur active',
        auth: authResult,
        profile: null,
        adminStatus: null
      }, { status: 401 })
    }

    // 🔒 2. Test récupération profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    const profileResult = {
      found: !!profile,
      error: profileError?.message || null,
      role: profile?.role || null,
      is_banned: profile?.is_banned || null,
      email: profile?.email || null,
      full_name: profile?.full_name || null
    }

    if (profileError || !profile) {
      return NextResponse.json({
        success: false,
        message: 'Profil utilisateur introuvable',
        auth: authResult,
        profile: profileResult,
        adminStatus: null
      }, { status: 403 })
    }

    // 🔒 3. Test permissions admin
    const adminRoles = ['moderator', 'admin', 'super_admin']
    const isAdmin = profile.role && adminRoles.includes(profile.role)
    const isBanned = profile.is_banned

    const adminStatus = {
      isAdmin,
      role: profile.role,
      isBanned,
      hasModeratorPermission: isAdmin && ['moderator', 'admin', 'super_admin'].includes(profile.role),
      hasAdminPermission: isAdmin && ['admin', 'super_admin'].includes(profile.role),
      hasSuperAdminPermission: isAdmin && profile.role === 'super_admin'
    }

    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Permissions administrateur insuffisantes',
        auth: authResult,
        profile: profileResult,
        adminStatus
      }, { status: 403 })
    }

    if (isBanned) {
      return NextResponse.json({
        success: false,
        message: 'Compte administrateur suspendu',
        auth: authResult,
        profile: profileResult,
        adminStatus
      }, { status: 403 })
    }

    // 🔒 4. Test des fonctions RPC
    const rpcTests: {
      dashboard_stats: { success: boolean; error: string | null; data: string | null }
      admin_tickets: { success: boolean; error: string | null; data: string | null }
      admin_users: { success: boolean; error: string | null; data: string | null }
    } = {
      dashboard_stats: { success: false, error: null, data: null },
      admin_tickets: { success: false, error: null, data: null },
      admin_users: { success: false, error: null, data: null }
    }

    // Test get_admin_dashboard_stats
    try {
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_dashboard_stats')
      
      rpcTests.dashboard_stats = {
        success: !statsError,
        error: statsError?.message || null,
        data: statsData ? `${statsData.length} records` : null
      }
    } catch (error) {
      rpcTests.dashboard_stats.error = (error as Error).message
    }

    // Test get_admin_tickets_with_users
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .rpc('get_admin_tickets_with_users')
      
      rpcTests.admin_tickets = {
        success: !ticketsError,
        error: ticketsError?.message || null,
        data: ticketsData ? `${ticketsData.length} tickets` : null
      }
    } catch (error) {
      rpcTests.admin_tickets.error = (error as Error).message
    }

    // Test get_all_users_admin
    try {
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_users_admin')
      
      rpcTests.admin_users = {
        success: !usersError,
        error: usersError?.message || null,
        data: usersData ? `${usersData.length} users` : null
      }
    } catch (error) {
      rpcTests.admin_users.error = (error as Error).message
    }

    // 📊 5. Log du test d'auth
    await supabase.from('admin_logs').insert({
      admin_id: session.user.id,
      action: 'test_admin_auth',
      target_type: 'admin_api',
      details: {
        endpoint: '/api/admin/test-auth',
        role: profile.role,
        rpc_tests: rpcTests,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Authentification admin validée avec succès',
      auth: authResult,
      profile: profileResult,
      adminStatus,
      rpcTests,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[API ADMIN TEST-AUTH] Erreur générale:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur serveur lors du test',
      error: (error as Error).message
    }, { status: 500 })
  }
}