'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/request';
import {
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
  buildAvatarPath,
  isAvatarMimeType,
  pathFromPublicUrl,
} from '@/lib/profile/avatar';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { profileFormSchema } from '@/lib/profile/schema';
import { createServerClient } from '@/lib/supabase';

export type ProfileErrorKey =
  | 'profile.errors.pseudoTooShort'
  | 'profile.errors.pseudoTooLong'
  | 'profile.errors.pseudoFormat'
  | 'profile.errors.pseudoTaken'
  | 'profile.errors.fullNameRequired'
  | 'profile.errors.fullNameTooLong'
  | 'profile.errors.avatarTooLarge'
  | 'profile.errors.avatarMimeType'
  | 'profile.errors.avatarUpload'
  | 'profile.errors.rateLimit'
  | 'profile.errors.generic';

export interface ProfileState {
  status: 'idle' | 'success' | 'error';
  error?: ProfileErrorKey;
  field?: 'pseudo' | 'full_name' | 'avatar' | 'form';
}

export interface AvatarState {
  status: 'idle' | 'success' | 'error';
  error?: ProfileErrorKey;
  /** URL publique fraîche (avec cache-buster) après un upload réussi. */
  avatarUrl?: string | null;
}

function isLocale(l: string): l is Locale {
  return (LOCALES as readonly string[]).includes(l);
}

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const { ok } = rateLimit(`profile:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!ok) {
    return { status: 'error', error: 'profile.errors.rateLimit', field: 'form' };
  }

  const rawLocale = String(formData.get('locale') ?? '');
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const parsed = profileFormSchema.safeParse({
    pseudo: formData.get('pseudo'),
    full_name: formData.get('full_name'),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0];
    return {
      status: 'error',
      error: (issue?.message ?? 'profile.errors.generic') as ProfileErrorKey,
      field: field === 'pseudo' || field === 'full_name' ? field : 'form',
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { pseudo, full_name } = parsed.data;

  const { error } = await supabase
    .from('profiles')
    .update({ pseudo, full_name })
    .eq('id', user.id);

  if (error) {
    // Postgres 23505 : unique_violation (pseudo déjà pris, case-insensitive)
    // Message type : "duplicate key value violates unique constraint"
    if (error.code === '23505' || /duplicate key|unique constraint/i.test(error.message)) {
      return { status: 'error', error: 'profile.errors.pseudoTaken', field: 'pseudo' };
    }
    return { status: 'error', error: 'profile.errors.generic', field: 'form' };
  }

  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}`);

  return { status: 'success' };
}

/**
 * Upload d'un avatar dans le bucket Storage `avatars`.
 *
 * Sécurité :
 *   - Auth obligatoire
 *   - Rate-limit 5 / 60s par IP (contre abus storage)
 *   - Validation taille (5 MB) + mime (jpeg/png/webp/gif)
 *   - Path forcé `${userId}/uuid.ext` (RLS bucket le requiert)
 *   - L'ancien fichier (s'il existait) est supprimé après succès
 *
 * Retour : nouvelle URL publique avec cache-buster `?v=Date.now()`.
 */
export async function uploadAvatar(
  _prev: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const { ok } = rateLimit(`avatar:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return { status: 'error', error: 'profile.errors.rateLimit' };
  }

  const rawLocale = String(formData.get('locale') ?? '');
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const file = formData.get('avatar');
  if (!(file instanceof File) || file.size === 0) {
    return { status: 'error', error: 'profile.errors.generic' };
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return { status: 'error', error: 'profile.errors.avatarTooLarge' };
  }
  if (!isAvatarMimeType(file.type)) {
    return { status: 'error', error: 'profile.errors.avatarMimeType' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Ancienne URL (pour cleanup après succès)
  const { data: current } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  const previousPath = pathFromPublicUrl(current?.avatar_url);

  const path = buildAvatarPath(user.id, file.type);
  const { error: uploadErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    console.error('[uploadAvatar] storage error:', uploadErr.message);
    return { status: 'error', error: 'profile.errors.avatarUpload' };
  }

  const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateErr) {
    // Cleanup : on tente de retirer le fichier qu'on vient d'uploader pour
    // éviter un orphelin.
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    return { status: 'error', error: 'profile.errors.generic' };
  }

  // Cleanup ancien avatar (best-effort, on ignore les erreurs)
  if (previousPath && previousPath !== path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([previousPath]);
  }

  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}`);

  return {
    status: 'success',
    avatarUrl: `${publicUrl}?v=${Date.now()}`,
  };
}

/**
 * Supprime l'avatar : clear `profiles.avatar_url` + delete du fichier storage.
 */
export async function removeAvatar(
  _prev: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const { ok } = rateLimit(`avatar:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return { status: 'error', error: 'profile.errors.rateLimit' };
  }

  const rawLocale = String(formData.get('locale') ?? '');
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: current } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  const path = pathFromPublicUrl(current?.avatar_url);

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id);

  if (updateErr) {
    return { status: 'error', error: 'profile.errors.generic' };
  }

  // Cleanup best-effort
  if (path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  }

  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}`);

  return { status: 'success', avatarUrl: null };
}
