import { createServerSupabaseClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest, 
  context: RouteContext
) {
  try {
    const params = await context.params
    const supabase = createServerSupabaseClient()
    const { status, admin_note } = await request.json()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions admin
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (roleError || !userRole || !['admin', 'super_admin', 'moderator'].includes(userRole.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Vérifier que le statut est valide
    const validStatuses = ['open', 'in_progress', 'pending', 'resolved', 'closed', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Mettre à jour le ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_tickets')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur mise à jour ticket:', updateError);
      }
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    // Ajouter une note admin si fournie
    if (admin_note && admin_note.trim()) {
      const { error: noteError } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: params.id,
          admin_id: user.id,
          message: admin_note.trim(),
          is_public: false, // Note privée par défaut
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (noteError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur ajout note admin:', noteError);
        }
        // Ne pas faire échouer la requête pour autant
      }
    }

    // Logger l'action admin (optionnel)
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: 'update_ticket_status',
        target_type: 'ticket',
        target_id: params.id,
        details: {
          old_status: 'unknown', // On pourrait récupérer l'ancien statut
          new_status: status,
          has_note: !!admin_note
        },
        created_at: new Date().toISOString()
      })

    if (logError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur log admin:', logError);
      }
      // Ne pas faire échouer la requête
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      message: `Statut mis à jour vers "${status}"`
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur API update ticket status:', error);
    }
    return NextResponse.json(
      { error: 'Erreur serveur interne' }, 
      { status: 500 }
    )
  }
}