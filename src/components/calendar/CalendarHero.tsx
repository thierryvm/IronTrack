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

  const shareSummary = hasAnyPartnerWorkouts
    ? showPartnerWorkouts
      ? `${visiblePartnerCount} visible${visiblePartnerCount > 1 ? 's' : ''}`
      : `${availablePartnerCount} disponible${availablePartnerCount > 1 ? 's' : ''}`
    : 'Aucun partage'

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-border bg-card/80 px-5 py-5 shadow-[0_24px_56px_rgba(0,0,0,0.22)] sm:px-6 sm:py-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-65"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(249,115,22,0.16), transparent 28%), radial-gradient(circle at bottom left, rgba(59,130,246,0.08), transparent 36%)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="w-fit border-primary/25 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
              >
                Planning personnel
              </Badge>
              <p className="text-sm font-medium text-muted-foreground">{monthLabel}</p>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Calendrier net, action rapide.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Visualise ton mois, active les partages seulement quand ils sont utiles et garde la
                bonne action à portée de pouce sans alourdir l’écran.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row xl:min-w-[320px] xl:justify-end">
            <ActionButton
              type="button"
              tone="secondary"
              onClick={onTogglePartnerWorkouts}
              className="justify-between gap-3 sm:min-w-[188px]"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{partnerButtonLabel}</span>
              </span>
              {availablePartnerCount > 0 ? (
                <Badge className="bg-primary text-white hover:bg-primary">{availablePartnerCount}</Badge>
              ) : null}
            </ActionButton>

            <ActionButton
              type="button"
              tone="primary"
              onClick={onCreateWorkout}
              className="gap-2 sm:min-w-[188px]"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              <span>Nouvelle séance</span>
            </ActionButton>
          </div>
        </div>

        <dl className="grid gap-0 overflow-hidden rounded-[24px] border border-border/80 bg-background/48 sm:grid-cols-3 sm:divide-x sm:divide-border/70">
          <div className="px-4 py-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Séances du mois
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">{personalCount}</dd>
            <p className="mt-1 text-sm text-muted-foreground">personnelles planifiées</p>
          </div>

          <div className="border-t border-border/70 px-4 py-4 sm:border-t-0">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Avancement
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-emerald-300">{completedCount}</dd>
            <p className="mt-1 text-sm text-muted-foreground">déjà terminées ce mois-ci</p>
          </div>

          <div className="border-t border-border/70 px-4 py-4 sm:border-t-0">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Partages
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">{shareSummary}</dd>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasAnyPartnerWorkouts
                ? showPartnerWorkouts
                  ? 'affichés dans la vue active'
                  : 'activables à la demande'
                : 'aucune séance partenaire disponible'}
            </p>
          </div>
        </dl>
      </div>
    </section>
  )
}
