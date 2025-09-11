import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/utils/auth-api'
import { authenticateRequestCookies } from '@/utils/auth-api-cookies'

// Type pour le rate limiter global
declare global {
  var searchLimiter: Map<string, number[]> | undefined
}

export async function GET(request: NextRequest) {
  try {
    // Essayer d'abord l'auth par token Bearer
    let authResult = await authenticateRequest(request)
    
    // Si ça échoue, essayer l'auth par cookies
    if (authResult.error) {
      authResult = await authenticateRequestCookies()
    }
    
    const { user, error: authError, supabase } = authResult
    
    if (authError || !user || !supabase) {
      return NextResponse.json({ error: authError || 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Recherche trop courte (min 2 caractères)' }, { status: 400 })
    }

    // SÉCURITÉ : Validation renforcée
    if (query.length > 50) {
      return NextResponse.json({ error: 'Recherche trop longue (max 50 caractères)' }, { status: 400 })
    }

    // SÉCURITÉ : Emails complets OU pseudos sans caractères spéciaux
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pseudoRegex = /^[a-zA-Z0-9_-]+$/
    
    const isEmail = emailRegex.test(query)
    const isPseudo = pseudoRegex.test(query) && query.length >= 2
    
    if (!isEmail && !isPseudo) {
      return NextResponse.json({ 
        error: 'Format invalide. Utilisez un email complet ou un pseudo (lettres, chiffres, _ et - uniquement).',
        hint: 'Formats acceptés: utilisateur@domaine.com ou pseudo123'
      }, { status: 400 })
    }

    // SÉCURITÉ : Normalisation pour recherche insensible à la casse
    const sanitizedQuery = query.trim().toLowerCase()

    // SÉCURITÉ : Rate limiting simple (basé sur l'utilisateur)
    const now = Date.now()
    const userId = user.id
    
    // Stockage temporaire des dernières recherches (en production, utilisez Redis)
    if (!global.searchLimiter) {
      global.searchLimiter = new Map()
    }
    
    const userSearches = global.searchLimiter.get(userId) || []
    const recentSearches = userSearches.filter((timestamp: number) => now - timestamp < 60000) // 1 minute
    
    if (recentSearches.length >= 10) {
      return NextResponse.json({ error: 'Trop de recherches. Attendez 1 minute.' }, { status: 429 })
    }
    
    global.searchLimiter.set(userId, [...recentSearches, now])

    // SÉCURITÉ : Recherche exacte par email OU pseudo
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, pseudo, full_name, email, avatar_url')
      .neq('id', user.id) // Exclure l'utilisateur actuel
      .or(`email.eq.${sanitizedQuery},pseudo.ilike.${sanitizedQuery}`)
      .limit(3) // Limite drastique
    
    if (process.env.NODE_ENV === 'development') {
      console.log('=== DÉBOGAGE RECHERCHE API ===')
      console.log('Query originale:', query)
      console.log('Query sanitized:', sanitizedQuery)
      console.log('User qui recherche:', user.email)
      console.log('Résultats trouvés:', users?.length || 0, 'utilisateurs')
      if (users?.length > 0) {
        users.forEach(u => console.log('  - Trouvé:', u.email, '(pseudo:', u.pseudo + ')'))
      }
    }
    if (error) console.log('Erreur SQL:', error)

    if (error) {
      if (process.env.NODE_ENV === 'development') {

        console.error('Erreur recherche utilisateurs:', error)

      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Récupérer les partenariats existants pour marquer les utilisateurs déjà connectés
    const { data: existingPartnerships } = await supabase
      .from('training_partners')
      .select('requester_id, partner_id, status')
      .or(`requester_id.eq.${user.id},partner_id.eq.${user.id}`)

    // Enrichir les résultats avec le statut de partenariat
    const usersWithStatus = users?.map(u => {
      const partnership = existingPartnerships?.find(p => 
        (p.requester_id === user.id && p.partner_id === u.id) ||
        (p.partner_id === user.id && p.requester_id === u.id)
      )

      const displayName = u.pseudo || u.full_name || u.email?.split('@')[0] || 'Utilisateur'

      return {
        ...u,
        partnershipStatus: partnership?.status || null,
        displayName
      }
    }) || []

    return NextResponse.json({ users: usersWithStatus })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {

      console.error('Erreur API search users:', error)

    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}