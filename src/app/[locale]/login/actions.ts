'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { credentialsSchema, magicLinkSchema } from '@/lib/auth/schema';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { createServerClient } from '@/lib/supabase';

export type LoginErrorKey =
  | 'auth.errors.emailRequired'
  | 'auth.errors.emailInvalid'
  | 'auth.errors.passwordTooShort'
  | 'auth.errors.passwordTooLong'
  | 'auth.errors.passwordWeak'
  | 'auth.errors.invalidCredentials'
  | 'auth.errors.emailTaken'
  | 'auth.errors.rateLimit'
  | 'auth.errors.generic';

export interface LoginState {
  status: 'idle' | 'success' | 'error';
  error?: LoginErrorKey;
  field?: 'email' | 'password' | 'form';
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

/**
 * Server Action : démarre le flow OAuth Google.
 *
 * Sécurité :
 *   - Rate-limit 10 req / 60s par IP
 *   - PKCE géré côté Supabase
 *   - `redirectTo` validé contre la redirect-allow-list Supabase
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const { ok } = rateLimit(`oauth:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!ok) {
    redirect('/auth/error');
  }

  const next = formData.get('next');
  const safeNext =
    typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
      ? next
      : '/';

  const supabase = await createServerClient();
  const origin =
    headerList.get('origin') ??
    `https://${headerList.get('host') ?? 'iron-track-dusky.vercel.app'}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error || !data.url) {
    redirect('/auth/error');
  }

  redirect(data.url);
}

/**
 * Server Action : sign-in classique email + password.
 * Sécurité : rate-limit 10/min/IP, message générique en cas d'échec
 * (pas d'enumération entre "mauvais mdp" et "user inexistant").
 */
export async function signInWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const { ok } = rateLimit(`pwd-in:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!ok) {
    return { status: 'error', error: 'auth.errors.rateLimit', field: 'form' };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const msg = issue?.message as LoginErrorKey | undefined;
    const field = (issue?.path[0] as 'email' | 'password' | undefined) ?? 'form';
    return {
      status: 'error',
      error: msg ?? 'auth.errors.invalidCredentials',
      field,
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: 'error',
      error: 'auth.errors.invalidCredentials',
      field: 'form',
    };
  }

  const next = formData.get('next');
  const safeNext =
    typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
      ? next
      : '/';
  redirect(safeNext);
}

/**
 * Server Action : sign-up email + password.
 * Avec mailer_autoconfirm=true côté Supabase, le user est connecté direct
 * sans email de confirmation.
 */
export async function signUpWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const { ok } = rateLimit(`pwd-up:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return { status: 'error', error: 'auth.errors.rateLimit', field: 'form' };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const msg = issue?.message as LoginErrorKey | undefined;
    const field = (issue?.path[0] as 'email' | 'password' | undefined) ?? 'form';
    return {
      status: 'error',
      error: msg ?? 'auth.errors.passwordWeak',
      field,
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Supabase renvoie "User already registered" en clair → on map sur clé i18n.
    const isTaken = /already|exists|registered/i.test(error.message);
    return {
      status: 'error',
      error: isTaken ? 'auth.errors.emailTaken' : 'auth.errors.generic',
      field: isTaken ? 'email' : 'form',
    };
  }

  const next = formData.get('next');
  const safeNext =
    typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
      ? next
      : '/';
  redirect(safeNext);
}
