import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LangSwitcher } from '@/components/lang-switcher';
import { LOCALES, type Locale } from '@/i18n/request';
import { getUser } from '@/lib/auth';

import { signOut } from './actions';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const typedLocale = (LOCALES as readonly string[]).includes(locale)
    ? (locale as Locale)
    : 'fr';
  setRequestLocale(typedLocale);

  const t = await getTranslations('index');
  const tHome = await getTranslations('home');
  const user = await getUser();

  return (
    <main className="mx-auto max-w-7xl px-8 pb-40 pt-16">
      <header
        className="rise flex items-center justify-between gap-6"
        style={{ animationDelay: '0.05s' }}
      >
        <span className="eyebrow inline-flex items-center">
          <BrandDot /> {t('eyebrow')}
        </span>
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden items-center gap-3 sm:flex">
              <span
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {user.email}
              </span>
              <form action={signOut}>
                <input type="hidden" name="locale" value={typedLocale} />
                <button
                  type="submit"
                  className="font-mono text-xs uppercase tracking-widest underline-offset-4 hover:underline"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {tHome('cta.logout')}
                </button>
              </form>
            </div>
          )}
          <LangSwitcher />
        </div>
      </header>

      <section
        className="mt-20 grid items-end gap-12 border-b pb-12 md:grid-cols-[1.2fr_1fr]"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="rise" style={{ animationDelay: '0.15s' }}>
          <span className="eyebrow">{t('hero.kicker')}</span>
          <h1 className="display mt-6 text-[clamp(64px,11vw,140px)] leading-[0.95]">
            {t('hero.train')}{' '}
            <span
              className="display-italic"
              style={{ color: 'var(--color-brand)' }}
            >
              {t('hero.heavier')}
            </span>
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">{t('hero.live')}</span>
              <span
                aria-hidden
                className="absolute bottom-[0.08em] left-0 right-0 h-3 -skew-x-[8deg]"
                style={{ background: 'var(--color-acid)', zIndex: -1 }}
              />
            </span>{' '}
            {t('hero.lighter')}
          </h1>
        </div>

        <p
          className="rise display-italic text-xl leading-snug md:max-w-md"
          style={{
            animationDelay: '0.25s',
            color:
              'color-mix(in oklab, var(--color-foreground) 80%, transparent)',
          }}
        >
          {t('lede')}
        </p>
      </section>

      <div
        className="mt-16 grid grid-cols-2 border-y md:grid-cols-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <MetaCell label={t('meta.stack.label')} value={t('meta.stack.value')} />
        <MetaCell
          label={t('meta.backend.label')}
          value={t('meta.backend.value')}
        />
        <MetaCell
          label={t('meta.budget.label')}
          value={t('meta.budget.value')}
        />
        <MetaCell
          label={t('meta.target.label')}
          value={t('meta.target.value')}
        />
      </div>

      <section className="mt-24">
        <div
          className="flex items-end justify-between gap-6 border-b pb-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="display text-4xl md:text-5xl">
            {t('build.heading')}{' '}
            <em
              className="display-italic"
              style={{ color: 'var(--color-brand)' }}
            >
              {t('build.headingAccent')}
            </em>
          </h2>
          <span className="eyebrow">{t('build.phase')}</span>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <StatusCard
            title={t('build.cards.stack.title')}
            desc={t('build.cards.stack.desc')}
            status={t('build.cards.stack.status')}
            tone="acid"
          />
          <StatusCard
            title={t('build.cards.design.title')}
            desc={t('build.cards.design.desc')}
            status={t('build.cards.design.status')}
            tone="brand"
          />
          <StatusCard
            title={t('build.cards.next.title')}
            desc={t('build.cards.next.desc')}
            status={t('build.cards.next.status')}
            tone="default"
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          {user ? (
            <>
              <span
                className="eyebrow"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {tHome('greeting', { email: user.email ?? '' })}
              </span>
              <Link
                href={`/${typedLocale}/dashboard`}
                className="group inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform hover:-translate-y-[1px]"
                style={{
                  background: 'var(--color-brand)',
                  color: 'var(--color-primary-foreground)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {tHome('cta.dashboard')}
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/${typedLocale}/login`}
                className="group inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform hover:-translate-y-[1px]"
                style={{
                  background: 'var(--color-brand)',
                  color: 'var(--color-primary-foreground)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {tHome('cta.start')}
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href={`/${typedLocale}/login`}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border px-6 py-3 font-semibold transition-colors hover:bg-[var(--color-muted)]"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {tHome('cta.login')}
              </Link>
            </>
          )}
        </div>
      </section>

      <footer
        className="mt-32 border-t pt-8"
        style={{ borderColor: 'var(--color-border)' }}
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
    </main>
  );
}

/* -------------------- Primitives -------------------- */

function BrandDot() {
  return (
    <span
      aria-hidden
      className="mr-3 inline-block h-3 w-3 rotate-45 align-[-1px]"
      style={{ background: 'var(--color-brand)' }}
    />
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="border-r p-5 last:border-r-0"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="eyebrow">{label}</div>
      <div className="display mt-1 text-2xl">{value}</div>
    </div>
  );
}

type StatusTone = 'default' | 'brand' | 'acid';

function StatusCard({
  title,
  desc,
  status,
  tone,
}: {
  title: string;
  desc: string;
  status: string;
  tone: StatusTone;
}) {
  const toneBg: Record<StatusTone, React.CSSProperties> = {
    default: {
      background: 'var(--color-card)',
      color: 'var(--color-card-foreground)',
      borderColor: 'var(--color-border)',
    },
    brand: {
      background: 'var(--color-brand)',
      color: 'var(--color-primary-foreground)',
      borderColor: 'transparent',
    },
    acid: {
      background: 'var(--color-acid)',
      color: 'var(--color-ink)',
      borderColor: 'transparent',
    },
  };
  const pillBg: Record<StatusTone, React.CSSProperties> = {
    default: {
      background: 'var(--color-foreground)',
      color: 'var(--color-background)',
    },
    brand: { background: 'rgba(255,255,255,0.2)', color: '#fff' },
    acid: { background: 'var(--color-ink)', color: 'var(--color-acid)' },
  };
  return (
    <div
      className="relative flex flex-col gap-4 overflow-hidden rounded-xl border p-6 transition-all hover:-translate-y-1"
      style={toneBg[tone]}
    >
      <div>
        <span
          className="mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={pillBg[tone]}
        >
          {status}
        </span>
      </div>
      <h3 className="display text-2xl leading-tight">{title}</h3>
      <p className="text-sm leading-relaxed opacity-90">{desc}</p>
    </div>
  );
}
