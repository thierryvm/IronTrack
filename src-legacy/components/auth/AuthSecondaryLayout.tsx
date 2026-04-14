import type { ReactNode } from 'react'
import Link from 'next/link'
import { BarChart3, ShieldCheck, Timer, TrendingUp } from 'lucide-react'

import { AuthBodyClass } from '@/components/auth/AuthBodyClass'
import { Logo } from '@/components/shared/Logo'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const features = [
  { icon: TrendingUp, text: 'Suivi complet de tes entraînements' },
  { icon: Timer, text: 'Timer intelligent avec repos guidé' },
  { icon: BarChart3, text: 'Statistiques et progression détaillées' },
  { icon: ShieldCheck, text: 'Nutrition et objectifs personnalisés' },
]

interface AuthSecondaryLayoutProps {
  badge: string
  title: string
  description: string
  children: ReactNode
  mobileTitle?: string
  mobileDescription?: string
  contentClassName?: string
}

export function AuthSecondaryLayout({
  badge,
  title,
  description,
  children,
  mobileTitle,
  mobileDescription,
  contentClassName,
}: AuthSecondaryLayoutProps) {
  return (
    <>
      <AuthBodyClass />
      <main className="min-h-[100dvh] bg-[#0b0d12] text-white lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
      <section className="relative hidden min-h-[100dvh] overflow-hidden border-r border-white/6 bg-slate-950 lg:flex">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(249,115,22,0.3), transparent 32%), radial-gradient(circle at bottom left, rgba(59,130,246,0.16), transparent 42%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[720px] flex-col justify-between gap-12 px-12 py-16 xl:px-16">
          <div className="space-y-10">
            <div className="flex items-center justify-between gap-6">
              <Logo iconSize="lg" className="text-white" />
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
              >
                Coach fitness personnel
              </Badge>
            </div>

            <div className="max-w-[560px] space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/60">
                Fitness, musculation & nutrition
              </p>
              <h1 className="max-w-[520px] text-6xl font-black leading-[0.98] tracking-tight text-balance">
                Dépasse tes limites.
                <br />
                <span className="text-primary">Forge ta légende.</span>
              </h1>
              <p className="max-w-[520px] text-xl leading-9 text-white/72">
                Calendrier, séances, nutrition et progression réunis dans un espace unique, lisible et crédible dès
                le premier écran.
              </p>
            </div>

            <ul className="grid max-w-[560px] gap-4">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-4">
                  <div className="flex size-11 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-base font-medium leading-7 text-white/84">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-6 text-sm text-white/50">
            <p>© 2026 IronTrack</p>
            <p className="max-w-[320px] text-right">
              Pensé pour la performance, du premier accès jusqu&apos;au suivi quotidien.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-[100dvh] bg-[#17191f] px-5 py-6 sm:px-8 lg:px-14 lg:py-10">
        <div className={cn('mx-auto flex w-full max-w-[480px] flex-col gap-8', contentClassName)}>
          <div className="flex items-center justify-between gap-3">
            <div className="lg:hidden">
              <Logo iconSize="md" />
            </div>
            <Link href="/support" className="text-sm font-medium text-white/68 transition-colors hover:text-white">
              Besoin d&apos;aide ?
            </Link>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-950/72 px-5 py-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur lg:hidden">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              {badge}
            </Badge>
            <h1 className="mt-4 text-3xl font-black leading-tight">{mobileTitle ?? title}</h1>
            <p className="mt-3 text-sm leading-6 text-white/72">{mobileDescription ?? description}</p>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-7">
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/20 bg-primary/8 text-primary">
                {badge}
              </Badge>
              <h1 className="text-4xl font-bold text-white">{title}</h1>
              <p className="max-w-md text-base leading-7 text-white/72">{description}</p>
            </div>

            {children}
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-white/54">
              <Link href="/legal/terms" className="transition-colors hover:text-white">
                Conditions d&apos;utilisation
              </Link>
              <span aria-hidden>·</span>
              <Link href="/legal/privacy" className="transition-colors hover:text-white">
                Confidentialité
              </Link>
              <span aria-hidden>·</span>
              <Link href="/support" className="transition-colors hover:text-white">
                Support
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  )
}
