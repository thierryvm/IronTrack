import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LOCALES, type Locale } from '@/i18n/request';
import { requireUser } from '@/lib/auth';
import { getDisplayName, getProfile } from '@/lib/profile';

import { signOut } from '../actions';
import { AvatarUploader } from './avatar-uploader';
import { ProfileForm } from './profile-form';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  const t = await getTranslations({ locale: typedLocale, namespace: 'profile' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);

  const user = await requireUser(typedLocale);
  const profile = await getProfile();
  const displayName = getDisplayName(profile, user);
  const t = await getTranslations({ locale: typedLocale, namespace: 'profile' });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-foreground">
            {t('title')}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            {t('lede', { email: user.email ?? '' })}
          </p>
        </div>
        <form action={signOut}>
          <input type="hidden" name="locale" value={typedLocale} />
          <button
            type="submit"
            className="min-h-[44px] border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-muted"
          >
            {t('logout')}
          </button>
        </form>
      </header>

      <section className="mb-8 border-2 border-foreground p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t('avatar.label')}
        </p>
        <h2 className="mt-3 mb-6 font-display text-2xl leading-snug text-foreground">
          {t('avatar.heading')}
        </h2>

        <AvatarUploader
          locale={typedLocale}
          displayName={displayName}
          initialAvatarUrl={profile?.avatar_url ?? null}
        />
      </section>

      <section className="border-2 border-foreground p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t('section.label')}
        </p>
        <h2 className="mt-3 mb-6 font-display text-2xl leading-snug text-foreground">
          {t('section.heading')}
        </h2>

        <ProfileForm
          locale={typedLocale}
          initialPseudo={profile?.pseudo ?? null}
          initialFullName={profile?.full_name ?? null}
        />
      </section>

      <nav className="mt-10 flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest">
        <Link
          href={`/${typedLocale}/dashboard`}
          className="underline-offset-4 hover:underline"
        >
          ← {t('nav.dashboard')}
        </Link>
        <Link
          href={`/${typedLocale}`}
          className="underline-offset-4 hover:underline"
        >
          {t('nav.home')}
        </Link>
      </nav>
    </main>
  );
}
