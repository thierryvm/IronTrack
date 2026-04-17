'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { GoogleIcon } from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { sendMagicLink, signInWithGoogle, type LoginState } from './actions';

const initial: LoginState = { status: 'idle' };

export function LoginForm() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const [state, action, pending] = useActionState(sendMagicLink, initial);

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
