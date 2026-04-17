'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  isAvatarMimeType,
} from '@/lib/profile/avatar';

import {
  removeAvatar,
  uploadAvatar,
  type AvatarState,
} from './actions';

const initial: AvatarState = { status: 'idle' };

interface AvatarUploaderProps {
  locale: string;
  displayName: string;
  initialAvatarUrl: string | null;
}

export function AvatarUploader({
  locale,
  displayName,
  initialAvatarUrl,
}: AvatarUploaderProps) {
  const t = useTranslations('profile');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);

  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadAvatar,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeAvatar,
    initial,
  );

  // Sync preview après succès server
  useEffect(() => {
    if (uploadState.status === 'success') {
      setPreviewUrl(uploadState.avatarUrl ?? null);
      setClientError(null);
    }
  }, [uploadState]);
  useEffect(() => {
    if (removeState.status === 'success') {
      setPreviewUrl(null);
      setClientError(null);
    }
  }, [removeState]);

  const serverError =
    uploadState.status === 'error' ? uploadState.error :
    removeState.status === 'error' ? removeState.error :
    null;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
      <Avatar src={previewUrl} displayName={displayName} size="xl" />

      <div className="flex flex-col gap-3">
        <form
          ref={formRef}
          action={uploadAction}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="locale" value={locale} />
          <input
            ref={fileRef}
            type="file"
            name="avatar"
            accept={AVATAR_MIME_TYPES.join(',')}
            className="sr-only"
            aria-label={t('avatar.pick')}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;

              // Validation client (évite un aller-retour serveur)
              if (f.size > AVATAR_MAX_BYTES) {
                setClientError(t('errors.avatarTooLarge'));
                e.target.value = '';
                return;
              }
              if (!isAvatarMimeType(f.type)) {
                setClientError(t('errors.avatarMimeType'));
                e.target.value = '';
                return;
              }
              setClientError(null);
              formRef.current?.requestSubmit();
            }}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={uploadPending || removePending}
              onClick={() => fileRef.current?.click()}
              className="min-h-[44px] border-2 border-foreground px-5 font-mono text-xs uppercase tracking-widest"
            >
              {uploadPending
                ? t('avatar.uploading')
                : previewUrl
                  ? t('avatar.replace')
                  : t('avatar.pick')}
            </Button>

            {previewUrl && (
              <form action={removeAction}>
                <input type="hidden" name="locale" value={locale} />
                <Button
                  type="submit"
                  variant="ghost"
                  disabled={uploadPending || removePending}
                  className="min-h-[44px] px-3 font-mono text-xs uppercase tracking-widest"
                >
                  {removePending ? t('avatar.removing') : t('avatar.remove')}
                </Button>
              </form>
            )}
          </div>
        </form>

        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {t('avatar.help')}
        </p>

        {clientError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {clientError}
          </p>
        )}
        {!clientError && serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {t(serverError.replace('profile.', '') as 'errors.generic')}
          </p>
        )}
      </div>
    </div>
  );
}
