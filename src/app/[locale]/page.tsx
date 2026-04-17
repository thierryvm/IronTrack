import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LangSwitcher } from '@/components/lang-switcher';
import { LOCALES, type Locale } from '@/i18n/request';
import { getUser } from '@/lib/auth';

import { signOut } from './actions';
import { HomeFeatures } from './_home/features';
import { HomeHero } from './_home/hero';
import { HomeHow } from './_home/how';
import { HomeManifesto } from './_home/manifesto';
import { HomeVs } from './_home/vs';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const typedLocale: Locale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);

  const t = await getTranslations('home');
  const user = await getUser();

  return (
    <>
      <main className="mx-auto max-w-7xl px-6 pb-32 pt-12 md:px-8">
        <header className="rise flex items-center justify-between gap-6">
          <span className="eyebrow inline-flex items-center">
            <span
              aria-hidden
              className="mr-3 inline-block h-3 w-3 rotate-45 align-[-1px]"
              style={{ background: 'var(--color-brand)' }}
            />
            {t('eyebrow')}
          </span>
          <div className="flex items-center gap-5">
            {user && (
              <form action={signOut} className="hidden sm:block">
                <input type="hidden" name="locale" value={typedLocale} />
                <button
                  type="submit"
                  className="font-mono text-xs uppercase tracking-widest underline-offset-4 hover:underline"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {t('cta.logout')}
                </button>
              </form>
            )}
            <LangSwitcher />
          </div>
        </header>

        <div className="mt-20">
          <HomeHero
            locale={typedLocale}
            isAuthenticated={Boolean(user)}
            userEmail={user?.email}
          />
        </div>

        <HomeFeatures />

        <HomeHow />

        <HomeVs />
      </main>

      <HomeManifesto locale={typedLocale} isAuthenticated={Boolean(user)} />

      <footer
        className="mx-auto max-w-7xl px-6 py-12 md:px-8"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="eyebrow">{t('footer.copyright')}</p>
          <p
            className="display-italic text-2xl"
            style={{
              color:
                'color-mix(in oklab, var(--color-foreground) 60%, transparent)',
            }}
          >
            {t('footer.quote')}
          </p>
          <p className="eyebrow">{t('footer.build')}</p>
        </div>
      </footer>
    </>
  );
}
