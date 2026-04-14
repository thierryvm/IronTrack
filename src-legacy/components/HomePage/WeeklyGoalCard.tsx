'use client'

import Link from 'next/link'
import { ArrowRight, CalendarClock, Flag, Flame, Target } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Card, CardContent } from '@/components/ui/card'

import type { HomeProfileSummary, HomeStats } from './homepage-types'

interface WeeklyGoalCardProps {
  stats: HomeStats
  profileSummary: HomeProfileSummary
}

const trainingFrequencyCopy = {
  Faible: {
    label: 'Cadence basse',
    details: '1 à 2 séances par semaine',
    minSessions: 1,
    maxSessions: 2,
  },
  Modérée: {
    label: 'Cadence modérée',
    details: '3 à 4 séances par semaine',
    minSessions: 3,
    maxSessions: 4,
  },
  Élevée: {
    label: 'Cadence élevée',
    details: '5 séances ou plus par semaine',
    minSessions: 5,
    maxSessions: Number.POSITIVE_INFINITY,
  },
} as const

function formatAvailability(minutes: number | null): string {
  if (!minutes) {
    return 'Non définie'
  }

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours} h`
    }

    return `${hours} h ${remainingMinutes}`
  }

  return `${minutes} min`
}

function getFrequencyStatus(thisWeek: number, frequency: keyof typeof trainingFrequencyCopy): string {
  const config = trainingFrequencyCopy[frequency]

  if (thisWeek === 0) {
    return 'Aucune séance validée cette semaine pour le moment.'
  }

  if (thisWeek < config.minSessions) {
    const missingSessions = config.minSessions - thisWeek
    return `Encore ${missingSessions} séance${missingSessions > 1 ? 's' : ''} pour retrouver la plage basse de ton rythme déclaré.`
  }

  if (Number.isFinite(config.maxSessions) && thisWeek > config.maxSessions) {
    return 'Tu dépasses déjà la cadence que tu avais déclarée cette semaine.'
  }

  return 'Tu restes dans la plage prévue pour le rythme que tu as déclaré.'
}

export default function WeeklyGoalCard({ stats, profileSummary }: WeeklyGoalCardProps) {
  const hasDeclaredRhythm = Boolean(profileSummary.frequency)
  const declaredRhythm = profileSummary.frequency
    ? trainingFrequencyCopy[profileSummary.frequency]
    : null
  const cadenceStatus = profileSummary.frequency
    ? getFrequencyStatus(stats.thisWeek, profileSummary.frequency)
    : 'Définis ton rythme d’entraînement pour afficher une cadence cohérente ici.'

  const ctaHref = hasDeclaredRhythm ? '/workouts/new' : '/profile'
  const ctaLabel = hasDeclaredRhythm ? 'Planifier la prochaine séance' : 'Compléter mon profil'

  return (
    <Card className="h-full rounded-[30px] border-border/80 bg-card/88 shadow-sm">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Cap hebdomadaire
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground text-balance">Cadence réelle</h2>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Flag className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 rounded-[26px] border border-border/70 bg-background/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Cette semaine
              </p>
              <p className="mt-2 text-4xl font-black text-foreground">{stats.thisWeek}</p>
              <p className="mt-1 text-sm text-muted-foreground">séances validées sur IronTrack</p>
            </div>

            <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
              <Flame className="h-4 w-4" aria-hidden="true" />
              <span>{stats.currentStreak} jours de série</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-border/70 bg-card/75 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                Priorité profil
              </div>
              <p className="mt-3 text-lg font-bold text-foreground">
                {profileSummary.goal ?? 'À définir'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Base affichée depuis ton profil IronTrack.
              </p>
            </div>

            <div className="rounded-[22px] border border-border/70 bg-card/75 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                Durée moyenne
              </div>
              <p className="mt-3 text-lg font-bold text-foreground">
                {formatAvailability(profileSummary.availability)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Temps moyen déclaré par séance.
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-border/70 bg-card/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Cadence déclarée
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-lg font-bold text-foreground">
                {declaredRhythm?.label ?? 'Rythme non défini'}
              </p>
              {declaredRhythm ? (
                <span className="inline-flex min-h-9 items-center rounded-full border border-border/80 bg-background/80 px-3 py-1 text-sm font-semibold text-foreground">
                  {declaredRhythm.details}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{cadenceStatus}</p>
          </div>

          <ActionButton asChild tone="secondary" className="mt-auto w-full justify-between">
            <Link href={ctaHref}>
              <span>{ctaLabel}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" data-icon="inline-end" />
            </Link>
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  )
}
