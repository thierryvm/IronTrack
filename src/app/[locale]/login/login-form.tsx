'use client';

import { useActionState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { GoogleIcon } from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

import { sendMagicLink, signInWithGoogle, type LoginState } from './actions';

const initial: LoginState = { status: 'idle' };

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  // Cross-tab auth: si l'utilisateur clique le magic link dans un nouvel onglet,
  // Supabase synchronise la session via BroadcastChannel — on redirige cet onglet aussi.
  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
        const target = safeNext === '/' ? `/${locale}/dashboard` : safeNext;
        router.replace(target);
        router.refresh();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router, locale, next]);

  if (state.status === 'success') {
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

      {/* Magic link email */}
      <form action={action} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="font-mono text-xs uppercase tracking-widest">
            {t('form.email.label')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-invalid={state.status === 'error'}
            aria-describedby={state.status === 'error' ? 'email-error' : undefined}
            placeholder={t('form.email.placeholder')}
            className="min-h-[48px] border-2 border-foreground text-base"
          />
          {state.status === 'error' && state.error && (
            <p
              id="email-error"
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {t(state.error.replace('auth.', '') as 'errors.emailInvalid')}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="min-h-[48px] w-full bg-foreground text-base font-medium text-background hover:bg-foreground/90"
        >
          {pending ? t('form.submitPending') : t('form.submit')}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('form.hint')}
        </p>
      </form>
    </div>
  );
}
