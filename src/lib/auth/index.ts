import { redirect } from 'next/navigation';

import { DEFAULT_LOCALE, type Locale } from '@/i18n/request';
import { createServerClient } from '@/lib/supabase';

/**
 * Récupère l'utilisateur courant côté serveur.
 * Renvoie `null` si non connecté.
 */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Garde de route serveur : redirige vers /<locale>/login si non connecté.
 * À utiliser en haut des `page.tsx` / `layout.tsx` protégés.
 */
export async function requireUser(locale: Locale = DEFAULT_LOCALE) {
  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  return user;
}
