/**
 * 🛡️ MIDDLEWARE DE SÉCURITÉ CRITIQUE - IRONTRACK ADMIN
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * 🚨 MIDDLEWARE DE SÉCURITÉ CRITIQUE
 * 
 * Ce middleware protège TOUTES les routes admin contre :
 * - Accès non authentifiés
 * - Contournement d'authentification côté client  
 * - Élévation de privilèges non autorisée
 * - Accès avec des rôles expirés
 */
export async function middleware(request: NextRequest) {
  // ⚡ PROTECTION CRITIQUE : Exclure complètement les assets statiques
  if (
    request.nextUrl.pathname.startsWith('/_next/static') ||
    request.nextUrl.pathname.startsWith('/_next/image') ||
    request.nextUrl.pathname.includes('.') // Fichiers avec extension (CSS, JS, images)
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string) {
          request.cookies.delete(name)
          response.cookies.delete(name)
        },
      },
    }
  )

  // 🔒 PROTECTION CRITIQUE : Routes admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // 1️⃣ Vérification session authentifiée
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        console.log(`[SECURITY] Accès admin bloqué - Pas de session valide`, {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent'),
          path: request.nextUrl.pathname
        })
        
        return NextResponse.redirect(new URL('/auth?error=admin_auth_required', request.url))
      }

      // 2️⃣ Vérification CRITIQUE : Rôles admin via RPC bypass RLS
      const { data: isAdmin, error: roleError } = await supabase
        .rpc('is_user_admin', { user_uuid: session.user.id })

      if (roleError) {
        console.error(`[SECURITY ERROR] Erreur vérification rôles admin via RPC:`, {
          error: roleError,
          userId: session.user.id,
          path: request.nextUrl.pathname
        })
        
        return NextResponse.redirect(new URL('/auth?error=role_verification_failed', request.url))
      }

      // 3️⃣ Validation stricte admin via RPC
      if (!isAdmin) {
        // Récupérer les détails pour logging
        const { data: adminRoles } = await supabase
          .rpc('check_user_admin_role', { user_uuid: session.user.id })

        console.log(`[SECURITY] Accès admin refusé - Permissions insuffisantes`, {
          userId: session.user.id,
          email: session.user.email,
          isAdminRpc: isAdmin,
          path: request.nextUrl.pathname,
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        })

        // 🚨 LOG CRITIQUE : Tentative d'accès non autorisée
        await supabase.from('admin_logs').insert({
          admin_id: session.user.id,
          action: 'unauthorized_admin_access_attempt',
          target_type: 'admin_panel',
          details: {
            path: request.nextUrl.pathname,
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent'),
            rpc_result: isAdmin,
            roles_found: adminRoles?.map(r => r.role) || [],
            timestamp: new Date().toISOString()
          }
        })

        return NextResponse.redirect(new URL('/?error=insufficient_admin_privileges', request.url))
      }

      // Récupérer le rôle pour logging
      const { data: adminRoleDetails } = await supabase
        .rpc('check_user_admin_role', { user_uuid: session.user.id })
      
      const validAdminRole = adminRoleDetails?.[0] || { role: 'admin' }

      // 4️⃣ Log d'accès admin valide (pour audit)
      await supabase.from('admin_logs').insert({
        admin_id: session.user.id,
        action: 'admin_panel_access',
        target_type: 'admin_panel', 
        details: {
          path: request.nextUrl.pathname,
          role: validAdminRole.role,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        }
      })

      // 5️⃣ Ajouter headers de sécurité
      const secureResponse = NextResponse.next()
      
      // Protection XSS
      secureResponse.headers.set('X-Content-Type-Options', 'nosniff')
      secureResponse.headers.set('X-Frame-Options', 'DENY') 
      secureResponse.headers.set('X-XSS-Protection', '1; mode=block')
      secureResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      
      // CSP pour prévenir XSS
      secureResponse.headers.set('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self' https://*.supabase.co;"
      )

      return secureResponse

    } catch (error) {
      console.error(`[SECURITY CRITICAL] Erreur middleware admin:`, error)
      
      return NextResponse.redirect(new URL('/auth?error=security_check_failed', request.url))
    }
  }

  // 🔒 Protection générale : Headers de sécurité pour toutes les routes
  const response2 = NextResponse.next()
  response2.headers.set('X-Content-Type-Options', 'nosniff')
  response2.headers.set('X-Frame-Options', 'SAMEORIGIN')
  
  return response2
}

/**
 * Configuration du middleware - Routes protégées
 * 
 * 🚨 CRITIQUE : Toutes les routes /admin/* sont protégées
 * Cela inclut :
 * - /admin (dashboard principal)
 * - /admin/users (gestion utilisateurs)
 * - /admin/tickets (gestion tickets)
 * - /admin/exports (export de données)
 * - /admin/logs (logs d'audit)
 */
export const config = {
  matcher: [
    /*
     * Matcher pour le middleware - EXCLUT les assets statiques
     * Protège TOUTES les routes /admin/* mais EXCLUT :
     * - API routes (_next)
     * - Assets statiques (_next/static)
     * - Images (_next/image)
     * - Favicons
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/admin/:path*'
  ]
}