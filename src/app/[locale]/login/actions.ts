'use server';

import { headers } from 'next/headers';

import { magicLinkSchema } from '@/lib/auth/schema';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { createServerClient } from '@/lib/supabase';

export interface LoginState {
  status: 'idle' | 'success' | 'error';
  error?:
    | 'auth.errors.emailRequired'
    | 'auth.errors.emailInvalid'
    | 'auth.errors.rateLimit'
    | 'auth.errors.generic';
}

/**
 * Server Action : envoie un magic link OTP via Supabase.
 *
 * Sécurité :
 *   - Validation Zod stricte
 *   - Rate-limit 5 req / 60s par IP (anti-bruteforce + anti-spam mail)
 *   - Pas d'enumération de comptes : `shouldCreateUser: true` + même message
 */
export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const { ok } = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return { status: 'error', error: 'auth.errors.rateLimit' };
  }

  const parsed = magicLinkSchema.safeParse({
    email: formData.get('email'),
  });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return {
      status: 'error',
      error:
        firstError === 'auth.errors.emailRequired' ||
        firstError === 'auth.errors.emailInvalid'
          ? firstError
          : 'auth.errors.emailInvalid',
    };
  }

  const supabase = await createServerClient();
  const origin =
    headerList.get('origin') ??
    `https://${headerList.get('host') ?? 'iron-track-dusky.vercel.app'}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: 'error', error: 'auth.errors.generic' };
  }

  return { status: 'success' };
}
