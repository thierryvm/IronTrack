import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rate limiting state
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

export async function middleware(request: NextRequest) {
  // Rate Limiting Logic
  const forwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0].trim() || xRealIp || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100 // 100 requests per minute

  const rateLimitInfo = rateLimitMap.get(ip)

  if (rateLimitInfo) {
    if (now - rateLimitInfo.timestamp < windowMs) {
      rateLimitInfo.count += 1
      if (rateLimitInfo.count > maxRequests) {
        return NextResponse.json(
          { error: 'Too Many Requests' },
          { status: 429 }
        )
      }
    } else {
      // Reset window
      rateLimitMap.set(ip, { count: 1, timestamp: now })
    }
  } else {
    // Initial request
    rateLimitMap.set(ip, { count: 1, timestamp: now })
  }

  // Cleanup old entries (simple approach, every 100 requests)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.timestamp > windowMs) {
        rateLimitMap.delete(key)
      }
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          return request.cookies.get(name)?.value
        },
        set: (name: string, value: string, options: Record<string, unknown>) => {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove: (name: string, options: Record<string, unknown>) => {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Rafraîchir la session si elle expire bientôt
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Gestion des routes d'authentification
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (user) {
      // Utilisateur connecté, rediriger vers dashboard
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  // Routes protégées - redirection si non connecté
  const protectedRoutes = [
    '/exercises',
    '/nutrition',
    '/training-partners',
    '/progress',
    '/profile',
    '/calendar',
    '/workouts'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Routes admin - vérification des permissions spécifiques
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Vérifier les permissions admin via profiles.role (alignement avec les routes API)
    const { data: adminProfile, error: roleError } = await supabase
      .from('profiles')
      .select('role, is_banned, banned_until')
      .eq('id', user.id)
      .single()

    if (roleError || !adminProfile) {
      console.error('[MIDDLEWARE] Admin profile check failed:', roleError)
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Vérifier si l'admin est banni (temps réel)
    const now = new Date()
    const bannedUntil = adminProfile.banned_until ? new Date(adminProfile.banned_until) : null
    const isReallyBanned = bannedUntil ? bannedUntil > now : adminProfile.is_banned
    
    if (isReallyBanned) {
      console.error('[MIDDLEWARE] Admin account is banned')
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Vérifier si le rôle est admin/super_admin/moderator
    const adminRoles = ['moderator', 'admin', 'super_admin']
    if (!adminProfile.role || !adminRoles.includes(adminProfile.role)) {
      console.error('[MIDDLEWARE] Insufficient permissions for admin access:', adminProfile.role)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes handle their own auth)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}