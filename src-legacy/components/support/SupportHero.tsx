import Link from 'next/link'
import { ArrowRight, HelpCircle, LockKeyhole } from 'lucide-react'

import { Button } from '@/components/ui/button'

const publicChecklist = [
  'Comprendre un flux avant de toucher aux réglages.',
  'Retrouver la bonne surface sans repasser par tout le menu.',
  'Préparer une demande de support propre avant d’ouvrir un ticket.',
]

export default function SupportHero() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border bg-[linear-gradient(120deg,rgba(255,107,0,0.14)_0%,rgba(255,107,0,0.04)_18%,rgba(17,19,24,0.96)_56%,rgba(17,19,24,0.92)_100%)] px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:px-8 lg:px-10 lg:py-10">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(255,107,0,0.14),transparent_20%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:24px_24px]"
        aria-hidden="true"
      />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.84fr)] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Centre d’aide public
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Support clair, rapide et crédible.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Retrouve les réponses utiles pour partenaires, progression, onboarding et
              configuration, puis connecte-toi seulement quand une action privée est nécessaire.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="min-h-[48px] rounded-[18px] px-5 text-background hover:text-background"
            >
              <Link href="/auth" prefetch={false}>
                Accéder à mon espace
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-[48px] rounded-[18px] border-border bg-card/70 px-5"
            >
              <Link href="/faq" prefetch={false}>Voir la FAQ</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-card/72 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-6">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <HelpCircle className="size-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">Quand utiliser cette page</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Pour comprendre un flux, retrouver une action ou préparer une demande de support.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {publicChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 size-2 rounded-full bg-primary/85" aria-hidden="true" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </li>
              ))}
            </ul>
            <div className="rounded-[24px] border border-white/10 bg-background/45 px-4 py-4">
              <div className="flex items-center gap-3">
                <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">
                  Connexion requise
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/88">
                Les surfaces privées comme les tickets, le contact support ou l’administration
                restent protégées derrière l’authentification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
