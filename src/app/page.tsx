import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-8 pb-40 pt-16">
      <header className="rise" style={{ animationDelay: '0.05s' }}>
        <span className="eyebrow inline-flex items-center">
          <BrandDot /> IRONTRACK · v2 · 2026
        </span>
      </header>

      <section className="mt-20 grid items-end gap-12 border-b pb-12 md:grid-cols-[1.2fr_1fr]"
        style={{ borderColor: 'var(--color-border)' }}>
        <div className="rise" style={{ animationDelay: '0.15s' }}>
          <span className="eyebrow">Masterclass redesign</span>
          <h1 className="display mt-6 text-[clamp(64px,11vw,140px)] leading-[0.95]">
            Train{' '}
            <span className="display-italic" style={{ color: 'var(--color-brand)' }}>
              heavier,
            </span>
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">live</span>
              <span
                aria-hidden
                className="absolute bottom-[0.08em] left-0 right-0 h-3 -skew-x-[8deg]"
                style={{
                  background: 'var(--color-acid)',
                  zIndex: -1,
                }}
              />
            </span>{' '}
            lighter.
          </h1>
        </div>

        <p
          className="rise display-italic text-xl leading-snug md:max-w-md"
          style={{
            animationDelay: '0.25s',
            color: 'color-mix(in oklab, var(--color-foreground) 80%, transparent)',
          }}
        >
          Une app fitness pensée comme un carnet d'atelier : précise,
          éditoriale, brutaliste. Pas de confettis. Pas de jargon. Juste ton
          corps, tes chiffres, ton progrès.
        </p>
      </section>

      <div
        className="mt-16 grid grid-cols-2 border-y md:grid-cols-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <MetaCell label="Stack" value="Next 16" />
        <MetaCell label="Backend" value="Supabase" />
        <MetaCell label="Budget" value="0 €" />
        <MetaCell label="Cible" value="Hevy · Strava · Whoop" />
      </div>

      <section className="mt-24">
        <div
          className="flex items-end justify-between gap-6 border-b pb-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="display text-4xl md:text-5xl">
            On construit{' '}
            <em
              className="display-italic"
              style={{ color: 'var(--color-brand)' }}
            >
              quelque chose.
            </em>
          </h2>
          <span className="eyebrow">PHASE 1 · FOUNDATIONS</span>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <StatusCard
            title="Stack reset"
            desc="Next 16 · React 19 · Tailwind v4 · shadcn new-york. Legacy archivé."
            status="DONE"
            tone="acid"
          />
          <StatusCard
            title="Design system live"
            desc="Tokens CSS-first + Fraunces / Manrope / JetBrains Mono. Orange signature préservé."
            status="DONE"
            tone="brand"
          />
          <StatusCard
            title="À venir"
            desc="Auth Supabase · middleware i18n FR/NL/EN · dashboard · session live."
            status="NEXT"
            tone="default"
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <button
            className="group inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform hover:-translate-y-[1px]"
            style={{
              background: 'var(--color-brand)',
              color: 'var(--color-primary-foreground)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            Commencer la séance
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border px-6 py-3 font-semibold transition-colors hover:bg-[var(--color-muted)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Se connecter
          </Link>
        </div>
      </section>

      <footer
        className="mt-32 border-t pt-8"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="eyebrow">© IronTrack 2026</p>
          <p
            className="display-italic text-2xl"
            style={{
              color:
                'color-mix(in oklab, var(--color-foreground) 60%, transparent)',
            }}
          >
            "The iron never lies."
          </p>
          <p className="eyebrow">Build · v2.0.0-alpha</p>
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
