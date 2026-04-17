import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { Locale } from '@/i18n/request';

interface ManifestoProps {
  locale: Locale;
  isAuthenticated: boolean;
}

export function HomeManifesto({ locale, isAuthenticated }: ManifestoProps) {
  const t = useTranslations('home.manifesto');

  return (
    <section
      className="mt-32 -mx-8 px-8 py-24 md:px-16 md:py-32"
      style={{
        background: 'var(--color-foreground)',
        color: 'var(--color-background)',
      }}
    >
      <div className="mx-auto max-w-4xl">
        <p
          className="font-mono text-xs uppercase tracking-[0.3em]"
          style={{ color: 'var(--color-acid)' }}
        >
          {t('eyebrow')}
        </p>
        <blockquote className="display mt-8 text-[clamp(40px,6vw,72px)] leading-[1.05]">
          {t('quote')}
        </blockquote>
        <p
          className="mt-8 max-w-2xl text-base leading-relaxed"
          style={{
            color:
              'color-mix(in oklab, var(--color-background) 75%, transparent)',
          }}
        >
          {t('body')}
        </p>

        <div className="mt-12">
          <Link
            href={isAuthenticated ? `/${locale}/dashboard` : `/${locale}/login`}
            className="group inline-flex min-h-12 items-center gap-2 rounded-full px-7 py-3 font-semibold transition-transform hover:-translate-y-[1px]"
            style={{
              background: 'var(--color-brand)',
              color: 'var(--color-primary-foreground)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {t(isAuthenticated ? 'cta.dashboard' : 'cta.start')}
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
