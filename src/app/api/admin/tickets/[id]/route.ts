import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

type AdminRole = 'moderator' | 'admin' | 'super_admin'
type TicketStatus = 'open' | 'pending' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed' | 'archived'
type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface AdminTicketDetail {
  id: string
  title: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
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

interface AdminTicketResponse {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_internal: boolean
  is_solution: boolean
  created_at: string
  updated_at: string
  user_email: string
  user_full_name: string
  user_pseudo: string | null
}

async function requireAdmin() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
      supabase,
      user: null,
      adminProfile: null,
    }
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_banned, banned_until')
    .eq('id', user.id)
    .single()

  const adminRoles: AdminRole[] = ['moderator', 'admin', 'super_admin']
  const now = new Date()

  if (
    profileError ||
    !adminProfile ||
    !adminProfile.role ||
    !adminRoles.includes(adminProfile.role as AdminRole) ||
    (adminProfile.is_banned &&
      (!adminProfile.banned_until || new Date(adminProfile.banned_until) > now))
  ) {
    return {
      error: NextResponse.json({ error: 'Permissions administrateur insuffisantes' }, { status: 403 }),
      supabase,
      user,
      adminProfile: null,
    }
  }

  return {
    error: null,
    supabase,
    user,
    adminProfile,
  }
}

async function buildTicketDetail(supabase: ReturnType<typeof createServerSupabaseClient>, ticketId: string) {
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    return {
      detail: null,
      responses: [] as AdminTicketResponse[],
      error: NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 }),
    }
  }

  const relatedProfileIds = [ticket.user_id, ticket.assigned_to].filter(Boolean) as string[]

  const { data: relatedProfiles } = relatedProfileIds.length
    ? await supabase
        .from('profiles')
        .select('id, email, full_name, pseudo')
        .in('id', relatedProfileIds)
    : { data: [] }

  const profileMap = new Map((relatedProfiles || []).map((profile) => [profile.id, profile]))

  const { data: responseRows } = await supabase
    .from('ticket_responses')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  const responseUserIds = Array.from(
    new Set((responseRows || []).map((response) => response.user_id).filter(Boolean)),
  )

  const missingProfileIds = responseUserIds.filter((id) => !profileMap.has(id))
  if (missingProfileIds.length > 0) {
    const { data: responseProfiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, pseudo')
      .in('id', missingProfileIds)

    for (const profile of responseProfiles || []) {
      profileMap.set(profile.id, profile)
    }
  }

  const detail: AdminTicketDetail = {
    id: ticket.id,
    title: ticket.title || 'Sans titre',
    description: ticket.description || '',
    category: ticket.category || 'general',
    priority: (ticket.priority || 'medium') as TicketPriority,
    status: (ticket.status || 'open') as TicketStatus,
    user_id: ticket.user_id,
    assigned_to: ticket.assigned_to,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
    user_email: ticket.user_email || profileMap.get(ticket.user_id)?.email || 'Email non disponible',
    user_full_name: profileMap.get(ticket.user_id)?.full_name || 'Nom non défini',
    admin_email: ticket.assigned_to ? profileMap.get(ticket.assigned_to)?.email || null : null,
    admin_full_name: ticket.assigned_to ? profileMap.get(ticket.assigned_to)?.full_name || null : null,
    response_count: responseRows?.length || 0,
  }

  const responses: AdminTicketResponse[] = (responseRows || []).map((response) => {
    const authorProfile = profileMap.get(response.user_id)

    return {
      id: response.id,
      ticket_id: response.ticket_id,
      user_id: response.user_id,
      message: response.message || '',
      is_internal: !!response.is_internal,
      is_solution: !!response.is_solution,
      created_at: response.created_at,
      updated_at: response.updated_at,
      user_email: authorProfile?.email || 'Utilisateur inconnu',
      user_full_name: authorProfile?.full_name || 'Nom non défini',
      user_pseudo: authorProfile?.pseudo || null,
    }
  })

  return {
    detail,
    responses,
    error: null,
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = await context.params
  const { error, supabase, user, adminProfile } = await requireAdmin()

  if (error || !user || !adminProfile) {
    return error!
  }

  const detailResult = await buildTicketDetail(supabase, params.id)
  if (detailResult.error) {
    return detailResult.error
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'view_ticket_detail_admin',
    target_type: 'ticket',
    target_id: params.id,
    details: {
      endpoint: `/api/admin/tickets/${params.id}`,
      role: adminProfile.role,
      timestamp: new Date().toISOString(),
    },
  })

  return NextResponse.json({
    ticket: detailResult.detail,
    responses: detailResult.responses,
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const params = await context.params
  const { error, supabase, user, adminProfile } = await requireAdmin()

  if (error || !user || !adminProfile) {
    return error!
  }

  const body = await request.json()
  const updates: Record<string, string> = {}

  const validStatuses: TicketStatus[] = [
    'open',
    'pending',
    'in_progress',
    'waiting_user',
    'resolved',
    'closed',
    'archived',
  ]
  const validPriorities: TicketPriority[] = ['low', 'medium', 'high', 'critical']

  if (body.status) {
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }
    updates.status = body.status
  }

  if (body.priority) {
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: 'Priorité invalide' }, { status: 400 })
    }
    updates.priority = body.priority
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 })
  }

  updates.updated_at = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', params.id)

  if (updateError) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du ticket' }, { status: 500 })
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'update_ticket_admin',
    target_type: 'ticket',
    target_id: params.id,
    details: {
      role: adminProfile.role,
      updates,
      timestamp: new Date().toISOString(),
    },
  })

  const detailResult = await buildTicketDetail(supabase, params.id)
  if (detailResult.error) {
    return detailResult.error
  }

  return NextResponse.json({
    success: true,
    ticket: detailResult.detail,
    responses: detailResult.responses,
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params
  const { error, supabase, user, adminProfile } = await requireAdmin()

  if (error || !user || !adminProfile) {
    return error!
  }

  const body = await request.json()
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const isInternal = !!body.is_internal

  if (!message) {
    return NextResponse.json({ error: 'Le message ne peut pas être vide' }, { status: 400 })
  }

  const { error: insertError } = await supabase.from('ticket_responses').insert({
    ticket_id: params.id,
    user_id: user.id,
    message,
    is_internal: isInternal,
    is_solution: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (insertError) {
    return NextResponse.json({ error: 'Erreur lors de l’envoi de la réponse' }, { status: 500 })
  }

  if (!isInternal) {
    await supabase
      .from('support_tickets')
      .update({
        status: 'waiting_user',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: isInternal ? 'add_internal_note_admin' : 'reply_ticket_admin',
    target_type: 'ticket',
    target_id: params.id,
    details: {
      role: adminProfile.role,
      is_internal: isInternal,
      timestamp: new Date().toISOString(),
    },
  })

  const detailResult = await buildTicketDetail(supabase, params.id)
  if (detailResult.error) {
    return detailResult.error
  }

  return NextResponse.json({
    success: true,
    ticket: detailResult.detail,
    responses: detailResult.responses,
  })
}
