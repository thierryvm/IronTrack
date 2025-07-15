import { createServerSupabaseClient } from '@/utils/supabase/server'

export async function authenticateRequestCookies() {
  try {
    console.log('Trying cookie-based auth...')
    
    const supabase = createServerSupabaseClient()
    
    // Vérifier l'authentification via les cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Cookie auth result - User:', user?.id, 'Error:', authError?.message)
    
    if (authError || !user) {
      console.log('Cookie auth failed:', authError?.message)
      return { user: null, error: 'Non autorisé' }
    }

    return { user, error: null, supabase }
  } catch (error) {
    console.log('Cookie auth exception:', error)
    return { user: null, error: 'Erreur d\'authentification' }
  }
}