import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/utils/auth-api'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError, supabase } = await authenticateRequest(request)
    
    if (authError || !user || !supabase) {
      return NextResponse.json({ error: authError || 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les paramètres de partage de l'utilisateur
    const { data: settings, error } = await supabase
      .from('partner_sharing_settings')
      .select(`
        *,
        partner:partner_id(id, pseudo, full_name, email, avatar_url)
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erreur récupération paramètres partage:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Erreur API sharing settings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError, supabase } = await authenticateRequest(request)
    
    if (authError || !user || !supabase) {
      return NextResponse.json({ error: authError || 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { partnerId, shareWorkouts, shareNutrition, shareProgress } = body

    if (!partnerId) {
      return NextResponse.json({ error: 'ID partenaire requis' }, { status: 400 })
    }

    // Vérifier que le partenariat existe et est accepté
    const { data: partnership } = await supabase
      .from('training_partners')
      .select('status')
      .or(`and(requester_id.eq.${user.id},partner_id.eq.${partnerId}),and(requester_id.eq.${partnerId},partner_id.eq.${user.id})`)
      .eq('status', 'accepted')
      .single()

    if (!partnership) {
      return NextResponse.json({ error: 'Partenariat non trouvé ou non accepté' }, { status: 404 })
    }

    // Mettre à jour les paramètres de partage
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (typeof shareWorkouts === 'boolean') updateData.share_workouts = shareWorkouts
    if (typeof shareNutrition === 'boolean') updateData.share_nutrition = shareNutrition
    if (typeof shareProgress === 'boolean') updateData.share_progress = shareProgress

    const { data, error } = await supabase
      .from('partner_sharing_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('partner_id', partnerId)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour paramètres partage:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Erreur API sharing settings PATCH:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}