/**
 * API Route pour modification sécurisée d'exercices
 * 
 * 🛡️ SÉCURITÉ: Validation serveur complète avec protection XSS/injection
 * 🔒 AUTH: Middleware Supabase avec RLS
 * 🚫 RATE LIMITING: Protection DDoS et abus avec limites graduées
 * ⚡ PERFORMANCE: Optimisé pour production
 */

import { NextRequest, NextResponse} from'next/server'
import { createServerSupabaseClient} from'@/utils/supabase/server'
import { validateExerciseUpdateData} from'@/utils/exerciseValidation'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS} from'@/utils/rateLimiting'

/**
 * PUT /api/exercises/[id] - Mettre à jour un exercice existant
 */
export async function PUT(
 request: NextRequest,
 { params}: { params: Promise<{ id: string}>}
) {
 try {
 const resolvedParams = await params
 
 // 0. Rate limiting AVANT authentification (protection ressources)
 const rateLimitMiddleware = createRateLimitMiddleware('exercises','update')
 const rateLimitResponse = rateLimitMiddleware(request)
 
 if (rateLimitResponse) {
 // Rate limit dépassé, retourner la réponse de blocage
 return rateLimitResponse
}

 // 1. Vérification authentification
 const supabase = createServerSupabaseClient()
 const { data: { user}, error: authError} = await supabase.auth.getUser()

 if (authError || !user) {
 return NextResponse.json(
 { error:'Authentification requise'},
 { status: 401}
 )
}
 
 // Après auth réussie, vérifier rate limit utilisateur authentifié
 const authenticatedRateLimitResponse = rateLimitMiddleware(request, user.id)
 if (authenticatedRateLimitResponse) {
 return authenticatedRateLimitResponse
}

 // 2. Validation ID exercice
 const exerciseId = resolvedParams.id
 if (!exerciseId || typeof exerciseId !=='string') {
 return NextResponse.json(
 { error:'ID exercice invalide'},
 { status: 400}
 )
}

 // 3. Parsing des données JSON
 let requestData: unknown
 try {
 requestData = await request.json()
} catch {
 return NextResponse.json(
 { error:'Format JSON invalide'},
 { status: 400}
 )
}

 // 4. Validation sécurisée des données
 const validation = validateExerciseUpdateData(requestData)
 
 if (!validation.isValid) {
 return NextResponse.json(
 { 
 error:'Données invalides',
 details: validation.errors
},
 { status: 400}
 )
}

 const validatedData = validation.data!

 // 5. Vérifier que l'exercice existe et appartient à l'utilisateur
 const { data: existingExercise, error: fetchError} = await supabase
 .from('exercises')
 .select('id, created_by')
 .eq('id', exerciseId)
 .single()

 if (fetchError || !existingExercise) {
 return NextResponse.json(
 { error:'Exercice introuvable'},
 { status: 404}
 )
}

 // 6. Vérification propriété (RLS + vérification explicite)
 if (existingExercise.created_by && existingExercise.created_by !== user.id) {
 return NextResponse.json(
 { error:'Accès non autorisé'},
 { status: 403}
 )
}

 // 7. Mise à jour avec données validées
 const updatePayload = {
 ...validatedData,
 updated_at: new Date().toISOString()
}

 const { data: updatedExercise, error: updateError} = await supabase
 .from('exercises')
 .update(updatePayload)
 .eq('id', exerciseId)
 .select()
 .single()

 if (updateError) {
 console.error('[API] Erreur mise à jour exercice:', updateError)
 return NextResponse.json(
 { error:'Erreur lors de la sauvegarde'},
 { status: 500}
 )
}

 // 8. Log d'audit pour sécurité
 try {
 await supabase.from('admin_logs').insert({
 user_id: user.id,
 action:'exercise_updated',
 resource_type:'exercise',
 resource_id: exerciseId,
 details: {
 updated_fields: Object.keys(validatedData),
 timestamp: new Date().toISOString()
}
})
} catch {
 // Log audit non-critique, ne pas faire échouer la requête
}

 // 9. Retour succès avec headers rate limiting
 const config = RATE_LIMIT_CONFIGS.exercises.authenticated
 const successResponse = NextResponse.json({
 success: true,
 data: updatedExercise,
 message:'Exercice mis à jour avec succès'
})
 
 // Ajouter headers informatifs rate limit
 successResponse.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
 successResponse.headers.set('X-RateLimit-Window', `${config.windowMs / 1000}s`)
 
 return successResponse

} catch (error) {
 console.error('[API] Erreur serveur non gérée:', error)
 return NextResponse.json(
 { error:'Erreur serveur interne'},
 { status: 500}
 )
}
}

/**
 * GET /api/exercises/[id] - Récupérer un exercice avec ses performances
 */
export async function GET(
 request: NextRequest,
 { params}: { params: Promise<{ id: string}>}
) {
 try {
 const resolvedParams = await params
 
 // 0. Rate limiting
 const rateLimitMiddleware = createRateLimitMiddleware('exercises','read')
 const rateLimitResponse = rateLimitMiddleware(request)
 
 if (rateLimitResponse) {
 return rateLimitResponse
}
 
 // 1. Authentification
 const supabase = createServerSupabaseClient()
 const { data: { user}, error: authError} = await supabase.auth.getUser()

 if (authError || !user) {
 return NextResponse.json(
 { error:'Authentification requise'},
 { status: 401}
 )
}
 
 // Rate limit utilisateur authentifié
 const authenticatedRateLimitResponse = rateLimitMiddleware(request, user.id)
 if (authenticatedRateLimitResponse) {
 return authenticatedRateLimitResponse
}

 // 2. Validation ID
 const exerciseId = resolvedParams.id
 if (!exerciseId || typeof exerciseId !=='string') {
 return NextResponse.json(
 { error:'ID exercice invalide'},
 { status: 400}
 )
}

 // 3. Récupération exercice avec équipement
 const { data: exercise, error: exerciseError} = await supabase
 .from('exercises')
 .select(`
 *,
 equipment (
 id,
 name
 )
 `)
 .eq('id', exerciseId)
 .single()

 if (exerciseError || !exercise) {
 return NextResponse.json(
 { error:'Exercice introuvable'},
 { status: 404}
 )
}

 // 4. Récupération dernière performance pour notes
 const { data: latestPerformance} = await supabase
 .from('performance_logs')
 .select('notes, performed_at')
 .eq('exercise_id', exerciseId)
 .order('performed_at', { ascending: false})
 .limit(1)
 .single()

 // 5. Formatage réponse
 const response = {
 ...exercise,
 latest_performance_notes: latestPerformance?.notes || null,
 latest_performance_date: latestPerformance?.performed_at || null
}

 const config = RATE_LIMIT_CONFIGS.exercises.authenticated
 const successResponse = NextResponse.json({
 success: true,
 data: response
})
 
 // Headers rate limiting informatifs
 successResponse.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
 successResponse.headers.set('X-RateLimit-Window', `${config.windowMs / 1000}s`)
 
 return successResponse

} catch (error) {
 console.error('[API] Erreur serveur GET exercice:', error)
 return NextResponse.json(
 { error:'Erreur serveur interne'},
 { status: 500}
 )
}
}

/**
 * DELETE /api/exercises/[id] - Supprimer un exercice (soft delete)
 */
export async function DELETE(
 request: NextRequest,
 { params}: { params: Promise<{ id: string}>}
) {
 try {
 const resolvedParams = await params
 
 // 0. Rate limiting (DELETE plus restrictif)
 const rateLimitMiddleware = createRateLimitMiddleware('exercises','delete')
 const rateLimitResponse = rateLimitMiddleware(request)
 
 if (rateLimitResponse) {
 return rateLimitResponse
}
 
 // 1. Authentification
 const supabase = createServerSupabaseClient()
 const { data: { user}, error: authError} = await supabase.auth.getUser()

 if (authError || !user) {
 return NextResponse.json(
 { error:'Authentification requise'},
 { status: 401}
 )
}
 
 // Rate limit utilisateur authentifié
 const authenticatedRateLimitResponse = rateLimitMiddleware(request, user.id)
 if (authenticatedRateLimitResponse) {
 return authenticatedRateLimitResponse
}

 // 2. Validation ID
 const exerciseId = resolvedParams.id
 if (!exerciseId || typeof exerciseId !=='string') {
 return NextResponse.json(
 { error:'ID exercice invalide'},
 { status: 400}
 )
}

 // 3. Vérifier existence et propriété
 const { data: existingExercise, error: fetchError} = await supabase
 .from('exercises')
 .select('id, created_by, name')
 .eq('id', exerciseId)
 .single()

 if (fetchError || !existingExercise) {
 return NextResponse.json(
 { error:'Exercice introuvable'},
 { status: 404}
 )
}

 if (existingExercise.created_by && existingExercise.created_by !== user.id) {
 return NextResponse.json(
 { error:'Accès non autorisé'},
 { status: 403}
 )
}

 // 4. Soft delete (marquer comme supprimé)
 const { error: deleteError} = await supabase
 .from('exercises')
 .update({ 
 deleted_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
})
 .eq('id', exerciseId)

 if (deleteError) {
 console.error('[API] Erreur suppression exercice:', deleteError)
 return NextResponse.json(
 { error:'Erreur lors de la suppression'},
 { status: 500}
 )
}

 // 5. Log d'audit
 try {
 await supabase.from('admin_logs').insert({
 user_id: user.id,
 action:'exercise_deleted',
 resource_type:'exercise',
 resource_id: exerciseId,
 details: {
 exercise_name: existingExercise.name,
 timestamp: new Date().toISOString()
}
})
} catch {
 // Log audit non-critique, ne pas faire échouer la requête
}

 const config = RATE_LIMIT_CONFIGS.exercises.authenticated
 const successResponse = NextResponse.json({
 success: true,
 message:'Exercice supprimé avec succès'
})
 
 // Headers rate limiting informatifs
 successResponse.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
 successResponse.headers.set('X-RateLimit-Window', `${config.windowMs / 1000}s`)
 
 return successResponse

} catch (error) {
 console.error('[API] Erreur serveur DELETE exercice:', error)
 return NextResponse.json(
 { error:'Erreur serveur interne'},
 { status: 500}
 )
}
}