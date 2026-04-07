'use client'

import Link from 'next/link'
import {
  Activity,
  Apple,
  Calendar,
  ChevronRight,
  Dumbbell,
  Flame,
  TrendingUp,
} from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Card, CardContent } from '@/components/ui/card'

import type { HomeStats } from './homepage-types'

interface HomePageHeroProps {
  displayName: string
  stats: HomeStats
  onOpenAdvancedTimer: () => void
}

export default function HomePageHero({
  displayName,
  stats,
  onOpenAdvancedTimer,
}: HomePageHeroProps) {
  const focusItems = [
    {
      title: 'Entraînement',
      value: `${stats.thisWeek} cette semaine`,
      description: 'Reprends ton planning ou ouvre une nouvelle séance.',
      icon: Dumbbell,
    },
    {
      title: 'Nutrition',
      value: `${stats.nutritionEntriesThisWeek} repas cette semaine`,
      description: 'Garde un suivi nutritionnel cohérent avec ta charge de travail.',
      icon: Apple,
    },
    {
      title: 'Progression',
      value: `${stats.currentStreak} jours de série`,
      description: 'Mesure ta constance et sécurise ton prochain cap.',
      icon: TrendingUp,
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_38%),radial-gradient(circle_at_70%_20%,_rgba(59,130,246,0.12),_transparent_26%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(10,14,24,0.98))]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:26px_26px] opacity-20" />
      <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.14),_transparent_58%)] opacity-90" />

      <div className="relative grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10 lg:py-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            Cockpit IronTrack
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">
              IronTrack · Fitness, musculation et nutrition
            </p>
            <h1 className="max-w-3xl text-balance text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              IronTrack, ton cockpit quotidien pour entraîner, nourrir et faire progresser ton
              corps.
            </h1>
            <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Bonjour{' '}
              <span className="inline-block max-w-[14ch] truncate align-bottom font-semibold text-foreground">
                {displayName}
              </span>
              . Centralise ta séance du jour, ton suivi nutritionnel et tes marqueurs de
              progression dans l’espace IronTrack le plus clair, le plus dense et le plus utile.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ActionButton asChild tone="primary" className="px-6">
              <Link href="/workouts/new">
                <Dumbbell className="h-5 w-5" aria-hidden="true" data-icon="inline-start" />
                <span>Nouvelle séance</span>
              </Link>
            </ActionButton>

            <ActionButton asChild tone="secondary" className="px-6">
              <Link href="/calendar">
                <Calendar className="h-5 w-5" aria-hidden="true" data-icon="inline-start" />
                <span>Voir le calendrier</span>
              </Link>
            </ActionButton>

            <ActionButton type="button" tone="secondary" className="px-6" onClick={onOpenAdvancedTimer}>
              <Flame className="h-5 w-5 text-primary" aria-hidden="true" data-icon="inline-start" />
              <span>Ouvrir le timer</span>
            </ActionButton>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="rounded-2xl border-border/70 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Séances
                </p>
                <p className="mt-2 text-3xl font-black tabular-nums text-foreground">
                  {stats.totalWorkouts}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">sessions terminées au total</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/70 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Série
                </p>
                <p className="mt-2 text-3xl font-black tabular-nums text-foreground">
                  {stats.currentStreak}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">jours consécutifs enregistrés</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/70 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Charge
                </p>
                <p className="mt-2 text-3xl font-black tabular-nums text-foreground">
                  {Math.round(stats.totalWeight).toLocaleString('fr-BE')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">kg cumulés sur tes performances</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="rounded-[28px] border-border/70 bg-card/78 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Focus du jour
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">Une base claire pour agir</h2>
              </div>
              <div className="whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Mobile-first
              </div>
            </div>

            <div className="space-y-3">
              {focusItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <ActionButton asChild tone="secondary" className="mt-5 w-full justify-between">
              <Link href="/progress">
                <span>Ouvrir la vue progression</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" data-icon="inline-end" />
              </Link>
            </ActionButton>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
