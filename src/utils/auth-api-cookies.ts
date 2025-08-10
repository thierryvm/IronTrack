import { createServerSupabaseClient } from '@/utils/supabase/server'

export async function authenticateRequestCookies() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Vérifier l'authentification via les cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { user: null, error: 'Non autorisé' }
    }

    return { user, error: null, supabase }
  } catch (error) {
    return { user: null, error: 'Erreur d\'authentification' }
  }
}