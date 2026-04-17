import { useTranslations } from 'next-intl';

const ROWS = [
  { key: 'logging', us: true, hevy: true, strava: false, whoop: false },
  { key: 'cardio', us: true, hevy: false, strava: true, whoop: true },
  { key: 'nutrition', us: true, hevy: false, strava: false, whoop: false },
  { key: 'belgian', us: true, hevy: false, strava: false, whoop: false },
  { key: 'noads', us: true, hevy: false, strava: false, whoop: true },
  { key: 'opensource', us: true, hevy: false, strava: false, whoop: false },
] as const;

function Cell({ on }: { on: boolean }) {
  return (
    <span
      className="inline-flex size-7 items-center justify-center rounded-full font-mono text-sm"
      style={{
        background: on ? 'var(--color-acid)' : 'transparent',
        color: on ? 'var(--color-ink)' : 'var(--color-muted-foreground)',
        border: on ? 'none' : '1px solid var(--color-border)',
      }}
      aria-label={on ? 'oui' : 'non'}
    >
      {on ? '●' : '·'}
    </span>
  );
}

export function HomeVs() {
  const t = useTranslations('home.vs');

  return (
    <section className="mt-32">
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

      <p
        className="display-italic mt-8 max-w-2xl text-xl leading-snug"
        style={{
          color:
            'color-mix(in oklab, var(--color-foreground) 80%, transparent)',
        }}
      >
        {t('lede')}
      </p>

      <div className="mt-12 overflow-x-auto">
        <table
          className="w-full min-w-[640px] border-collapse text-left"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <thead>
            <tr
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              <th className="border-b py-4 pr-4 font-normal" style={{ borderColor: 'var(--color-border)' }}>
                {t('feature')}
              </th>
              <th
                className="border-b py-4 px-3 text-center font-bold"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-brand)',
                }}
              >
                IronTrack
              </th>
              <th className="border-b py-4 px-3 text-center font-normal" style={{ borderColor: 'var(--color-border)' }}>
                Hevy
              </th>
              <th className="border-b py-4 px-3 text-center font-normal" style={{ borderColor: 'var(--color-border)' }}>
                Strava
              </th>
              <th className="border-b py-4 px-3 text-center font-normal" style={{ borderColor: 'var(--color-border)' }}>
                Whoop
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.key}
                className="border-b text-sm"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="py-4 pr-4 font-medium">
                  {t(`rows.${row.key}`)}
                </td>
                <td className="px-3 py-4 text-center">
                  <Cell on={row.us} />
                </td>
                <td className="px-3 py-4 text-center">
                  <Cell on={row.hevy} />
                </td>
                <td className="px-3 py-4 text-center">
                  <Cell on={row.strava} />
                </td>
                <td className="px-3 py-4 text-center">
                  <Cell on={row.whoop} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className="mt-6 font-mono text-[11px] uppercase tracking-widest"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        {t('disclaimer')}
      </p>
    </section>
  );
}
