'use client'

import { Calendar, Flame, Target, Trophy } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import type { HomeStats } from './homepage-types'

interface HomePageStatsGridProps {
  stats: HomeStats
}

export default function HomePageStatsGrid({ stats }: HomePageStatsGridProps) {
  const statCards = [
    {
      title: 'Séances validées',
      value: stats.totalWorkouts,
      description: 'sessions terminées au total',
      icon: Trophy,
      accent: 'text-primary',
      surface: 'bg-primary/10',
    },
    {
      title: 'Cette semaine',
      value: stats.thisWeek,
      description: 'sessions terminées',
      icon: Calendar,
      accent: 'text-sky-400',
      surface: 'bg-sky-500/10',
    },
    {
      title: 'Série en cours',
      value: stats.currentStreak,
      description: 'jours consécutifs',
      icon: Flame,
      accent: 'text-amber-400',
      surface: 'bg-amber-500/10',
    },
    {
      title: 'Charge totale',
      value: `${Math.round(stats.totalWeight).toLocaleString('fr-BE')} kg`,
      description: 'poids déplacé cumulé',
      icon: Target,
      accent: 'text-emerald-400',
      surface: 'bg-emerald-500/10',
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="rounded-3xl border-border/80 bg-card/88 shadow-sm">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {stat.title}
              </p>
              <p className="mt-3 text-3xl font-black text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
            </div>
            <div className={`rounded-2xl p-3 ${stat.surface}`}>
              <stat.icon className={`h-5 w-5 ${stat.accent}`} aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
