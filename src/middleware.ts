import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { hasAdminPermission, isUserCurrentlyBanned } from '@/lib/admin-security'

const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

const PROTECTED_ROUTES = [
  '/calendar',
  '/exercises',
  '/notifications',
  '/nutrition',
  '/profile',
  '/progress',
  '/support',
  '/training-partners',
  '/workouts',
]

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')

  return forwardedFor?.split(',')[0].trim() || xRealIp || 'unknown'
}

function getMaxRequests(pathname: string): number {
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/auth')) {
    return 20
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    return 60
  }

  if (pathname.startsWith('/api/')) {
    return 120
  }

  return 180
}

function applySecurityHeaders(response: NextResponse, pathname: string): NextResponse {
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=(), payment=(), usb=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site')
  response.headers.set('Origin-Agent-Cluster', '?1')
  response.headers.set('X-DNS-Prefetch-Control', 'off')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
  }

  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store')
  }

  return response
}

function buildRedirectResponse(request: NextRequest, pathname: string): NextResponse {
  return applySecurityHeaders(NextResponse.redirect(new URL(pathname, request.url)), request.nextUrl.pathname)
}

function buildRateLimitResponse(pathname: string, retryAfterSeconds: number): NextResponse {
  const response = NextResponse.json(
    { error: 'Too Many Requests' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  )

  return applySecurityHeaders(response, pathname)
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip = getClientIp(request)
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = getMaxRequests(pathname)
  const rateLimitInfo = rateLimitMap.get(ip)

  if (rateLimitInfo && now - rateLimitInfo.timestamp < windowMs) {
    rateLimitInfo.count += 1

    if (rateLimitInfo.count > maxRequests) {
      return buildRateLimitResponse(pathname, Math.ceil(windowMs / 1000))
    }
  } else {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
  }

  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear()
  }

  let response = applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    }),
    pathname
  )

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value,
            ...options,
          })

          response = applySecurityHeaders(
            NextResponse.next({
              request: {
                headers: request.headers,
              },
            }),
            pathname
          )

          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })

          response = applySecurityHeaders(
            NextResponse.next({
              request: {
                headers: request.headers,
              },
            }),
            pathname
          )

          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (pathname.startsWith('/auth')) {
    if (user) {
      return buildRedirectResponse(request, '/')
    }

    return response
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    return buildRedirectResponse(request, '/auth')
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return buildRedirectResponse(request, '/auth')
    }

    const { data: adminProfile, error: roleError } = await supabase
      .from('profiles')
      .select('role, is_banned, banned_until')
      .eq('id', user.id)
      .single()

    if (roleError || !adminProfile) {
      return buildRedirectResponse(request, '/')
    }

    if (isUserCurrentlyBanned(adminProfile.is_banned, adminProfile.banned_until)) {
      return buildRedirectResponse(request, '/')
    }

    if (!hasAdminPermission(adminProfile.role)) {
      return buildRedirectResponse(request, '/')
    }
  }

  const rateLimitState = rateLimitMap.get(ip)
  const remainingRequests = Math.max(0, maxRequests - (rateLimitState?.count ?? 1))

  response.headers.set('RateLimit-Limit', String(maxRequests))
  response.headers.set('RateLimit-Remaining', String(remainingRequests))
  response.headers.set('RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)))

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
