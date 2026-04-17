'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { GoogleIcon } from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  type LoginState,
} from './actions';

const initial: LoginState = { status: 'idle' };

type Mode = 'signin' | 'signup';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [mode, setMode] = useState<Mode>('signin');

  const [pwdState, pwdAction, pwdPending] = useActionState(
    mode === 'signin' ? signInWithPassword : signUpWithPassword,
    initial,
  );

  // Sync cross-onglet : OAuth Google ouvre un onglet de redirect, on récupère
  // la session ici dès qu'elle est posée et on redirige.
  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const safeNext =
          next.startsWith('/') && !next.startsWith('//') ? next : '/';
        const target = safeNext === '/' ? `/${locale}/dashboard` : safeNext;
        router.replace(target);
        router.refresh();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router, locale, next]);

  return (
    <div className="flex flex-col gap-6">
      {/* OAuth Google */}
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <Button
          type="submit"
          variant="outline"
          className="min-h-[48px] w-full justify-center gap-3 border-2 border-foreground bg-background text-base font-medium hover:bg-foreground/5"
        >
          <GoogleIcon className="size-5" />
          {t('oauth.google')}
        </Button>
      </form>

      {/* Séparateur */}
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t('oauth.or')}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Email + password */}
      <form action={pwdAction} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="font-mono text-xs uppercase tracking-widest"
          >
            {t('form.email.label')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-invalid={
              pwdState.status === 'error' && pwdState.field === 'email'
            }
            placeholder={t('form.email.placeholder')}
            className="min-h-[48px] border-2 border-foreground text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="font-mono text-xs uppercase tracking-widest"
          >
            {t('form.password.label')}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === 'signin' ? 'current-password' : 'new-password'
            }
            required
            minLength={10}
            aria-invalid={
              pwdState.status === 'error' && pwdState.field === 'password'
            }
            aria-describedby="password-help"
            placeholder={t('form.password.placeholder')}
            className="min-h-[48px] border-2 border-foreground text-base"
          />
          <p
            id="password-help"
            className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
          >
            {t('form.password.help')}
          </p>
        </div>

        {pwdState.status === 'error' && pwdState.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {t(
              pwdState.error.replace(
                'auth.',
                '',
              ) as 'errors.invalidCredentials',
            )}
          </p>
        )}

        <Button
          type="submit"
          disabled={pwdPending}
          className="min-h-[48px] w-full bg-foreground text-base font-medium text-background hover:bg-foreground/90"
        >
          {pwdPending
            ? t('form.submitPending')
            : mode === 'signin'
              ? t('form.signin')
              : t('form.signup')}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="self-start font-mono text-xs uppercase tracking-widest underline-offset-4 hover:underline"
        >
          {mode === 'signin' ? t('form.toSignup') : t('form.toSignin')}
        </button>
      </form>
    </div>
  );
}
