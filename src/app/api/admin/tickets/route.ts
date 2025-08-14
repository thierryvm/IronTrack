/**
 * 🛡️ API ROUTE SÉCURISÉE : Gestion des Tickets Admin
 * 
 * Cette API remplace les appels RPC côté client pour éviter
 * les problèmes d'authentification avec get_admin_tickets_with_users()
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// ULTRAHARDCORE: Force Node.js runtime pour éviter Edge Runtime
export const runtime = "nodejs"

interface AdminTicket {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  user_id: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  user_email: string
  user_full_name: string
  admin_email: string | null
  admin_full_name: string | null
  response_count: number
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

    // 🔒 3. Récupération sécurisée des tickets
    try {
      // Essayer d'abord la fonction RPC (maintenant que l'auth est établie)
      const { data: rpcTickets, error: rpcError } = await supabase
        .rpc('get_admin_tickets_with_users')

      if (!rpcError && rpcTickets && Array.isArray(rpcTickets)) {// Log de l'accès
        await supabase.from('admin_logs').insert({
          admin_id: user.id,
          action: 'view_tickets_admin',
          target_type: 'admin_api',
          details: {
            endpoint: '/api/admin/tickets',
            role: adminProfile.role,
            tickets_count: rpcTickets.length,
            timestamp: new Date().toISOString()
          }
        })

        return NextResponse.json({ tickets: rpcTickets })
      }} catch {
        // Fallback silencieux vers méthode manuelle
      }

    // Fallback : récupération manuelle avec jointures
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('support_tickets')
      .select(`
        id,
        title,
        description,
        category,
        priority,
        status,
        user_id,
        assigned_to,
        created_at,
        updated_at,
        user_email
      `)
      .order('created_at', { ascending: false })

    if (ticketsError) {
      console.error('[API ADMIN TICKETS] Erreur récupération tickets:', ticketsError)
      return NextResponse.json({ error: 'Erreur lors de la récupération des tickets' }, { status: 500 })
    }

    // Enrichir avec les informations utilisateur et admin
    const enrichedTickets: AdminTicket[] = await Promise.all(
      (ticketsData || []).map(async (ticket) => {
        // Récupérer les infos de l'utilisateur
        let userProfile = null
        if (ticket.user_id) {
          const { data: userProf } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', ticket.user_id)
            .single()
          userProfile = userProf
        }

        // Récupérer les infos de l'admin assigné
        let adminProfile = null
        if (ticket.assigned_to) {
          const { data: adminProf } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', ticket.assigned_to)
            .single()
          adminProfile = adminProf
        }

        // Compter les réponses (si table ticket_responses existe)
        let responseCount = 0
        try {
          const { count } = await supabase
            .from('ticket_responses')
            .select('*', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id)
          responseCount = count || 0
        } catch {
          // Table ticket_responses n'existe peut-être pas encore
          responseCount = 0
        }

        return {
          id: ticket.id,
          title: ticket.title || 'Sans titre',
          description: ticket.description || '',
          category: ticket.category || 'general',
          priority: ticket.priority || 'medium',
          status: ticket.status || 'open',
          user_id: ticket.user_id,
          assigned_to: ticket.assigned_to,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          user_email: ticket.user_email || userProfile?.email || 'Email non disponible',
          user_full_name: userProfile?.full_name || 'Nom non défini',
          admin_email: adminProfile?.email || null,
          admin_full_name: adminProfile?.full_name || null,
          response_count: responseCount
        }
      })
    )

    // 📊 4. Log de l'accès
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'view_tickets_admin_fallback',
      target_type: 'admin_api',
      details: {
        endpoint: '/api/admin/tickets',
        role: adminProfile.role,
        tickets_count: enrichedTickets.length,
        method: 'manual_fallback',
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({ tickets: enrichedTickets })

  } catch (error) {
    console.error('[API ADMIN TICKETS] Erreur générale:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}