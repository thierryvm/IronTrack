'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/request';
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
  | 'profile.errors.rateLimit'
  | 'profile.errors.generic';

export interface ProfileState {
  status: 'idle' | 'success' | 'error';
  error?: ProfileErrorKey;
  field?: 'pseudo' | 'full_name' | 'form';
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
