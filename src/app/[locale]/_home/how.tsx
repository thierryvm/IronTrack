import { useTranslations } from 'next-intl';

const STEPS = ['log', 'track', 'progress'] as const;

export function HomeHow() {
  const t = useTranslations('home.how');

  return (
    <section className="mt-32">
      <header
        className="flex items-end justify-between gap-6 border-b pb-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2 className="display text-4xl md:text-5xl">{t('heading')}</h2>
        <span className="eyebrow hidden md:inline">{t('eyebrow')}</span>
      </header>

      <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-16">
        {STEPS.map((step, i) => (
          <li key={step} className="flex flex-col gap-4">
            <span
              className="display text-[120px] leading-none"
              style={{
                color:
                  'color-mix(in oklab, var(--color-brand) 100%, transparent)',
                opacity: 0.85,
              }}
              aria-hidden
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="display text-2xl leading-tight">
              {t(`${step}.title`)}
            </h3>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {t(`${step}.body`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
