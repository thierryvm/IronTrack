'use server';

import { redirect } from 'next/navigation';

import { DEFAULT_LOCALE, type Locale } from '@/i18n/request';
import { createServerClient } from '@/lib/supabase';

/**
 * Server Action : déconnexion + redirect vers la home locale.
 */
export async function signOut(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as Locale) ?? DEFAULT_LOCALE;
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
