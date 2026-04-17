import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Avatar } from '@/components/avatar';
import type { Locale } from '@/i18n/request';

interface HeroProps {
  locale: Locale;
  isAuthenticated: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export function HomeHero({
  locale,
  isAuthenticated,
  displayName,
  avatarUrl,
}: HeroProps) {
  const t = useTranslations('home.hero');

  return (
    <section
      className="rise grid items-end gap-12 border-b pb-16 md:grid-cols-[1.2fr_1fr]"
      style={{ borderColor: 'var(--color-border)', animationDelay: '0.15s' }}
    >
      <div>
        <span className="eyebrow">{t('kicker')}</span>
        <h1 className="display mt-6 text-[clamp(56px,10vw,128px)] leading-[0.95]">
          {t('train')}{' '}
          <span
            className="display-italic"
            style={{ color: 'var(--color-brand)' }}
          >
            {t('heavier')}
          </span>
          <br />
          <span className="relative inline-block">
            <span className="relative z-10">{t('live')}</span>
            <span
              aria-hidden
              className="absolute bottom-[0.08em] left-0 right-0 h-3 -skew-x-[8deg]"
              style={{ background: 'var(--color-acid)', zIndex: -1 }}
            />
          </span>{' '}
          {t('lighter')}
        </h1>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href={`/${locale}/dashboard`}
                className="group inline-flex min-h-12 items-center gap-2 rounded-full px-7 py-3 font-semibold transition-transform hover:-translate-y-[1px]"
                style={{
                  background: 'var(--color-brand)',
                  color: 'var(--color-primary-foreground)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {t('cta.dashboard')}
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              {displayName && (
                <Link
                  href={`/${locale}/profile`}
                  className="inline-flex min-h-11 items-center gap-2 py-2 font-mono text-xs uppercase tracking-widest underline-offset-4 hover:underline"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  <Avatar
                    src={avatarUrl}
                    displayName={displayName}
                    size="sm"
                    decorative
                  />
                  {displayName}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/login`}
                className="group inline-flex min-h-12 items-center gap-2 rounded-full px-7 py-3 font-semibold transition-transform hover:-translate-y-[1px]"
                style={{
                  background: 'var(--color-brand)',
                  color: 'var(--color-primary-foreground)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {t('cta.start')}
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="#features"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border px-6 py-3 font-semibold transition-colors hover:bg-[var(--color-muted)]"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {t('cta.discover')}
              </Link>
            </>
          )}
        </div>
      </div>

      <p
        className="display-italic text-xl leading-snug md:max-w-md"
        style={{
          color:
            'color-mix(in oklab, var(--color-foreground) 80%, transparent)',
        }}
      >
        {t('lede')}
      </p>
    </section>
  );
}
