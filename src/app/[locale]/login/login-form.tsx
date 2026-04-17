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
  sendMagicLink,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  type LoginState,
} from './actions';

const initial: LoginState = { status: 'idle' };

type Tab = 'password' | 'magic';
type Mode = 'signin' | 'signup';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [tab, setTab] = useState<Tab>('password');
  const [mode, setMode] = useState<Mode>('signin');

  const [magicState, magicAction, magicPending] = useActionState(
    sendMagicLink,
    initial,
  );
  const [pwdState, pwdAction, pwdPending] = useActionState(
    mode === 'signin' ? signInWithPassword : signUpWithPassword,
    initial,
  );

  // Cross-tab auth : si le user clique le magic link dans un autre onglet,
  // BroadcastChannel synchronise la session — on redirige cet onglet aussi.
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

  if (magicState.status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-2 border-foreground bg-card p-6 text-foreground"
      >
        <h2 className="font-display text-2xl leading-tight">
          {t('checkEmail.title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('checkEmail.body')}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {t('checkEmail.hint')}
        </p>
      </div>
    );
  }

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

      {/* Tabs : password / magic link */}
      <div
        role="tablist"
        aria-label={t('tabs.label')}
        className="grid grid-cols-2 border-2 border-foreground"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'password'}
          onClick={() => setTab('password')}
          className="min-h-[44px] font-mono text-xs uppercase tracking-widest transition-colors"
          style={{
            background:
              tab === 'password'
                ? 'var(--color-foreground)'
                : 'transparent',
            color:
              tab === 'password'
                ? 'var(--color-background)'
                : 'var(--color-foreground)',
          }}
        >
          {t('tabs.password')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'magic'}
          onClick={() => setTab('magic')}
          className="min-h-[44px] font-mono text-xs uppercase tracking-widest transition-colors"
          style={{
            background:
              tab === 'magic' ? 'var(--color-foreground)' : 'transparent',
            color:
              tab === 'magic'
                ? 'var(--color-background)'
                : 'var(--color-foreground)',
            borderLeft: '2px solid var(--color-foreground)',
          }}
        >
          {t('tabs.magic')}
        </button>
      </div>

      {tab === 'password' ? (
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
            <p
              role="alert"
              className="text-sm font-medium text-destructive"
            >
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
      ) : (
        <form
          action={magicAction}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="magic-email"
              className="font-mono text-xs uppercase tracking-widest"
            >
              {t('form.email.label')}
            </Label>
            <Input
              id="magic-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              aria-invalid={magicState.status === 'error'}
              aria-describedby={
                magicState.status === 'error' ? 'magic-error' : undefined
              }
              placeholder={t('form.email.placeholder')}
              className="min-h-[48px] border-2 border-foreground text-base"
            />
            {magicState.status === 'error' && magicState.error && (
              <p
                id="magic-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {t(
                  magicState.error.replace(
                    'auth.',
                    '',
                  ) as 'errors.emailInvalid',
                )}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={magicPending}
            className="min-h-[48px] w-full bg-foreground text-base font-medium text-background hover:bg-foreground/90"
          >
            {magicPending ? t('form.submitPending') : t('form.submit')}
          </Button>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('form.hint')}
          </p>
        </form>
      )}
    </div>
  );
}
