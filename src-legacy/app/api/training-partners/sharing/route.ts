import { NextRequest, NextResponse} from'next/server'
import { createServerSupabaseClient} from'@/utils/supabase/server'

export async function GET(_request: NextRequest) {try {
 const supabase = createServerSupabaseClient()
 const { data: { user}, error: authError} = await supabase.auth.getUser()

 if (authError || !user) {
 return NextResponse.json({ error:'Non authentifié'}, { status: 401})
}

 // Récupérer les paramètres de partage de l'utilisateur
 const { data: settings, error} = await supabase
 .from('partner_sharing_settings')
 .select(`
 *,
 partner:partner_id(id, pseudo, full_name, email, avatar_url)
 `)
 .eq('user_id', user.id)

 if (error) {
 if (process.env.NODE_ENV ==='development') {
 console.error('Erreur récupération paramètres partage:', error)
}
 return NextResponse.json({ error: error.message}, { status: 500})
}

 return NextResponse.json({ settings})
} catch (error) {
 if (process.env.NODE_ENV ==='development') {
 console.error('Erreur API sharing settings:', error)
}
 return NextResponse.json({ error:'Erreur serveur'}, { status: 500})
}
}

export async function PATCH(request: NextRequest) {try {
 const supabase = createServerSupabaseClient()
 const { data: { user}, error: authError} = await supabase.auth.getUser()

 if (authError || !user) {
 return NextResponse.json({ error:'Non authentifié'}, { status: 401})
}

 const body = await request.json()
 const { partnerId, shareWorkouts, shareNutrition, shareProgress} = body

 if (!partnerId) {
 return NextResponse.json({ error:'ID partenaire requis'}, { status: 400})
}

 // Vérifier que le partenariat existe et est accepté
 const { data: partnership} = await supabase
 .from('training_partners')
 .select('status')
 .or(`and(requester_id.eq.${user.id},partner_id.eq.${partnerId}),and(requester_id.eq.${partnerId},partner_id.eq.${user.id})`)
 .eq('status','accepted')
 .single()

 if (!partnership) {
 return NextResponse.json({ error:'Partenariat non trouvé ou non accepté'}, { status: 404})
}

 // Mettre à jour ou créer les paramètres de partage
 const updateData: Record<string, unknown> = {
 updated_at: new Date().toISOString()
}

 if (typeof shareWorkouts ==='boolean') updateData.share_workouts = shareWorkouts
 if (typeof shareNutrition ==='boolean') updateData.share_nutrition = shareNutrition
 if (typeof shareProgress ==='boolean') updateData.share_progress = shareProgress

 // Essayer d'abord de mettre à jour
 const { data, error} = await supabase
 .from('partner_sharing_settings')
 .update(updateData)
 .eq('user_id', user.id)
 .eq('partner_id', partnerId)
 .select()
 .single()

 if (error) {
 // Si l'enregistrement n'existe pas, le créer
 if (error.code ==='PGRST116') {
 const newSettings = {
 user_id: user.id,
 partner_id: partnerId,
 share_workouts: shareWorkouts ?? false,
 share_nutrition: shareNutrition ?? false,
 share_progress: shareProgress ?? false
}

 const { data: newData, error: createError} = await supabase
 .from('partner_sharing_settings')
 .insert(newSettings)
 .select()
 .single()

 if (createError) {
 if (process.env.NODE_ENV ==='development') {
 console.error('Erreur création paramètres partage:', createError)
}
 return NextResponse.json({ error: createError.message}, { status: 500})
}

 return NextResponse.json({ settings: newData})
} else {
 if (process.env.NODE_ENV ==='development') {
 console.error('Erreur mise à jour paramètres partage:', error)
}
 return NextResponse.json({ error: error.message}, { status: 500})
}
}

 return NextResponse.json({ settings: data})
} catch (error) {
 if (process.env.NODE_ENV ==='development') {
 console.error('Erreur API sharing settings PATCH:', error)
}
 return NextResponse.json({ error:'Erreur serveur'}, { status: 500})
}
}