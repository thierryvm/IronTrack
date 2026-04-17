'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { updateProfile, type ProfileState } from './actions';

const initial: ProfileState = { status: 'idle' };

interface ProfileFormProps {
  locale: string;
  initialPseudo: string | null;
  initialFullName: string | null;
}

export function ProfileForm({
  locale,
  initialPseudo,
  initialFullName,
}: ProfileFormProps) {
  const t = useTranslations('profile');
  const [state, action, pending] = useActionState(updateProfile, initial);
  const successRef = useRef<HTMLParagraphElement | null>(null);

  // Petit focus management : on annonce la réussite.
  useEffect(() => {
    if (state.status === 'success' && successRef.current) {
      successRef.current.focus();
    }
  }, [state.status]);

  return (
    <form action={action} noValidate className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="pseudo"
          className="font-mono text-xs uppercase tracking-widest"
        >
          {t('form.pseudo.label')}
        </Label>
        <Input
          id="pseudo"
          name="pseudo"
          type="text"
          autoComplete="username"
          inputMode="text"
          defaultValue={initialPseudo ?? ''}
          minLength={3}
          maxLength={30}
          pattern="[a-z0-9_]{3,30}"
          aria-invalid={state.status === 'error' && state.field === 'pseudo'}
          aria-describedby="pseudo-help"
          placeholder={t('form.pseudo.placeholder')}
          className="min-h-[48px] border-2 border-foreground text-base"
        />
        <p
          id="pseudo-help"
          className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          {t('form.pseudo.help')}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="full_name"
          className="font-mono text-xs uppercase tracking-widest"
        >
          {t('form.fullName.label')}
        </Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          defaultValue={initialFullName ?? ''}
          maxLength={50}
          aria-invalid={state.status === 'error' && state.field === 'full_name'}
          aria-describedby="full-name-help"
          placeholder={t('form.fullName.placeholder')}
          className="min-h-[48px] border-2 border-foreground text-base"
        />
        <p
          id="full-name-help"
          className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          {t('form.fullName.help')}
        </p>
      </div>

      {state.status === 'error' && state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {t(state.error.replace('profile.', '') as 'errors.generic')}
        </p>
      )}

      {state.status === 'success' && (
        <p
          ref={successRef}
          role="status"
          tabIndex={-1}
          className="text-sm font-medium text-foreground"
          style={{ color: 'var(--color-acid, currentColor)' }}
        >
          {t('form.saved')}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="min-h-[48px] w-full bg-foreground text-base font-medium text-background hover:bg-foreground/90 sm:w-auto sm:self-start sm:px-8"
      >
        {pending ? t('form.submitPending') : t('form.submit')}
      </Button>
    </form>
  );
}
