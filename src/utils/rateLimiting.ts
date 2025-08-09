/**
 * 🛡️ SYSTÈME RATE LIMITING - Protection API Routes 2025
 * 
 * PROTECTION:
 * - DDoS attacks
 * - API abuse
 * - Brute force attempts
 * - Resource exhaustion
 * 
 * STRATÉGIE:
 * - Memory-based (production avec Redis recommandé)
 * - IP + User ID tracking
 * - Multiple time windows
 * - Graduated responses
 */

interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
}

interface RateLimitConfig {
  windowMs: number     // Fenêtre de temps en ms
  maxRequests: number  // Requêtes max dans la fenêtre
  blockDurationMs: number // Durée de blocage si dépassé
}

// Cache mémoire pour les limites (en production, utiliser Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Configurations par endpoint et type d'utilisateur
 */
export const RATE_LIMIT_CONFIGS = {
  // API Exercices - Opérations CRUD critiques
  exercises: {
    // Utilisateurs authentifiés standards
    authenticated: {
      windowMs: 60 * 1000,        // 1 minute
      maxRequests: 30,            // 30 req/min max
      blockDurationMs: 5 * 60 * 1000  // Blocage 5 min
    },
    // Utilisateurs non authentifiés (très restrictif)
    anonymous: {
      windowMs: 60 * 1000,        // 1 minute
      maxRequests: 5,             // 5 req/min seulement
      blockDurationMs: 15 * 60 * 1000 // Blocage 15 min
    }
  },
  
  // API Admin - Très restrictif
  admin: {
    authenticated: {
      windowMs: 60 * 1000,        // 1 minute
      maxRequests: 10,            // 10 req/min max
      blockDurationMs: 10 * 60 * 1000 // Blocage 10 min
    },
    anonymous: {
      windowMs: 60 * 1000,
      maxRequests: 2,             // Presque aucune tolérance
      blockDurationMs: 30 * 60 * 1000 // Blocage 30 min
    }
  },
  
  // API Auth - Anti brute force
  auth: {
    authenticated: {
      windowMs: 15 * 60 * 1000,   // 15 minutes
      maxRequests: 10,            // 10 tentatives auth
      blockDurationMs: 60 * 60 * 1000 // Blocage 1 heure
    },
    anonymous: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,             // Très restrictif
      blockDurationMs: 60 * 60 * 1000 // Blocage 1 heure
    }
  }
} as const

/**
 * Génère une clé unique pour le rate limiting
 */
function getRateLimitKey(ip: string, userId?: string, endpoint?: string): string {
  const baseKey = userId ? `user:${userId}` : `ip:${ip}`
  return endpoint ? `${baseKey}:${endpoint}` : baseKey
}

/**
 * Nettoyage périodique du cache (éviter memory leaks)
 */
function cleanExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

// Nettoyage automatique toutes les 5 minutes
let cleanupInterval: NodeJS.Timeout | null = null
if (typeof window === 'undefined') { // Seulement côté serveur
  cleanupInterval = setInterval(cleanExpiredEntries, 5 * 60 * 1000)
}

/**
 * Vérifie et applique le rate limiting
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig,
  userId?: string,
  endpoint?: string
): {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
} {
  const now = Date.now()
  const key = getRateLimitKey(ip, userId, endpoint)
  
  // Récupérer ou créer l'entrée
  let entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Nouvelle fenêtre ou expirée
    entry = {
      count: 1,  // Première requête de la nouvelle fenêtre
      resetTime: now + config.windowMs,
      lastRequest: now
    }
  } else {
    // Fenêtre active, incrémenter le compteur
    entry.count++
    entry.lastRequest = now
  }
  
  // Vérifier si la limite est dépassée
  const allowed = entry.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)
  
  if (!allowed) {
    // Bloquer plus longtemps si limite dépassée
    entry.resetTime = now + config.blockDurationMs
  }
  
  // Sauvegarder l'entrée mise à jour
  rateLimitStore.set(key, entry)
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)
  }
}

/**
 * Middleware Next.js pour rate limiting
 */
export function createRateLimitMiddleware(
  configType: keyof typeof RATE_LIMIT_CONFIGS,
  endpoint?: string
) {
  return function rateLimitMiddleware(
    request: Request,
    userId?: string
  ): Response | null {
    // Extraire l'IP (gérer les proxies Vercel/Cloudflare)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfIp = request.headers.get('cf-connecting-ip')
    
    const ip = cfIp || realIp || forwarded?.split(',')[0] || 'unknown'
    
    // Sélectionner la config appropriée
    const configSet = RATE_LIMIT_CONFIGS[configType]
    const config = userId ? configSet.authenticated : configSet.anonymous
    
    // Vérifier le rate limit
    const result = checkRateLimit(ip, config, userId, endpoint)
    
    if (!result.allowed) {
      // Construire réponse d'erreur avec headers standard
      const headers = new Headers({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        'Retry-After': result.retryAfter!.toString(),
        'Content-Type': 'application/json'
      })
      
      const body = JSON.stringify({
        error: 'Rate limit dépassé',
        message: `Trop de requêtes. Réessayez dans ${result.retryAfter}s.`,
        retryAfter: result.retryAfter
      })
      
      return new Response(body, {
        status: 429,
        statusText: 'Too Many Requests',
        headers
      })
    }
    
    // Ajouter headers informatifs même si autorisé
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
    
    // Pas de blocage, laisser la requête continuer
    return null
  }
}

/**
 * Utilitaire pour ajouter les headers rate limit à une réponse
 */
export function addRateLimitHeaders(
  response: Response,
  limit: number,
  remaining: number,
  resetTime: number
): Response {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
  
  return response
}

/**
 * Réinitialiser le rate limit pour un utilisateur (admin uniquement)
 */
export function resetRateLimit(ip: string, userId?: string, endpoint?: string): void {
  const key = getRateLimitKey(ip, userId, endpoint)
  rateLimitStore.delete(key)
}

/**
 * Obtenir les statistiques de rate limiting (monitoring)
 */
export function getRateLimitStats(): {
  totalKeys: number
  memoryUsage: number
  topUsers: Array<{key: string, count: number, lastRequest: Date}>
} {
  const entries = Array.from(rateLimitStore.entries())
  
  const topUsers = entries
    .map(([key, entry]) => ({
      key,
      count: entry.count,
      lastRequest: new Date(entry.lastRequest)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  return {
    totalKeys: entries.length,
    memoryUsage: JSON.stringify(Object.fromEntries(rateLimitStore)).length,
    topUsers
  }
}

/**
 * Nettoyage manuel du cache (pour les tests)
 */
export function clearRateLimitCache(): void {
  rateLimitStore.clear()
}

// Nettoyage à l'arrêt du processus
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
    }
    rateLimitStore.clear()
  })
}