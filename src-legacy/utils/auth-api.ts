import { NextRequest} from'next/server'
import { createServerSupabaseClient} from'@/utils/supabase/server'

export async function authenticateRequest(request: NextRequest) {
 try {
 // Récupérer le token Bearer du header Authorization
 const authHeader = request.headers.get('authorization')
 
 if (!authHeader || !authHeader.startsWith('Bearer')) {
 return { user: null, error:'Token d\'authentification requis'}
}

 const token = authHeader.replace('Bearer','')
 const supabase = createServerSupabaseClient()
 
 // Vérifier le token
 const { data: { user}, error: authError} = await supabase.auth.getUser(token)
 
 if (authError || !user) {
 return { user: null, error:'Token invalide ou expiré'}
}

 return { user, error: null, supabase}
} catch (error) {
 console.error('Auth exception:', error)
 return { user: null, error:'Erreur d\'authentification'}
}
}