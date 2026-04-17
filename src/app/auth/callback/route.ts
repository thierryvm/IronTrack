import { NextResponse, type NextRequest } from 'next/server';

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/request';
import { createServerClient } from '@/lib/supabase';

/**
 * Callback OAuth / Magic Link.
 *
 * Supabase appelle cette route avec :
 *   - `?code=...`  (PKCE / OAuth)        → exchangeCodeForSession
 *   - `?token_hash=...&type=...` (OTP)   → verifyOtp
 *
 * Redirige ensuite vers `next` (sanitisé) ou `/<locale>` par défaut.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  // Anti open-redirect : on n'accepte que les chemins relatifs internes
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  // Locale depuis le path de `next` ou défaut
  const localeMatch = safeNext.match(/^\/([a-z]{2})(\/|$)/);
  const locale: Locale =
    localeMatch && (LOCALES as readonly string[]).includes(localeMatch[1]!)
      ? (localeMatch[1] as Locale)
      : DEFAULT_LOCALE;

  const supabase = await createServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext === '/' ? `/${locale}` : safeNext}`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'magiclink' | 'recovery' | 'invite' | 'signup',
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext === '/' ? `/${locale}` : safeNext}`);
    }
  }

  // Échec → page d'erreur
  return NextResponse.redirect(`${origin}/${locale}/auth/error`);
}
