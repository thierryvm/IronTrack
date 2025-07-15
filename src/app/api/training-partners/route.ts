import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/utils/auth-api'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError, supabase } = await authenticateRequest(request)
    
    if (authError || !user || !supabase) {
      return NextResponse.json({ error: authError || 'Non autorisé' }, { status: 401 })
    }

    // Récupérer tous les partenariats de l'utilisateur
    const { data: partnerships, error } = await supabase
      .from('training_partners')
      .select(`
        *,
        requester:requester_id(id, pseudo, full_name, email, avatar_url),
        partner:partner_id(id, pseudo, full_name, email, avatar_url)
      `)
      .or(`requester_id.eq.${user.id},partner_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur récupération partenaires:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ partnerships })
  } catch (error) {
    console.error('Erreur API training-partners:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError, supabase } = await authenticateRequest(request)
    
    if (authError || !user || !supabase) {
      return NextResponse.json({ error: authError || 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { action, partnerId, message } = body

    if (action === 'invite') {
      // Créer une nouvelle invitation
      if (!partnerId) {
        return NextResponse.json({ error: 'ID partenaire requis' }, { status: 400 })
      }

      // Vérifier que le partenaire existe
      const { data: partnerExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', partnerId)
        .single()

      if (!partnerExists) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
      }

      // Vérifier qu'il n'y a pas déjà un partenariat
      const { data: existing } = await supabase
        .from('training_partners')
        .select('id')
        .or(`and(requester_id.eq.${user.id},partner_id.eq.${partnerId}),and(requester_id.eq.${partnerId},partner_id.eq.${user.id})`)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Partenariat déjà existant' }, { status: 409 })
      }

      const { data, error } = await supabase
        .from('training_partners')
        .insert({
          requester_id: user.id,
          partner_id: partnerId,
          message: message || null,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur création invitation:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ invitation: data })
    }

    return NextResponse.json({ error: 'Action non supportée' }, { status: 400 })
  } catch (error) {
    console.error('Erreur API training-partners POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}