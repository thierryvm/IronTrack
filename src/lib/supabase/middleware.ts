import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import type { Database } from './types';

/**
 * Refresh la session Supabase côté middleware.
 * Doit être appelé sur toutes les routes pour garder les cookies à jour.
 *
 * Renvoie :
 *   - `response` : NextResponse à fusionner avec les autres réponses (i18n, etc.)
 *   - `user`     : utilisateur connecté ou `null`
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT : ne PAS exécuter de code entre createServerClient et getUser.
  // Cela invaliderait le refresh token (cf. docs Supabase SSR).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
