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
import { QuickTimer } from '@/components/ui/Timer'
import SessionTimer from '@/components/ui/SessionTimer'
import SoundLibrary from '@/components/ui/SoundLibrary'
import { createClient } from '@/lib/supabase'
import Mascot from '@/components/ui/Mascot'
import { useRouter } from 'next/navigation'

interface UserSound {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
}

const SESSION_SOUNDS_KEY = 'irontrack-session-sounds';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeek: 0,
    currentStreak: 0,
    totalWeight: 0
  })
  const [recentExercises, setRecentExercises] = useState<Array<{ id: number; name: string; muscle_group: string; last_weight: number }>>([])
  const [loading, setLoading] = useState(true)
  const [showSessionTimer, setShowSessionTimer] = useState(false)
  const [sessionSteps, setSessionSteps] = useState([
    { name: 'Rameur - Jambes', duration: 90 },
    { name: 'Repos', duration: 30 },
    { name: 'Rameur - Dos', duration: 60 },
  ])
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
  type ExerciseOption = { id: number; name: string; muscle_group?: string };
  const [allExercises, setAllExercises] = useState<ExerciseOption[]>([]);

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
      // Récupérer les 3 derniers exercices avec leur dernière perf
      const { data: perfLogs, error } = await supabase
        .from('performance_logs')
        .select('exercise_id, weight, performed_at, exercises(name, muscle_group)')
        .eq('user_id', user.id)
        .order('performed_at', { ascending: false })
      if (error || !perfLogs) {
        setRecentExercises([])
      } else {
        // Grouper par exercice, ne garder que la dernière perf de chaque
        const seen = new Set()
        const recent = []
        for (const log of perfLogs) {
          if (!seen.has(log.exercise_id) && log.exercises) {
            recent.push({
              id: log.exercise_id,
              name: log.exercises.name,
              muscle_group: log.exercises.muscle_group,
              last_weight: Number(log.weight) || 0
            })
            seen.add(log.exercise_id)
          }
          if (recent.length >= 3) break
        }
        setRecentExercises(recent)
      }
      // (Optionnel) Récupérer les stats réelles ici aussi si besoin
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setRecentExercises([])
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

  console.log('quickActions:', quickActions);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de ton dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">
              Bonjour Thierry ! 💪
            </h1>
            <p className="text-xl text-orange-100">
              Prêt pour une nouvelle séance de musculation ?
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
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
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  // Palette personnalisée
                  const tileColors = [
                    'from-green-400 to-green-500', // Exercice
                    'from-orange-400 to-orange-500', // Séance
                    'from-blue-400 to-blue-500', // Nutrition
                    'from-purple-400 to-purple-500', // Progression
                    'from-yellow-400 to-yellow-500' // Timer
                  ];
                  const bg = tileColors[index % tileColors.length];
                  return (
                    <motion.div
                      key={action.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {action.href && !action.onClick ? (
                        <Link
                          href={action.href}
                          className={`w-full flex flex-col items-start justify-between px-6 py-6 rounded-2xl shadow-lg bg-gradient-to-br ${bg} text-white hover:scale-[1.03] transition-transform min-h-[120px]`}
                        >
                          <div className="flex items-center mb-2">
                            <Icon className="h-8 w-8 mr-3 opacity-90" />
                            <span className="text-lg font-bold">{action.name}</span>
                          </div>
                          <span className="text-sm font-medium opacity-90 mt-2">{action.description}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={action.onClick}
                          className={`w-full flex flex-col items-start justify-between px-6 py-6 rounded-2xl shadow-lg bg-gradient-to-br ${bg} text-white hover:scale-[1.03] transition-transform min-h-[120px]`}
                        >
                          <div className="flex items-center mb-2">
                            <Icon className="h-8 w-8 mr-3 opacity-90" />
                            <span className="text-lg font-bold">{action.name}</span>
                          </div>
                          <span className="text-sm font-medium opacity-90 mt-2">{action.description}</span>
                        </button>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Timer et exercices récents */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Timer rapide */}
            <QuickTimer />

            {/* Exercices récents */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Exercices récents</h2>
              <div className="space-y-3">
                {recentExercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                      <p className="text-sm text-gray-600">{exercise.muscle_group}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">{exercise.last_weight === 0 ? 'Poids du corps' : `${exercise.last_weight} kg`}</p>
                      <p className="text-xs text-gray-500">Dernier poids</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link
                href="/exercises"
                className="block text-center mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Voir tous les exercices →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Section motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Objectif de la semaine</h2>
            <p className="text-purple-100 mb-4">
              Complète 4 séances cette semaine pour débloquer le badge &quot;Déterminé&quot; 🏅
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.thisWeek}/4</p>
                <p className="text-sm text-purple-100">Séances</p>
              </div>
              <div className="w-32 bg-purple-600 rounded-full h-2">
                <div 
                  className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.thisWeek / 4) * 100}%` }}
                ></div>
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
                {sessionSteps.map((step, idx) => (
                  <div key={idx} className="flex flex-row items-center gap-1 bg-[#F6F8FA] rounded-lg p-2 shadow-sm border border-[#E5E7EB] min-h-[48px]">
                    {/* Icône à gauche */}
                    <span className="text-xl text-gray-700 flex-shrink-0">🏋️‍♂️</span>
                    {/* Sélecteur d'exercice existant */}
                    <select
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-sm min-w-[90px] max-w-[140px] focus:ring-2 focus:ring-orange-400 truncate h-9 bg-white flex-shrink-0 text-gray-900"
                      style={{height:'36px', width:'130px'}} 
                      value={allExercises.find(e => e.name === step.name)?.id ?? ''}
                      onChange={e => {
                        const exo = allExercises.find(ex => ex.id === Number(e.target.value));
                        if (exo) {
                          const newSteps = [...sessionSteps];
                          newSteps[idx].name = exo.name;
                          setSessionSteps(newSteps);
                        }
                      }}
                    >
                      <option value="">Exercice existant...</option>
                      {allExercises.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name}{ex.muscle_group ? ` (${ex.muscle_group})` : ''}</option>
                      ))}
                    </select>
                    {/* Nom de l'étape modifiable */}
                    <input
                      type="text"
                      value={step.name}
                      onChange={e => {
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
                      onChange={e => {
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
                      onChange={e => {
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
                      onClick={() => setSessionSteps(steps => steps.filter((_, i) => i !== idx))}
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
                  steps={sessionSteps.map((step, idx) => ({ ...step, soundUrl: (userSounds.find(s => s.id === sessionSounds[idx])?.file_url) || undefined }))}
                  autoStart={false}
                />
              </div>
              {/* Bibliothèque de sons en bas */}
              <div className="w-full max-w-2xl mx-auto border-t border-[#E5E7EB] pt-6 mt-4">
                <SoundLibrary
                  userId={userId || ''}
                  onSelect={() => {}}
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
