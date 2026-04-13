import { CalendarPlus } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'

interface WorkoutsHeroProps {
  monthLabel: string
  totalCount: number
  plannedCount: number
  completedCount: number
  onCreateWorkout: () => void
}

export default function WorkoutsHero({
  monthLabel,
  totalCount,
  plannedCount,
  completedCount,
  onCreateWorkout,
}: WorkoutsHeroProps) {
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
                Séances & planning
              </Badge>
              <p className="text-sm font-medium capitalize text-muted-foreground">{monthLabel}</p>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Séances lisibles, action directe.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Retrouve l’historique utile, garde la prochaine séance visible et évite le vieux
                tunnel de cartes lourdes quand tu veux simplement agir.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row xl:min-w-[220px] xl:justify-end">
            <ActionButton
              type="button"
              tone="primary"
              onClick={onCreateWorkout}
              className="gap-2 sm:min-w-[200px]"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              <span>Nouvelle séance</span>
            </ActionButton>
          </div>
        </div>

        <dl className="grid gap-0 overflow-hidden rounded-[24px] border border-border/80 bg-background/48 sm:grid-cols-3 sm:divide-x sm:divide-border/70">
          <div className="px-4 py-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Bibliothèque
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">{totalCount}</dd>
            <p className="mt-1 text-sm text-muted-foreground">séances enregistrées</p>
          </div>

          <div className="border-t border-border/70 px-4 py-4 sm:border-t-0">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              À venir
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-primary">{plannedCount}</dd>
            <p className="mt-1 text-sm text-muted-foreground">encore à réaliser</p>
          </div>

          <div className="border-t border-border/70 px-4 py-4 sm:border-t-0">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Terminées
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-emerald-300">{completedCount}</dd>
            <p className="mt-1 text-sm text-muted-foreground">déjà validées</p>
          </div>
        </dl>
      </div>
    </section>
  )
}
