import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { DEFAULT_LOCALE, LOCALES } from '@/i18n/request';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Middleware combiné : next-intl + Supabase auth.
 *
 * Ordre :
 *   1. `updateSession` rafraîchit la session Supabase (cookies)
 *   2. Si la route est protégée et l'utilisateur absent → redirect /<locale>/login
 *   3. Sinon, on délègue à next-intl pour le routing par locale
 *   4. On fusionne les cookies Supabase dans la réponse i18n
 *
 * Routes publiques : `/`, `/<locale>`, `/<locale>/login`, `/<locale>/auth/*`.
 */
const intlMiddleware = createIntlMiddleware({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeDetection: true,
});

const PUBLIC_PATHS = new Set<string>(['', '/login']);
const PUBLIC_PREFIXES = ['/auth/'];

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix : /fr/login → /login, /en → ''
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  const rest =
    first && (LOCALES as readonly string[]).includes(first)
      ? '/' + segments.slice(1).join('/')
      : pathname;
  const normalized = rest === '/' ? '' : rest.replace(/\/$/, '');

  if (PUBLIC_PATHS.has(normalized)) return true;
  return PUBLIC_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export default async function middleware(request: NextRequest) {
  const { response: supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Garde des routes protégées
  if (!user && !isPublicPath(pathname)) {
    const locale =
      LOCALES.find((l) => pathname.startsWith(`/${l}`)) ?? DEFAULT_LOCALE;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Délégation à next-intl pour le routing par locale
  const intlResponse = intlMiddleware(request);

  // Propager les cookies Supabase rafraîchis dans la réponse i18n
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
};
