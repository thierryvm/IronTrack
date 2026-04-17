import type { User } from '@supabase/supabase-js';

import { createServerClient, type Tables } from '@/lib/supabase';

/**
 * Profile v2.
 *
 * La table `profiles` legacy v1 contient déjà ~25 colonnes. Pour le v2 on
 * n'utilise que ce sous-ensemble (pseudo, full_name, avatar_url, locale,
 * email). Les autres colonnes sont héritées mais non éditées ici.
 *
 * `locale` a été ajouté par la migration 20260417120457 : le type généré peut
 * être périmé → on étend explicitement.
 */
export type Profile = Tables<'profiles'> & {
  locale?: string | null;
};

/**
 * Récupère le profil courant (ligne `profiles` de l'utilisateur connecté).
 * Renvoie `null` si l'utilisateur n'est pas connecté ou si le profil n'existe
 * pas encore (le trigger `handle_new_user` le crée normalement au signup).
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    // Ne pas casser la page si la lecture échoue (ex: RLS mal configuré en dev).
    // Les pages appelantes retombent sur l'email de l'utilisateur.
    console.error('[getProfile] Supabase error:', error.message);
    return null;
  }
  return (data ?? null) as Profile | null;
}

/**
 * Nom à afficher dans l'UI. Priorité :
 *   1. pseudo (handle @xxx)
 *   2. full_name (nom complet)
 *   3. partie locale de l'email (avant @)
 *   4. "you" (fallback ultime)
 */
export function getDisplayName(
  profile: Profile | null,
  user: Pick<User, 'email'> | null,
): string {
  const pseudo = profile?.pseudo?.trim();
  if (pseudo) return pseudo;

  const fullName = profile?.full_name?.trim();
  if (fullName) return fullName;

  const email = user?.email ?? profile?.email ?? null;
  if (email && email.includes('@')) {
    return email.split('@')[0] ?? email;
  }
  return email ?? 'you';
}

/**
 * Indique si le profil a besoin d'un onboarding v2 (aucun pseudo ni nom
 * complet défini). Utilisé par le dashboard pour afficher un prompt inline.
 */
export function needsProfileOnboarding(profile: Profile | null): boolean {
  if (!profile) return true;
  return !profile.pseudo && !profile.full_name;
}
