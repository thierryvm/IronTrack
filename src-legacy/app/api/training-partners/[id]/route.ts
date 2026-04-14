import { NextRequest, NextResponse} from'next/server'
import { createServerSupabaseClient} from'@/utils/supabase/server'

export async function PATCH(
 request: NextRequest,
 { params}: { params: Promise<{ id: string}>}
) {
 try {
 const supabase = createServerSupabaseClient()
 const { data: { user}, error: authError} = await supabase.auth.getUser()

 if (authError || !user) {
 return NextResponse.json({ error:'Non authentifié'}, { status: 401})
}

 const body = await request.json()
 const { action} = body
 const resolvedParams = await params
 const partnershipId = resolvedParams.id

 // Vérifier que l'utilisateur fait partie de ce partenariat
 const { data: partnership, error: fetchError} = await supabase
 .from('training_partners')
 .select('*')
 .eq('id', partnershipId)
 .or(`requester_id.eq.${user.id},partner_id.eq.${user.id}`)
 .single()

 if (fetchError || !partnership) {
 return NextResponse.json({ error:'Partenariat non trouvé'}, { status: 404})
}

 const updateData: Record<string, unknown> = {}

 switch (action) {
 case'accept':
 if (partnership.partner_id !== user.id) {
 return NextResponse.json({ error:'Seul le partenaire peut accepter'}, { status: 403})
}
 updateData.status ='accepted'
 
 // Créer les paramètres de partage par défaut pour les deux utilisateurs
 const sharingSettings = [
 {
 user_id: partnership.requester_id,
 partner_id: partnership.partner_id,
 share_workouts: false,
 share_nutrition: false,
 share_progress: false
},
 {
 user_id: partnership.partner_id,
 partner_id: partnership.requester_id,
 share_workouts: false,
 share_nutrition: false,
 share_progress: false
}
 ]
 
 // Essayer de créer les paramètres de partage avec gestion d'erreur robuste
 try {
 const { error: settingsError} = await supabase
 .from('partner_sharing_settings')
 .upsert(sharingSettings, {
 onConflict:'user_id,partner_id'
})
 
 if (settingsError) {
 if (process.env.NODE_ENV ==='development') {

 console.error('Erreur création paramètres partage:', settingsError)

}
 console.error('Détails erreur:', JSON.stringify(settingsError, null, 2))
 // Ne pas faire échouer l'acceptation si la création des paramètres échoue
}
} catch (tableError) {
 if (process.env.NODE_ENV ==='development') {

 console.error('Table partner_sharing_settings inaccessible:', tableError)

}
 // Continuer sans les paramètres de partage si la table n'existe pas
}
 break

 case'decline':
 if (partnership.partner_id !== user.id) {
 return NextResponse.json({ error:'Seul le partenaire peut refuser'}, { status: 403})
}
 updateData.status ='declined'
 break

 case'block':
 updateData.status ='blocked'
 break

 case'cancel':
 // Supprimer l'invitation si elle est en attente
 if (partnership.status ==='pending' && partnership.requester_id === user.id) {
 const { error: deleteError} = await supabase
 .from('training_partners')
 .delete()
 .eq('id', partnershipId)

 if (deleteError) {
 return NextResponse.json({ error: deleteError.message}, { status: 500})
}

 return NextResponse.json({ message:'Invitation annulée'})
}
 return NextResponse.json({ error:'Impossible d\'annuler cette invitation'}, { status: 400})

 case'remove':
 // Supprimer un partenariat accepté
 if (partnership.status ==='accepted') {
 const { error: deleteError} = await supabase
 .from('training_partners')
 .delete()
 .eq('id', partnershipId)

 if (deleteError) {
 return NextResponse.json({ error: deleteError.message}, { status: 500})
}

 // Supprimer aussi les paramètres de partage
 await supabase
 .from('partner_sharing_settings')
 .delete()
 .or(`and(user_id.eq.${partnership.requester_id},partner_id.eq.${partnership.partner_id}),and(user_id.eq.${partnership.partner_id},partner_id.eq.${partnership.requester_id})`)

 return NextResponse.json({ message:'Partenariat supprimé'})
}
 return NextResponse.json({ error:'Impossible de supprimer ce partenariat'}, { status: 400})

 default:
 return NextResponse.json({ error:'Action non supportée'}, { status: 400})
}

 // Mettre à jour le statut
 if (Object.keys(updateData).length > 0) {
 updateData.updated_at = new Date().toISOString()

 const { data, error: updateError} = await supabase
 .from('training_partners')
 .update(updateData)
 .eq('id', partnershipId)
 .select()
 .single()

 if (updateError) {
 return NextResponse.json({ error: updateError.message}, { status: 500})
}

 return NextResponse.json({ partnership: data})
}

 return NextResponse.json({ error:'Aucune mise à jour effectuée'}, { status: 400})
} catch (error) {
 if (process.env.NODE_ENV ==='development') {

 console.error('Erreur API training-partners PATCH:', error)

}
 return NextResponse.json({ error:'Erreur serveur'}, { status: 500})
}
}