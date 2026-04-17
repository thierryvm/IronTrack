'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { sendMagicLink, type LoginState } from './actions';

const initial: LoginState = { status: 'idle' };

export function LoginForm() {
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  if (state.status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-border bg-card p-6 text-foreground"
      >
        <h2 className="font-display text-2xl">{t('checkEmail.title')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('checkEmail.body')}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t('form.email.label')}</Label>
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
          className="min-h-[44px]"
        />
        {state.status === 'error' && state.error && (
          <p
            id="email-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {t(state.error.replace('auth.', '') as 'errors.emailInvalid')}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="min-h-[44px] w-full"
      >
        {pending ? t('form.submitPending') : t('form.submit')}
      </Button>

      <p className="text-xs text-muted-foreground">{t('form.hint')}</p>
    </form>
  );
}
