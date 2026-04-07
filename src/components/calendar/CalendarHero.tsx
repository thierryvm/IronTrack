import { CalendarPlus, Users } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'

interface CalendarHeroProps {
  monthLabel: string
  personalCount: number
  completedCount: number
  availablePartnerCount: number
  visiblePartnerCount: number
  hasAnyPartnerWorkouts: boolean
  showPartnerWorkouts: boolean
  onCreateWorkout: () => void
  onTogglePartnerWorkouts: () => void
}

export default function CalendarHero({
  monthLabel,
  personalCount,
  completedCount,
  availablePartnerCount,
  visiblePartnerCount,
  hasAnyPartnerWorkouts,
  showPartnerWorkouts,
  onCreateWorkout,
  onTogglePartnerWorkouts,
}: CalendarHeroProps) {
  const partnerButtonLabel = hasAnyPartnerWorkouts
    ? showPartnerWorkouts
      ? 'Masquer les partages'
      : 'Afficher les partages'
    : 'Gérer mes partenaires'

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border bg-card/84 px-5 py-5 shadow-[0_28px_70px_rgba(0,0,0,0.28)] sm:px-7 sm:py-7">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(249,115,22,0.14), transparent 30%), radial-gradient(circle at bottom left, rgba(59,130,246,0.1), transparent 36%)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-4">
          <Badge
            variant="outline"
            className="w-fit border-primary/25 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
          >
            Calendrier d’entraînement
          </Badge>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Un planning clair pour piloter ton mois.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Garde un aperçu net de tes séances, active les partages quand ils sont utiles et
              retrouve vite la bonne action sans retomber dans une page lourde.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-border bg-background/58 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {monthLabel}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{personalCount}</p>
              <p className="text-sm text-muted-foreground">séances personnelles</p>
            </div>

            <div className="rounded-[22px] border border-border bg-background/58 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Terminées
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{completedCount}</p>
              <p className="text-sm text-muted-foreground">dans la vue mensuelle</p>
            </div>

            <div className="rounded-[22px] border border-border bg-background/58 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Partages
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {showPartnerWorkouts ? visiblePartnerCount : availablePartnerCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasAnyPartnerWorkouts
                  ? showPartnerWorkouts
                    ? 'visibles dans ce mois'
                    : 'disponibles si tu les actives'
                  : 'aucun partage visible pour le moment'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col xl:min-w-[260px]">
          <ActionButton
            type="button"
            tone="secondary"
            onClick={onTogglePartnerWorkouts}
            className="justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{partnerButtonLabel}</span>
            </span>
            {availablePartnerCount > 0 ? (
              <Badge className="bg-primary text-white hover:bg-primary">{availablePartnerCount}</Badge>
            ) : null}
          </ActionButton>

          <ActionButton type="button" tone="primary" onClick={onCreateWorkout} className="gap-2">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            <span>Nouvelle séance</span>
          </ActionButton>
        </div>
      </div>
    </section>
  )
}
