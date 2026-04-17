import { useTranslations } from 'next-intl';
import { Activity, BarChart3, Apple, Sparkles } from 'lucide-react';

const FEATURE_KEYS = ['logging', 'progress', 'nutrition', 'coach'] as const;

const ICONS = {
  logging: Activity,
  progress: BarChart3,
  nutrition: Apple,
  coach: Sparkles,
} as const;

const ACCENTS = {
  logging: 'var(--color-brand)',
  progress: 'var(--color-acid)',
  nutrition: 'var(--color-azure)',
  coach: 'var(--color-amber)',
} as const;

export function HomeFeatures() {
  const t = useTranslations('home.features');

  return (
    <section id="features" className="mt-32">
      <header
        className="flex items-end justify-between gap-6 border-b pb-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2 className="display text-4xl md:text-5xl">
          {t('heading')}{' '}
          <em
            className="display-italic"
            style={{ color: 'var(--color-brand)' }}
          >
            {t('headingAccent')}
          </em>
        </h2>
        <span className="eyebrow hidden md:inline">{t('eyebrow')}</span>
      </header>

      <div className="mt-12 grid gap-px bg-[var(--color-border)] md:grid-cols-2">
        {FEATURE_KEYS.map((key) => {
          const Icon = ICONS[key];
          return (
            <article
              key={key}
              className="group relative flex flex-col gap-5 p-8 transition-colors md:p-10"
              style={{ background: 'var(--color-background)' }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex size-12 items-center justify-center rounded-xs"
                  style={{ background: ACCENTS[key], color: 'var(--color-ink)' }}
                  aria-hidden
                >
                  <Icon className="size-6" strokeWidth={2.2} />
                </span>
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {t(`${key}.tag`)}
                </span>
              </div>

              <h3 className="display text-3xl leading-tight">
                {t(`${key}.title`)}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {t(`${key}.body`)}
              </p>

              <ul
                className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-widest"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {[1, 2, 3].map((i) => (
                  <li
                    key={i}
                    className="rounded-full border px-3 py-1"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {t(`${key}.bullet${i}`)}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
