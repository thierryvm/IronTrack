'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  CheckCircle2,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
} from 'lucide-react'

import EmailAuthForm from '@/components/auth/EmailAuthForm'
import InAppBrowserWarning from '@/components/auth/InAppBrowserWarning'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

const mobileHighlights = [
  { icon: TrendingUp, text: 'Retrouve tes seances, ton planning et ta progression sans friction.' },
  { icon: Timer, text: "Un parcours plus direct pour les usages quotidiens sur telephone." },
  { icon: ShieldCheck, text: 'Connexion securisee et acces rapide a ton espace personnel.' },
]

const desktopHighlights = [
  { icon: TrendingUp, title: 'Progression', text: 'Analyse claire de tes performances et de tes habitudes.' },
  { icon: Timer, title: 'Rythme', text: 'Reprends tes seances en quelques secondes, sans te perdre dans l interface.' },
  { icon: BarChart3, title: 'Pilotage', text: 'Une vue plus lisible pour suivre tes objectifs et ton calendrier.' },
  { icon: CheckCircle2, title: 'Constance', text: 'Nutrition, entrainements et recap aligns dans un meme espace.' },
]

const desktopStats = [
  { label: 'Coach', value: '1 app' },
  { label: 'Parcours', value: 'desktop net' },
  { label: 'Suivi', value: 'plus clair' },
]

function DesktopShowcase() {
  return (
    <section className="relative hidden min-h-[760px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-10">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(249,115,22,0.26), transparent 34%), radial-gradient(circle at bottom left, rgba(99,102,241,0.16), transparent 40%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-6">
        <Logo iconSize="lg" className="text-white" />
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
          <Dumbbell className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Experience desktop
        </div>
      </div>

      <div className="relative z-10 grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-end">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Connexion premium
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/60">
              Fitness, musculation et nutrition
            </p>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-tight text-balance">
              Reprends tes reperes.
              <br />
              <span className="text-primary">Forge ta prochaine seance.</span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-white/72">
              Sur grand ecran, IronTrack doit respirer, guider et donner une vraie lecture de ton espace d entrainement. Cette version desktop retrouve une composition plus marquee et plus stable.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {desktopStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                <p className="text-sm text-white/60">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {desktopHighlights.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/58">{title}</p>
                  <p className="text-base font-medium leading-7 text-white/84">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MobileIntro() {
  return (
    <section className="lg:hidden">
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-slate-950 px-5 py-6 text-white shadow-xl">
        <div
          className="absolute inset-0 opacity-65"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(249,115,22,0.24), transparent 36%), radial-gradient(circle at bottom left, rgba(59,130,246,0.16), transparent 40%)',
          }}
        />
        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <Logo iconSize="md" className="text-white" />
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Mobile
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/58">
              Connexion simplifiee
            </p>
            <h1 className="text-3xl font-black leading-tight text-balance">
              Ton espace d entrainement, sans friction.
            </h1>
            <p className="text-sm leading-6 text-white/72">
              Accede vite a tes seances, ta nutrition et tes progres dans une interface plus nette et pensee pour le telephone.
            </p>
          </div>

          <ul className="grid gap-3">
            {mobileHighlights.map(({ icon: Icon, text }) => (
              <li key={text} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-6 text-white/84">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function AuthPage() {
  const supabase = createClient()
  const [oauthError, setOauthError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setOauthError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: unknown) {
      setOauthError(error instanceof Error ? error.message : 'Impossible de lancer la connexion Google pour le moment.')
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#050608] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:gap-8">
        <DesktopShowcase />

        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 lg:max-w-none">
          <MobileIntro />

          <section className="rounded-[28px] border border-border bg-card px-5 py-6 shadow-xl sm:px-8 sm:py-8 lg:flex lg:min-h-[760px] lg:flex-col lg:justify-center lg:rounded-[32px] lg:px-10">
            <div className="mx-auto flex w-full max-w-md flex-col gap-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 lg:hidden">
                  <Logo iconSize="md" />
                </div>
                <Link
                  href="/support"
                  className="text-sm font-medium text-safe-muted transition-colors hover:text-foreground"
                >
                  Besoin d aide ?
                </Link>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Connexion securisee</p>
                <h2 className="text-3xl font-bold text-foreground text-balance">
                  Reprends ton rythme la ou tu l as laisse.
                </h2>
                <p className="text-sm leading-6 text-safe-muted lg:text-base">
                  Connecte-toi pour retrouver tes seances, ton planning et tes objectifs dans un espace plus clair et plus accessible.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/35 p-4 lg:hidden">
                <p className="text-sm font-medium text-foreground">Acces rapide sur mobile</p>
                <p className="mt-1 text-sm leading-6 text-safe-muted">
                  Planning, nutrition et progression restent accessibles des le premier ecran, sans detour visuel inutile.
                </p>
              </div>

              <div className="hidden rounded-2xl border border-border bg-muted/25 p-4 lg:block">
                <p className="text-sm font-medium text-foreground">Version desktop restauree</p>
                <p className="mt-1 text-sm leading-6 text-safe-muted">
                  Le panneau de marque et le formulaire sont maintenant separes pour exploiter le grand format sans reprendre la composition mobile.
                </p>
              </div>

              <InAppBrowserWarning />

              {oauthError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {oauthError}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="h-12 w-full gap-2 rounded-xl border-border bg-background font-semibold text-base hover:bg-accent"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuer avec Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
                  <span className="bg-card px-3 text-safe-muted">ou</span>
                </div>
              </div>

              <EmailAuthForm showGoogleOption={false} />

              <div className="border-t border-border pt-4">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-safe-muted">
                  <Link href="/legal/terms" className="transition-colors hover:text-foreground">
                    Conditions d utilisation
                  </Link>
                  <span aria-hidden>·</span>
                  <Link href="/legal/privacy" className="transition-colors hover:text-foreground">
                    Confidentialite
                  </Link>
                  <span aria-hidden>·</span>
                  <Link href="/support" className="transition-colors hover:text-foreground">
                    Support
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
