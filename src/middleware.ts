import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';

import { DEFAULT_LOCALE, LOCALES } from '@/i18n/request';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Middleware combiné : next-intl + rafraîchissement session Supabase.
 *
 * Volontairement PAS d'auth-guard ici : le guard vit dans chaque page
 * protégée via `requireUser()` (server component). Conséquence utile :
 * les routes inconnues (`/fr/zzzz`) atteignent notre 404 localisée au
 * lieu d'être détournées vers `/login`, y compris pour les visiteurs
 * anonymes. Les pages protégées continuent de rediriger vers login
 * via `requireUser()` — même UX, juste une couche plus tard.
 *
 * Ordre :
 *   1. `updateSession` rafraîchit la session Supabase (cookies renouvelés)
 *   2. next-intl gère le routing par locale
 *   3. On fusionne les cookies Supabase dans la réponse i18n
 */
const intlMiddleware = createIntlMiddleware({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeDetection: true,
});

export default async function middleware(request: NextRequest) {
  const { response: supabaseResponse } = await updateSession(request);

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
