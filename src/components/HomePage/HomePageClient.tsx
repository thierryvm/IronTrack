'use client'

import { startTransition, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Apple, Dumbbell, Flame, Plus, Trophy, TrendingUp } from 'lucide-react'

import { useBadges } from '@/hooks/useBadges'
import { useHomeDashboard } from '@/hooks/useHomeDashboard'
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck'
import { useUserProfile } from '@/hooks/useUserProfile'
import { createClient } from '@/utils/supabase/client'

import HomePageHero from './HomePageHero'
import HomePageQuickActions from './HomePageQuickActions'
import HomePageStatsGrid from './HomePageStatsGrid'
import RecentExercisesCard from './RecentExercisesCard'
import RestTimerCard from './RestTimerCard'
import type { HomeQuickAction } from './homepage-types'
import WeeklyGoalCard from './WeeklyGoalCard'

const SessionTimerModal = dynamic(() => import('@/components/ui/SessionTimerModal'), {
  ssr: false,
})

const SESSION_SOUNDS_KEY = 'irontrack-session-sounds'

interface UserSound {
  id: string
  name: string
  file_url: string
  created_at: string
}

export default function HomePageClient() {
  const [enableNonCriticalEnhancements, setEnableNonCriticalEnhancements] = useState(false)
  const { displayName } = useUserProfile(enableNonCriticalEnhancements)
  const { newBadgeEarned } = useBadges(enableNonCriticalEnhancements)
  const { stats, profileSummary, recentExercises, loading } = useHomeDashboard()
  const [showSessionTimer, setShowSessionTimer] = useState(false)
  const [sessionSteps, setSessionSteps] = useState([
    { name: 'Échauffement', duration: 300 },
    { name: 'Bloc principal', duration: 1200 },
    { name: 'Retour au calme', duration: 300 },
  ])
  const [userSounds, setUserSounds] = useState<UserSound[]>([])
  const [sessionSounds, setSessionSounds] = useState<(string | null)[]>([null, null, null])
  const [userId, setUserId] = useState<string | null>(null)
  const isPageLoading = loading

  useOnboardingCheck()

  useEffect(() => {
    const enhancementTimer = window.setTimeout(() => {
      startTransition(() => {
        setEnableNonCriticalEnhancements(true)
      })
    }, 1200)

    return () => window.clearTimeout(enhancementTimer)
  }, [])

  useEffect(() => {
    const syncUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserId(user?.id || null)
    }

    syncUser()

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('onboarding') === 'success') {
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

  useEffect(() => {
    async function fetchSounds() {
      const supabase = createClient()
      if (!userId) return

      const { data } = await supabase
        .from('user_sounds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setUserSounds(data)
      }
    }

    if (userId) {
      fetchSounds()
    }
  }, [showSessionTimer, userId])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_SOUNDS_KEY, JSON.stringify(sessionSounds))
    }
  }, [sessionSounds])

  useEffect(() => {
    setSessionSounds((sounds) => {
      if (sessionSteps.length === sounds.length) return sounds
      if (sessionSteps.length > sounds.length) {
        return [...sounds, ...Array(sessionSteps.length - sounds.length).fill(null)]
      }

      return sounds.slice(0, sessionSteps.length)
    })
  }, [sessionSteps.length])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const savedSteps = localStorage.getItem('irontrack-session-steps')
    if (savedSteps) {
      try {
        setSessionSteps(JSON.parse(savedSteps))
      } catch {
        return
      }
    }

    const savedSounds = localStorage.getItem(SESSION_SOUNDS_KEY)
    if (savedSounds) {
      try {
        setSessionSounds(JSON.parse(savedSounds))
      } catch {
        return
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('irontrack-session-steps', JSON.stringify(sessionSteps))
    }
  }, [sessionSteps])

  const quickActions: HomeQuickAction[] = [
    {
      name: 'Nouvelle séance',
      href: '/workouts/new',
      icon: Dumbbell,
      description: 'Lance une séance structurée sans détour.',
      isPrimary: true,
    },
    {
      name: 'Nouvel exercice',
      href: '/exercises/new',
      icon: Plus,
      description: 'Ajoute un exercice à ta bibliothèque.',
    },
    {
      name: 'Suivi nutrition',
      href: '/nutrition',
      icon: Apple,
      description: 'Enregistre tes repas essentiels.',
    },
    {
      name: 'Voir progression',
      href: '/progress',
      icon: TrendingUp,
      description: 'Analyse ta progression.',
    },
    {
      name: 'Timer multi-étapes',
      icon: Flame,
      description: 'Prépare ton flow de séance.',
      onClick: () => setShowSessionTimer(true),
    },
    {
      name: 'Bibliothèque exercices',
      href: '/exercises',
      icon: Trophy,
      description: 'Retrouve tes exercices clés.',
    },
  ]

  const resolvedDisplayName = useMemo(
    () =>
      !enableNonCriticalEnhancements || !displayName || displayName === 'Utilisateur'
        ? 'athlète'
        : displayName,
    [displayName, enableNonCriticalEnhancements],
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <HomePageHero
          displayName={resolvedDisplayName}
          stats={stats}
          onOpenAdvancedTimer={() => setShowSessionTimer(true)}
        />

        <HomePageStatsGrid stats={stats} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.72fr)] xl:items-stretch">
          <div className="order-2 xl:order-1">
            <RestTimerCard onOpenAdvancedTimer={() => setShowSessionTimer(true)} />
          </div>
          <div className="order-1 xl:order-2">
            <HomePageQuickActions actions={quickActions} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
          <RecentExercisesCard exercises={recentExercises} />
          <WeeklyGoalCard stats={stats} profileSummary={profileSummary} />
        </div>
      </div>

      {showSessionTimer ? (
        <SessionTimerModal
          steps={sessionSteps}
          userSounds={userSounds}
          sessionSounds={sessionSounds}
          onClose={() => setShowSessionTimer(false)}
          onStepsChange={setSessionSteps}
          onSoundsChange={setSessionSounds}
        />
      ) : null}

      {newBadgeEarned ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-2xl border border-emerald-500/30 bg-emerald-500/12 p-4 text-emerald-100 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/18 p-2">
              <Trophy className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Nouveau badge débloqué</p>
              <p className="text-sm text-emerald-200">{newBadgeEarned.name}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
