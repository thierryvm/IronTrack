import { Activity, Dumbbell, Flame, Gauge } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const guidedPresets = [
  {
    label: 'Force',
    duration: 180,
    description: '2 à 3 min pour charges lourdes et récupération nerveuse.',
    icon: Dumbbell,
  },
  {
    label: 'Hypertrophie',
    duration: 90,
    description: '60 à 90 s pour garder un bon volume de travail.',
    icon: Flame,
  },
  {
    label: 'Densité',
    duration: 60,
    description: '45 à 60 s pour circuits, supersets et tempo soutenu.',
    icon: Activity,
  },
  {
    label: 'Explosivité',
    duration: 120,
    description: '90 à 120 s pour vitesse, puissance et qualité d’exécution.',
    icon: Gauge,
  },
] as const

interface RestTimerGuidedProfilesProps {
  selectedTime: number
  onSelectPreset: (duration: number) => void
  formatTime: (seconds: number) => string
}

export default function RestTimerGuidedProfiles({
  selectedTime,
  onSelectPreset,
  formatTime,
}: RestTimerGuidedProfilesProps) {
  return (
    <div className="flex h-full flex-col rounded-[24px] border border-border/70 bg-background/72 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Profils guidés
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Quatre repères utiles selon le type d’effort et le niveau de récupération attendu.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {guidedPresets.map((preset) => {
          const isActive = selectedTime === preset.duration
          const durationId = `rest-preset-${preset.label.toLowerCase()}-duration`
          const descriptionId = `rest-preset-${preset.label.toLowerCase()}-description`

          return (
            <Button
              aria-pressed={isActive}
              aria-describedby={`${durationId} ${descriptionId}`}
              key={preset.label}
              type="button"
              variant="ghost"
              className={cn(
                'h-auto min-h-[94px] justify-start whitespace-normal rounded-[20px] border border-border/70 bg-background/72 px-4 py-4 text-left shadow-none transition-transform duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-primary/25 hover:bg-background/82',
                isActive && 'border-primary/25 bg-primary/10 shadow-[0_0_0_1px_rgba(249,115,22,0.14)]',
              )}
              onClick={() => onSelectPreset(preset.duration)}
            >
              <div className="flex w-full items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <preset.icon className="h-4 w-4" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{preset.label}</p>
                    <div
                      id={durationId}
                      className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-background/82 px-2.5 py-1 text-xs font-semibold tracking-[0.08em] text-foreground tabular-nums"
                    >
                      {formatTime(preset.duration)}
                    </div>
                  </div>
                  <p
                    id={descriptionId}
                    className="mt-2 text-sm leading-5 text-muted-foreground"
                  >
                    {preset.description}
                  </p>
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
