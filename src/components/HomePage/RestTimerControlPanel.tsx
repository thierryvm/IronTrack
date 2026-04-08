'use client'

import type { LucideIcon } from 'lucide-react'
import { Pause, Play, RotateCcw } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Button } from '@/components/ui/button'

const quickTimes = [30, 60, 90, 120, 180]

interface TimerPreset {
  label: string
  duration: number
  icon: LucideIcon
}

interface RestTimerControlPanelProps {
  activePreset: TimerPreset | null
  formatTime: (seconds: number) => string
  isRunning: boolean
  onOpenAdvancedTimer: () => void
  onResetTimer: () => void
  onToggleRunning: () => void
  progress: number
  selectedTime: number
  timeLeft: number
  onSelectTime: (time: number) => void
}

export default function RestTimerControlPanel({
  activePreset,
  formatTime,
  isRunning,
  onOpenAdvancedTimer,
  onResetTimer,
  onSelectTime,
  onToggleRunning,
  progress,
  selectedTime,
  timeLeft,
}: RestTimerControlPanelProps) {
  return (
    <div className="flex flex-col rounded-[24px] border border-border/70 bg-background/72 p-5 xl:p-6">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,_#f97316,_#fb7185)] transition-[width] duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 text-center xl:mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Temps sélectionné
        </p>
        <output
          aria-atomic="true"
          aria-live="polite"
          className="mt-3 block text-5xl font-black tracking-tight text-foreground xl:text-6xl"
        >
          {formatTime(timeLeft)}
        </output>
        <p className="mx-auto mt-3 max-w-[34ch] text-sm leading-6 text-muted-foreground">
          Choisis un repos adapté à l’objectif du set: force, volume ou densité.
        </p>
        {activePreset ? (
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
            <activePreset.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Profil actif: {activePreset.label}</span>
          </div>
        ) : null}
      </div>

      <div
        aria-label="Durées rapides du timer"
        className="mt-6 rounded-[22px] border border-border/70 bg-card/70 p-2 xl:mt-8"
        role="group"
      >
        <div className="grid grid-cols-5 gap-2">
          {quickTimes.map((time) => {
            const isActive = selectedTime === time

            return (
              <Button
                key={time}
                aria-pressed={isActive}
                type="button"
                variant="ghost"
                className="min-h-[46px] rounded-[16px] border border-transparent bg-transparent px-0 font-semibold text-foreground shadow-none transition-transform duration-200 motion-reduce:transition-none hover:-translate-y-px hover:border-primary/15 hover:bg-accent data-[active=true]:border-[var(--brand-700)] data-[active=true]:bg-[var(--brand-700)] data-[active=true]:text-white data-[active=true]:shadow-[0_14px_30px_rgba(191,82,0,0.24)]"
                data-active={isActive}
                onClick={() => onSelectTime(time)}
              >
                {time}s
              </Button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ActionButton
          aria-label={isRunning ? 'Mettre le timer en pause' : 'Démarrer le timer'}
          type="button"
          tone="primary"
          className="w-full justify-center !border-[var(--brand-700)] !bg-[var(--brand-700)] !text-white hover:!border-[var(--brand-800)] hover:!bg-[var(--brand-800)]"
          onClick={onToggleRunning}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" data-icon="inline-start" />
          )}
          <span>{isRunning ? 'Pause' : 'Démarrer'}</span>
        </ActionButton>

        <ActionButton
          aria-label="Réinitialiser le timer"
          type="button"
          tone="secondary"
          className="w-full justify-center"
          onClick={onResetTimer}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" data-icon="inline-start" />
          <span>Réinitialiser</span>
        </ActionButton>
      </div>

      <div className="mt-4 rounded-[20px] border border-border/70 bg-card/66 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Profils personnalisés
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Crée un profil dédié si ton effort, ton format de séance ou ton tempo demandent un repos
          différent.
        </p>
        <div className="mt-4 grid gap-3">
          <ActionButton
            type="button"
            tone="secondary"
            className="w-full justify-center"
            onClick={onOpenAdvancedTimer}
          >
            <span>Créer un profil guidé</span>
          </ActionButton>

          <ActionButton
            type="button"
            tone="secondary"
            className="w-full justify-center"
            onClick={onOpenAdvancedTimer}
          >
            <span>Gérer dans le timer avancé</span>
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
