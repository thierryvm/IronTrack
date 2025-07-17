'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Dumbbell, 
  Calendar, 
  Apple, 
  Plus, 
  Trophy,
  Flame,
  Target,
  TrendingUp
} from 'lucide-react'
import { MascotWidget } from '@/components/ui/Mascot'
import SessionTimer from '@/components/ui/SessionTimer'
import SoundLibrary from '@/components/ui/SoundLibrary'
import { createClient } from '@/utils/supabase/client'
import Mascot from '@/components/ui/Mascot'
import { useRouter } from 'next/navigation'
import { QuickTimer } from '@/components/ui/Timer'
import { useUserProfile } from '@/hooks/useUserProfile'
import UserGreeting from '@/components/UserGreeting'

interface UserSound {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
}

const SESSION_SOUNDS_KEY = 'irontrack-session-sounds';

interface ExerciseItem {
  id: number;
  name: string;
  muscle_group?: string;
  last_weight?: number;
}

export default function HomePage() {
  const { isLoading: profileLoading } = useUserProfile()
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeek: 0,
    currentStreak: 0,
    totalWeight: 0
  })
  const [recentExercises, setRecentExercises] = useState<ExerciseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showSessionTimer, setShowSessionTimer] = useState(false)
  const [sessionSteps, setSessionSteps] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('irontrack-session-steps');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      { name: 'Rameur - Jambes', duration: 90 },
      { name: 'Repos', duration: 30 },
      { name: 'Rameur - Dos', duration: 60 },
    ];
  });
  const [userSounds, setUserSounds] = useState<UserSound[]>([])
  const [sessionSounds, setSessionSounds] = useState<(string | null)[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SESSION_SOUNDS_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return sessionSteps.map(() => null);
  });
  const [userId, setUserId] = useState<string | null>(null)
  const [mascotMsg, setMascotMsg] = useState<string|null>(null)
  const [showMascot, setShowMascot] = useState(false)
  const mascotJokes = [
    "Ce son a été benché hors de la playlist ! 🏋️‍♂️",
    "IronBuddy dit : 'Un de moins, la playlist respire !' 😅",
    "Supprimé ! Ce son n'était pas assez musclé pour rester... 💪",
    "IronBuddy a mis ce son à la retraite anticipée ! 🦾",
    "Adieu petit son, tu as bien vibré dans nos oreilles ! 🎶"
  ];
  const router = useRouter();
  const [allExercises, setAllExercises] = useState<ExerciseItem[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    async function fetchSounds() {
      const supabase = createClient();
      if (!userId) return;
      const { data, error } = await supabase
        .from('user_sounds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) setUserSounds(data);
    }
    if (userId) fetchSounds();
  }, [userId, showSessionTimer]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_SOUNDS_KEY, JSON.stringify(sessionSounds));
    }
  }, [sessionSounds]);

  useEffect(() => {
    setSessionSounds(sounds => {
      if (sessionSteps.length === sounds.length) return sounds;
      if (sessionSteps.length > sounds.length) {
        return [...sounds, ...Array(sessionSteps.length - sounds.length).fill(null)];
      }
      return sounds.slice(0, sessionSteps.length);
    });
  }, [sessionSteps.length]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchExercises = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('exercises').select('id, name, muscle_group');
      if (!error && data) setAllExercises(data);
    };
    fetchExercises();
  }, []);

  // Persistance de la config sessionSteps dans le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('irontrack-session-steps');
      if (saved) {
        try {
          setSessionSteps(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('irontrack-session-steps', JSON.stringify(sessionSteps));
    }
  }, [sessionSteps]);

  const loadDashboardData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRecentExercises([])
        setStats({ totalWorkouts: 0, thisWeek: 0, currentStreak: 0, totalWeight: 0 })
        setLoading(false)
        return
      }
      // Récupérer toutes les séances réalisées
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'Réalisé');
      // Récupérer toutes les performances
      const { data: perfLogs } = await supabase
        .from('performance_logs')
        .select('weight, reps, set_number, performed_at')
        .eq('user_id', user.id);
      // Récupérer les 3 derniers exercices avec leur dernière perf (conserve l'ancien code)
      const { data: perfLogsRecent } = await supabase
        .from('performance_logs')
        .select('exercise_id, weight, performed_at, exercises(name, muscle_group)')
        .eq('user_id', user.id)
        .order('performed_at', { ascending: false });
      if (workoutsError || !workouts) {
        setStats({ totalWorkouts: 0, thisWeek: 0, currentStreak: 0, totalWeight: 0 });
      } else {
        // 1. Total séances réalisées
        const totalWorkouts = workouts.length;
        // 2. Série en cours (current streak)
        const dates = workouts
          .map(w => w.scheduled_date)
          .filter(Boolean)
          .map(d => new Date(d).toISOString().slice(0, 10))
          .sort((a, b) => b.localeCompare(a));
        let streak = 0;
        const day = new Date();
        for (;;) {
          const dayStr = day.toISOString().slice(0, 10);
          if (dates.includes(dayStr)) {
            streak++;
            day.setDate(day.getDate() - 1);
          } else {
            break;
          }
        }
        // 3. Séances/semaine (7 derniers jours)
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 6);
        const workoutsThisWeek = dates.filter(d => d >= weekAgo.toISOString().slice(0, 10) && d <= now.toISOString().slice(0, 10)).length;
        // 4. Poids total soulevé (toutes perfs)
        let totalWeight = 0;
        if (perfLogs && Array.isArray(perfLogs)) {
          totalWeight = perfLogs
            .filter((p) => p.weight > 0 && p.reps > 0 && p.set_number > 0)
            .reduce((acc, p) => acc + (p.weight * p.reps * p.set_number), 0);
        }
        setStats({
          totalWorkouts,
          thisWeek: workoutsThisWeek,
          currentStreak: streak,
          totalWeight: Math.round(totalWeight)
        });
      }
      // Exercices récents (conserve l'ancien code)
      if (!perfLogsRecent) {
        setRecentExercises([])
      } else {
        type PerfLog = {
          exercise_id: number;
          weight: number;
          performed_at: string;
          exercises: { name: string; muscle_group?: string } | { name: string; muscle_group?: string }[];
        };
        const seen = new Set()
        const recent: ExerciseItem[] = []
        for (const log of perfLogsRecent as PerfLog[]) {
          let exerciseObj: { name: string; muscle_group?: string } | undefined;
          if (Array.isArray(log.exercises)) {
            exerciseObj = log.exercises[0];
          } else {
            exerciseObj = log.exercises;
          }
          if (!seen.has(log.exercise_id) && exerciseObj) {
            recent.push({
              id: log.exercise_id,
              name: exerciseObj.name,
              muscle_group: exerciseObj.muscle_group,
              last_weight: Number(log.weight) || 0
            })
            seen.add(log.exercise_id)
          }
          if (recent.length >= 3) break
        }
        setRecentExercises(recent)
      }
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setRecentExercises([])
      setStats({ totalWorkouts: 0, thisWeek: 0, currentStreak: 0, totalWeight: 0 })
      setLoading(false)
    }
  }

  const quickActions = [
    {
      name: 'Nouvel exercice',
      href: '/exercises/new',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Ajouter un exercice'
    },
    {
      name: 'Nouvelle séance',
      href: '/workouts/new',
      icon: Dumbbell,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Commencer une séance'
    },
    {
      name: 'Suivi nutrition',
      href: '/nutrition',
      icon: Apple,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Enregistrer un repas'
    },
    {
      name: 'Voir progression',
      href: '/progress',
      icon: TrendingUp,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Analyser tes progrès'
    },
    {
      name: 'Timer de session',
      href: '#',
      icon: Flame,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Lancer un timer multi-étapes',
      onClick: () => setShowSessionTimer(true),
    },
  ]


  const statCards = [
    {
      title: 'Séances totales',
      value: stats.totalWorkouts,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Cette semaine',
      value: stats.thisWeek,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Série en cours',
      value: stats.currentStreak,
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Poids total (kg)',
      value: stats.totalWeight,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    }
  ]

  // Ajout : fonction pour refresh les sons après ajout dans la SoundLibrary
  const refreshUserSounds = async () => {
    const supabase = createClient();
    if (!userId) return;
    const { data, error } = await supabase
      .from('user_sounds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) setUserSounds(data);
  };

  function handleSoundDeleted() {
    const msg = mascotJokes[Math.floor(Math.random()*mascotJokes.length)];
    setMascotMsg(msg);
    setShowMascot(true);
    setTimeout(()=>setShowMascot(false), 4000);
  }

  // 1. Ajout de skeletons pendant le loading
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Skeleton stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 min-h-[110px] animate-pulse">
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
                <div className="h-8 w-2/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          {/* Skeleton quickActions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 min-h-[220px] animate-pulse">
                <div className="h-6 w-1/4 bg-gray-200 rounded mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl p-6 shadow-md bg-gray-100 min-h-[90px]" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 w-full">
              <div className="bg-white rounded-xl shadow-md p-6 min-h-[180px] animate-pulse" />
            </div>
          </div>
          {/* Skeleton barre de progression */}
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 min-h-[120px] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-gray-900 dark:to-gray-800 text-white dark:text-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UserGreeting showError={true} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Séance du jour - Section prioritaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <h2 className="text-3xl font-bold mb-2">Prêt pour ta séance ?</h2>
                <p className="text-orange-100 text-lg">
                  {stats.thisWeek === 0 
                    ? "Commence ta première séance de la semaine !" 
                    : `Tu as déjà fait ${stats.thisWeek} séance${stats.thisWeek > 1 ? 's' : ''} cette semaine 💪`
                  }
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/workouts/new"
                  className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <Dumbbell className="h-6 w-6" />
                  Commencer ma séance
                </Link>
                <Link
                  href="/calendar"
                  className="bg-orange-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-2 border-2 border-orange-500"
                >
                  <Calendar className="h-5 w-5" />
                  Voir le planning
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow min-h-[110px] min-w-[180px]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} dark:bg-gray-700`}>
                    <Icon className={`h-6 w-6 ${stat.color} dark:text-yellow-400`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Actions rapides</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">Que veux-tu faire aujourd&apos;hui ?</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  // Palette personnalisée
                  const tileColors = [
                    'from-green-400 to-green-500 dark:from-green-700 dark:to-green-900', // Exercice
                    'from-orange-400 to-orange-500 dark:from-orange-700 dark:to-orange-900', // Séance
                    'from-blue-400 to-blue-500 dark:from-blue-700 dark:to-blue-900', // Nutrition
                    'from-purple-400 to-purple-500 dark:from-purple-700 dark:to-purple-900', // Progression
                    'from-yellow-400 to-yellow-500 dark:from-yellow-700 dark:to-yellow-900' // Timer
                  ];
                  const bg = tileColors[index % tileColors.length];
                  return (
                    <Link
                      key={action.name}
                      href={action.href || '#'}
                      onClick={action.onClick}
                      className={`flex flex-col justify-between rounded-xl p-6 shadow-md text-white dark:text-gray-100 font-semibold text-lg transition-all duration-200 bg-gradient-to-r ${bg} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[90px] min-w-[180px]`}
                    >
                      <div className="flex items-center mb-2">
                        <Icon className="h-7 w-7 mr-3" />
                        <span>{action.name}</span>
                      </div>
                      <span className="text-sm font-normal text-white dark:text-gray-200 opacity-80">{action.description}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Colonne de droite : timer + exercices récents */}
          <div className="flex flex-col gap-6 w-full">
            {/* Temps de repos rapide (réduit) */}
            <QuickTimer />
            {/* Exercices récents */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full min-h-[180px]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Exercices récents</h2>
              <div className="space-y-3">
                {recentExercises.map((exercise: ExerciseItem, index: number) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{exercise.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{exercise.muscle_group}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-500 dark:text-orange-300 font-bold">
                        {exercise.last_weight === 0 ? 'Poids du corps' : `${exercise.last_weight} kg`}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-300">Dernier poids</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link href="/exercises" className="block mt-4 text-orange-500 dark:text-orange-300 text-sm font-semibold hover:underline">Voir tous les exercices →</Link>
            </div>
          </div>
        </div>

        {/* Section motivation améliorée */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white min-h-[140px] relative"
        >
          {/* Info bulle explicative */}
          <div className="absolute top-4 right-4 group">
            <button className="bg-purple-600 hover:bg-purple-700 rounded-full p-2 transition-colors">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="absolute right-0 top-10 bg-gray-800 text-white text-xs rounded-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <p className="font-semibold mb-1">Comment ça marche ?</p>
              <p>Les objectifs se basent sur tes séances marquées comme &quot;Réalisé&quot; ou &quot;Terminé&quot;. Va dans &quot;Séances&quot; pour marquer tes entraînements comme terminés !</p>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-yellow-300" />
              <h2 className="text-2xl font-bold">Objectif de la semaine</h2>
            </div>
            
            {/* Messages contextuels personnalisés */}
            <div className="mb-6">
              {stats.thisWeek >= 4 ? (
                <p className="text-purple-100 text-lg animate-pulse">
                  🎉 Félicitations ! Tu as atteint ton objectif de la semaine !
                </p>
              ) : stats.thisWeek === 0 ? (
                <p className="text-purple-100 text-lg">
                  💪 Prêt à démarrer ? Commence ta première séance de la semaine !
                </p>
              ) : (
                <p className="text-purple-100 text-lg">
                  🔥 Tu es sur la bonne voie ! Complète 4 séances pour débloquer le badge &quot;Déterminé&quot; 🏅
                </p>
              )}
              
              {/* Debug temporaire pour vérifier les stats */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs text-purple-200 bg-purple-700 rounded p-2">
                  Debug: thisWeek={stats.thisWeek}, currentStreak={stats.currentStreak}, totalWorkouts={stats.totalWorkouts}
                </div>
              )}
            </div>
            
            {/* Progression visuelle */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold">{stats.thisWeek}/4</p>
                <p className="text-sm text-purple-100">Séances réalisées</p>
              </div>
              
              {/* Barre de progression animée */}
              <div className="flex-1 max-w-md w-full">
                <div className="w-full bg-purple-600 rounded-full h-4 mb-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-4 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${Math.min((stats.thisWeek / 4) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-purple-100 font-semibold">
                  {stats.thisWeek >= 4 
                    ? "🎯 Objectif atteint ! Bravo !" 
                    : `Plus que ${4 - stats.thisWeek} séance${4 - stats.thisWeek > 1 ? 's' : ''} à faire !`
                  }
                </p>
              </div>
              
              {/* Streak counter amélioré */}
              <div className="text-center bg-purple-600 rounded-lg p-3 min-w-[80px]">
                <div className="text-3xl mb-1">
                  {stats.currentStreak > 0 ? '🔥' : '💪'}
                </div>
                <p className="text-lg font-bold text-yellow-300">
                  {stats.currentStreak > 0 
                    ? `${stats.currentStreak}`
                    : "0"
                  }
                </p>
                <p className="text-xs text-purple-100">
                  {stats.currentStreak > 0 
                    ? `jour${stats.currentStreak > 1 ? 's' : ''} de série`
                    : 'Commence ta série'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mascotte */}
      <MascotWidget />

      {/* Modal SessionTimer */}
      {showSessionTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          {/* Mascotte blague suppression son */}
          <Mascot message={mascotMsg || undefined} type="success" show={showMascot} />
          <div className="bg-white rounded-3xl shadow-2xl p-0 max-w-xl w-full relative flex flex-col border border-[#E5E7EB] max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white rounded-t-3xl">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Configurer ta session</h2>
              <button
                onClick={() => setShowSessionTimer(false)}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors"
                title="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-6 bg-white overflow-y-auto" style={{maxHeight:'calc(90vh - 72px)'}}>
              {/* Liste des étapes/exercices */}
              <div className="w-full max-w-2xl mx-auto space-y-2" style={{maxHeight:'260px', overflowY:'auto'}}>
                {sessionSteps.map((step: { name: string; duration: number }, idx: number) => (
                  <div key={idx} className="flex flex-row items-center gap-1 bg-[#F6F8FA] rounded-lg p-2 shadow-sm border border-[#E5E7EB] min-h-[48px]">
                    {/* Icône à gauche */}
                    <span className="text-xl text-gray-700 flex-shrink-0">🏋️‍♂️</span>
                    {/* Sélecteur d'exercice existant */}
                    <select
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-sm min-w-[90px] max-w-[140px] focus:ring-2 focus:ring-orange-400 truncate h-9 bg-white flex-shrink-0 text-gray-900"
                      style={{height:'36px', width:'130px'}} 
                      value={allExercises.find((ex: ExerciseItem) => ex.name === step.name)?.id ?? ''}
                      onChange={(e) => {
                        const exo = allExercises.find((ex: ExerciseItem) => ex.id === Number(e.target.value));
                        if (exo) {
                          const newSteps = [...sessionSteps];
                          newSteps[idx].name = exo.name;
                          setSessionSteps(newSteps);
                        }
                      }}
                    >
                      <option value="">Exercice existant...</option>
                      {allExercises.map((ex: ExerciseItem) => (
                        <option key={ex.id} value={ex.id}>{ex.name}{ex.muscle_group ? ` (${ex.muscle_group})` : ''}</option>
                      ))}
                    </select>
                    {/* Nom de l'étape modifiable */}
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => {
                        const newSteps = [...sessionSteps]
                        newSteps[idx].name = e.target.value
                        setSessionSteps(newSteps)
                      }}
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-sm font-semibold flex-1 min-w-0 focus:ring-2 focus:ring-orange-400 h-9 bg-white truncate text-gray-900"
                      placeholder="Nom de l'étape"
                      style={{height:'36px', minWidth:'60px', maxWidth:'100%'}}
                    />
                    {/* Champ durée */}
                    <input
                      type="number"
                      min={1}
                      value={step.duration}
                      onChange={(e) => {
                        const newSteps = [...sessionSteps]
                        newSteps[idx].duration = Number(e.target.value)
                        setSessionSteps(newSteps)
                      }}
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-sm w-12 text-center focus:ring-2 focus:ring-orange-400 h-9 bg-white flex-shrink-0 text-gray-900"
                      placeholder="Durée"
                      style={{height:'36px', width:'48px'}}
                    />
                    {/* Sélecteur de son */}
                    <select
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-sm w-24 min-w-[60px] max-w-[100px] focus:ring-2 focus:ring-orange-400 truncate h-9 bg-white flex-shrink-0 text-gray-900"
                      style={{height:'36px', width:'90px'}}
                      value={sessionSounds[idx] || ''}
                      onChange={(e) => {
                        setSessionSounds(sounds => {
                          const arr = [...sounds];
                          arr[idx] = e.target.value || null;
                          return arr;
                        });
                      }}
                    >
                      <option value="">Aucun son</option>
                      {userSounds.map(sound => (
                        <option key={sound.id} value={sound.id}>{sound.name}</option>
                      ))}
                    </select>
                    {/* Bouton play */}
                    {sessionSounds[idx] && (
                      <button
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full p-2 shadow flex-shrink-0 ml-2 h-9 w-9 flex items-center justify-center"
                        title="Écouter le son"
                        onClick={() => {
                          const sound = userSounds.find(s => s.id === sessionSounds[idx]);
                          if (sound) {
                            const audio = new Audio(sound.file_url);
                            audio.play();
                          }
                        }}
                        style={{height:'36px', width:'36px'}}
                      >
                        <span className="sr-only">Écouter</span>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6V4z" /></svg>
                      </button>
                    )}
                    {/* Bouton supprimer (croix) */}
                    <button
                      onClick={() => setSessionSteps((steps: { name: string; duration: number }[]) => steps.filter((steps: { name: string; duration: number }, i: number) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 text-lg font-bold ml-1 flex-shrink-0 h-9 w-9 flex items-center justify-center"
                      title="Supprimer l'étape"
                      style={{height:'36px', width:'36px'}}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSessionSteps([...sessionSteps, { name: 'Nouvelle étape', duration: 60 }])}
                  className="mt-2 text-sm text-orange-600 hover:underline font-semibold"
                >
                  + Ajouter une étape
                </button>
              </div>
              {/* Timer juste en dessous des étapes */}
              <div className="w-full flex items-center justify-center mt-8 mb-8">
                <SessionTimer
                  steps={sessionSteps.map((step: { name: string; duration: number }, idx: number) => ({ ...step, soundUrl: (userSounds.find(s => s.id === sessionSounds[idx])?.file_url) || undefined }))}
                  autoStart={false}
                />
              </div>
              {/* Bibliothèque de sons en bas */}
              <div className="w-full max-w-2xl mx-auto border-t border-[#E5E7EB] pt-6 mt-4">
                <SoundLibrary
                  userId={userId || ''}
                  selectedSoundId={undefined}
                  onSoundAdded={refreshUserSounds}
                  onSoundDeleted={handleSoundDeleted}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
