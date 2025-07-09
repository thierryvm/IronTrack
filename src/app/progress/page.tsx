'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Trophy, 
  Calendar,
  BarChart3,
  Dumbbell,
  Flame,
  Award,
  Activity,
  Plus,
  X as Close
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { createClient } from '@/lib/supabase'
import type { TrainingGoal } from '@/types/training-goal';

interface ProgressData {
  date: string
  weight: number
  reps: number
  sets: number
  exercise: string
}

interface ExerciseProgress {
  exercise: string
  muscle_group: string
  current_weight: number
  previous_weight: number
  improvement: number
  trend: 'up' | 'down' | 'stable'
}

interface UserExercise {
  id: number;
  name: string;
}

// Définir un type pour les logs de performance
interface PerfLog {
  performed_at: string;
  weight?: number;
  reps?: number;
  set_number?: number;
  exercise_id: string;
  exercises?: { name?: string; muscle_groups?: { name?: string } };
}

const muscleGroupColors = {
  'Pectoraux': '#FF6B6B',
  'Dos': '#4ECDC4',
  'Épaules': '#45B7D1',
  'Biceps': '#96CEB4',
  'Triceps': '#FFEAA7',
  'Jambes': '#DDA0DD',
  'Abdominaux': '#98D8C8',
  'Fessiers': '#F7DC6F'
}

// Ajout d'une fonction utilitaire pour attribuer un badge si objectif atteint
async function awardGoalBadge(goal: TrainingGoal, userId: string) {
  const supabase = createClient();
  // Vérifie si le badge existe déjà
  const { data: existing } = await supabase
    .from('achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('name', `Objectif atteint: ${goal.exercises?.name}`)
    .single();
  if (!existing) {
    await supabase.from('achievements').insert({
      user_id: userId,
      name: `Objectif atteint: ${goal.exercises?.name}`,
      description: `Tu as atteint ton objectif sur ${goal.exercises?.name} !`,
      icon: '🏅',
      category: 'Objectifs',
      unlocked_at: new Date().toISOString(),
    });
  }
}

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30j')
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [trainingGoals, setTrainingGoals] = useState<TrainingGoal[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalExerciseId, setGoalExerciseId] = useState('')
  const [goalType, setGoalType] = useState<'kg' | 'reps'>('kg')
  const [goalValue, setGoalValue] = useState('')
  const [goalLoading, setGoalLoading] = useState(false)
  const [goalError, setGoalError] = useState('')
  const [userExercises, setUserExercises] = useState<UserExercise[]>([])
  const [userGender, setUserGender] = useState<string | null>(null)
  const lastPunchlineRef = useRef<string | null>(null)

  useEffect(() => {
    loadProgressData()
    loadTrainingGoals()
    fetchExercises()
    fetchGender()
  }, [selectedPeriod])

  const loadProgressData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      // Récupérer l'utilisateur courant
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProgressData([])
        setExerciseProgress([])
        setLoading(false)
        return
      }
      // Récupérer toutes les performances de l'utilisateur
      const { data: perfLogsRaw } = await supabase
        .from('performance_logs')
        .select('*, exercise_id, exercises(name, muscle_group_id, muscle_groups(name))')
        .eq('user_id', user.id)
        .order('performed_at', { ascending: true })
      const perfLogs: PerfLog[] = perfLogsRaw as PerfLog[];
      if (!perfLogs) {
        setProgressData([])
        setExerciseProgress([])
        setLoading(false)
        return
      }
      // Mise en forme des données pour les widgets
      // 1. ProgressData pour le graphique principal (par date)
      const progressData: ProgressData[] = perfLogs.map((log) => ({
        date: log.performed_at.split('T')[0],
        weight: Number(log.weight) || 0,
        reps: log.reps || 0,
        sets: log.set_number || 1,
        exercise: log.exercises?.name || `Exercice #${log.exercise_id}`
      }))
      // 2. Calcul de la progression par exercice
      const exerciseMap: Record<string, { name: string, muscle_group: string, weights: number[] }> = {}
      perfLogs.forEach((log) => {
        const exName = log.exercises?.name || `Exercice #${log.exercise_id}`
        const mgName = log.exercises?.muscle_groups?.name || 'Autre'
        if (!exerciseMap[log.exercise_id]) {
          exerciseMap[log.exercise_id] = { name: exName, muscle_group: mgName, weights: [] }
        }
        exerciseMap[log.exercise_id].weights.push(Number(log.weight) || 0)
      })
      const exerciseProgress: ExerciseProgress[] = Object.entries(exerciseMap).map(([, ex]) => {
        const current_weight = ex.weights[ex.weights.length - 1] || 0
        const previous_weight = ex.weights[0] || 0
        const improvement = previous_weight > 0 ? ((current_weight - previous_weight) / previous_weight) * 100 : 0
        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (current_weight > previous_weight) trend = 'up'
        else if (current_weight < previous_weight) trend = 'down'
        return {
          exercise: ex.name,
          muscle_group: ex.muscle_group,
          current_weight,
          previous_weight,
          improvement: Math.round(improvement * 10) / 10,
          trend
        }
      })
      setProgressData(progressData)
      setExerciseProgress(exerciseProgress)
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  const loadTrainingGoals = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setTrainingGoals([])
        return
      }
      const { data: goals } = await supabase
        .from('training_goals')
        .select('*, exercises(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      setTrainingGoals(goals || [])
    } catch {
      setTrainingGoals([])
    }
  }

  const fetchExercises = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('exercises')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    if (data) setUserExercises(data)
  }

  const fetchGender = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', user.id)
      .single()
    if (data) setUserGender(data.gender)
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setGoalLoading(true)
    setGoalError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')
      if (!goalExerciseId || !goalValue) {
        setGoalError('Remplis tous les champs !')
        setGoalLoading(false)
        return
      }
      const insertData: Omit<TrainingGoal, 'id' | 'exercises'> = {
        user_id: user.id,
        exercise_id: Number(goalExerciseId),
        target_weight: goalType === 'kg' ? Number(goalValue) : null,
        target_reps: goalType === 'reps' ? Number(goalValue) : null,
        created_at: new Date().toISOString()
      }
      const { error } = await supabase.from('training_goals').insert(insertData)
      if (error) throw error
      setShowGoalModal(false)
      setGoalExerciseId('')
      setGoalType('kg')
      setGoalValue('')
      setTimeout(() => loadTrainingGoals(), 300)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGoalError(err.message || 'Erreur inconnue')
      } else {
        setGoalError('Erreur inconnue')
      }
    }
    setGoalLoading(false)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Ajout du filtrage selon la période sélectionnée
  const getStartDate = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case '7j':
        return new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      case '30j':
        return new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
      case '90j':
        return new Date(Date.now() - 89 * 24 * 60 * 60 * 1000);
      case '1an':
        return new Date(new Date().setFullYear(now.getFullYear() - 1));
      default:
        return null;
    }
  };
  const startDate = getStartDate();
  const filteredProgressData = startDate
    ? progressData.filter(d => new Date(d.date) >= startDate)
    : progressData;
  // Nouveau calcul : ne prendre en compte que les perfs avec poids > 0
  const weightedSessions = filteredProgressData.filter((session) => session.weight > 0)
  const totalWeightLiftedKg = weightedSessions.reduce((total, session) =>
    total + (session.weight * session.reps * session.sets), 0
  )
  const averageWeight = weightedSessions.length > 0
    ? weightedSessions.reduce((sum, session) => sum + session.weight, 0) / weightedSessions.length
    : 0
  const totalSessions = progressData.length

  // Affichage du total soulevé (kg ou t)
  const totalWeightDisplay = totalWeightLiftedKg >= 1000
    ? `${(totalWeightLiftedKg / 1000).toFixed(1)} t`
    : `${totalWeightLiftedKg.toFixed(1)} kg`

  // Calcul de l'amélioration globale (si possible)
  let globalImprovement = 'N/A'
  if (weightedSessions.length > 1) {
    const first = weightedSessions[0].weight
    const last = weightedSessions[weightedSessions.length - 1].weight
    if (first > 0) {
      const percent = ((last - first) / first) * 100
      globalImprovement = `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`
    }
  }

  // Punchlines IronBuddy selon la progression
  const getSouleverPhrase = () => {
    if (userGender === 'Femme') return 'le voisin'
    if (userGender === 'Homme') return 'la voisine'
    if (userGender === 'Autre') return 'le voisin ou la voisine'
    return 'tout le quartier'
  }

  // Punchlines spéciales lundi
  const mondayPunchlines = [
    "C'est lundi, on bosse les jambes ! (Personne n'y échappe, même pas IronBuddy) 🦵",
    "Lundi motivation : la fonte n'attend pas !",
    "Si tu t'entraînes un lundi, tu peux tout affronter cette semaine !",
    "Lundi = gains garantis. IronBuddy surveille tes squats !"
  ]

  // Punchlines enrichies par catégorie
  const punchlines = {
    lowWeight: [
      "Rome ne s'est pas faite en un jour, ni tes biceps ! Continue comme ça 💪",
      "Petit à petit, la fonte fait son nid ! 🐣",
      "Courage, chaque kilo compte ! 🏋️‍♂️",
      "Un jour tu soulèveras plus que ton sac de courses ! 🛒"
    ],
    midWeight: [
      `La fonte commence à chauffer, bientôt tu soulèveras ${getSouleverPhrase()} ! 🏋️‍♂️`,
      "On sent que ça progresse, la fonte n'a qu'à bien se tenir !",
      "Bientôt tu soulèveras la salle entière ! 🏟️"
    ],
    highWeight: [
      "Tu passes la barre des 500kg, Hulk commence à trembler ! 💚",
      "500kg ? IronBuddy va devoir appeler les Avengers !",
      "La gravité commence à s'inquiéter..."
    ],
    tonWeight: [
      "1 tonne soulevée ! Appelle la NASA, t'es plus humain 🚀",
      "IronBuddy propose de te sponsoriser pour les JO ! 🥇",
      "La salle va devoir renforcer le plancher !"
    ],
    regularity: [
      "10 séances, la régularité c'est la clé ! IronBuddy est fier de toi 🔑",
      "La persévérance paie toujours, continue comme ça !",
      "IronBuddy commence à s'inquiéter pour les haltères..."
    ],
    improvement: [
      "+10% d'amélioration, tu vas devoir changer de t-shirt ! 👕",
      "Progression de mutant, IronBuddy valide !",
      "On va devoir renforcer la salle !"
    ],
    regression: [
      "Petite baisse, mais IronBuddy sait que tu vas rebondir ! 🔄",
      "Même les champions ont des jours off, ne lâche rien !",
      "La fonte te teste, montre-lui qui est le boss !"
    ],
    default: [
      "IronBuddy te surveille... et il est impressionné ! 🦾",
      "Un jour sans punchline est un jour sans gain !",
      "Continue, la mascotte est fière de toi !"
    ]
  }

  // Sélectionne une punchline aléatoire différente de la précédente
  function getRandomPunchline(arr: string[]) {
    let filtered = arr
    if (lastPunchlineRef.current && arr.length > 1) {
      filtered = arr.filter(p => p !== lastPunchlineRef.current)
    }
    const punch = filtered[Math.floor(Math.random() * filtered.length)]
    lastPunchlineRef.current = punch
    return punch
  }

  // Logique de sélection contextuelle
  let ironBuddyMsg = ''
  const today = new Date()
  if (today.getDay() === 1) { // 1 = lundi
    ironBuddyMsg = getRandomPunchline(mondayPunchlines)
  } else if (totalWeightLiftedKg < 100) {
    ironBuddyMsg = getRandomPunchline(punchlines.lowWeight)
  } else if (totalWeightLiftedKg >= 100 && totalWeightLiftedKg < 500) {
    ironBuddyMsg = getRandomPunchline(punchlines.midWeight)
  } else if (totalWeightLiftedKg >= 500 && totalWeightLiftedKg < 1000) {
    ironBuddyMsg = getRandomPunchline(punchlines.highWeight)
  } else if (totalWeightLiftedKg >= 1000) {
    ironBuddyMsg = getRandomPunchline(punchlines.tonWeight)
  } else if (totalSessions >= 10) {
    ironBuddyMsg = getRandomPunchline(punchlines.regularity)
  } else if (globalImprovement !== 'N/A' && parseFloat(globalImprovement) > 10) {
    ironBuddyMsg = getRandomPunchline(punchlines.improvement)
  } else if (globalImprovement !== 'N/A' && parseFloat(globalImprovement) < 0) {
    ironBuddyMsg = getRandomPunchline(punchlines.regression)
  } else {
    ironBuddyMsg = getRandomPunchline(punchlines.default)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de tes progrès...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold">Progression</h1>
            <p className="text-orange-100">Suis tes performances et tes objectifs</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques générales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Poids moyen</p>
                <p className="text-2xl font-bold text-gray-900">{averageWeight > 0 ? `${averageWeight.toFixed(1)} kg` : 'Poids du corps'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total soulevé</p>
                <p className="text-2xl font-bold text-gray-900">{totalWeightDisplay}</p>
                {ironBuddyMsg && <p className="text-xs text-orange-500 mt-1 italic">{ironBuddyMsg}</p>}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Dumbbell className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Séances</p>
                <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amélioration</p>
                <p className="text-2xl font-bold text-gray-900">{globalImprovement}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Graphique de progression */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Progression du poids</h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7j">7 jours</option>
                <option value="30j">30 jours</option>
                <option value="90j">90 jours</option>
                <option value="1an">1 an</option>
              </select>
            </div>
            {filteredProgressData.length < 2 ? (
              <div className="text-center text-gray-500 py-8">
                <span>Pas assez de données pour afficher une courbe de progression.</span>
                <span className="block">Ajoute plus de séances pour voir ta progression !</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    formatter={(value: number | string) => [`${value} kg`, 'Poids']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Répartition par groupe musculaire */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Répartition par groupe musculaire</h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(muscleGroupColors).map(([group, color]) => ({
                    name: group,
                    value: Math.floor(Math.random() * 20) + 10, // Données simulées
                    color
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`}
                >
                  {Object.entries(muscleGroupColors).map(([group, color]) => (
                    <Cell key={group} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Progression par exercice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Progression par exercice</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Exercice</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Groupe musculaire</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Poids actuel</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Poids précédent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amélioration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tendance</th>
                </tr>
              </thead>
              <tbody>
                {exerciseProgress.map((exercise, index) => (
                  <motion.tr
                    key={exercise.exercise}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{exercise.exercise}</td>
                    <td className="py-3 px-4 text-gray-600">{exercise.muscle_group}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{exercise.current_weight} kg</td>
                    <td className="py-3 px-4 text-gray-600">{exercise.previous_weight} kg</td>
                    <td className={`py-3 px-4 font-medium ${getTrendColor(exercise.trend)}`}>
                      {exercise.improvement > 0 ? '+' : ''}{exercise.improvement.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      {getTrendIcon(exercise.trend)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Objectifs et badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
        >
          {/* Objectifs */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Target className="h-6 w-6 text-orange-500" />
                <span>Objectifs</span>
              </h2>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-sm"
                onClick={() => setShowGoalModal(true)}
              >
                <Plus className="h-4 w-4" /> Ajouter
              </button>
            </div>
            <div className="space-y-4">
              {trainingGoals.length === 0 && (
                <div className="text-gray-500 text-sm">Aucun objectif défini pour l&apos;instant. Ajoute-en un pour te challenger !</div>
              )}
              {trainingGoals.filter(goal => {
                let bestPerf: ProgressData | null = null;
                if (goal.target_reps && goal.target_reps > 1) {
                  const filtered = progressData
                    .filter((p) => p.weight === 0 && goal.exercises?.name && p.exercise === goal.exercises.name);
                  bestPerf = filtered.length > 0 ? filtered.reduce((max, p) => (max && p.reps > max.reps ? p : max), filtered[0]) : null;
                } else {
                  const filtered = progressData
                    .filter((p) => goal.exercises?.name && p.exercise === goal.exercises.name);
                  bestPerf = filtered.length > 0 ? filtered.reduce((max, p) => (max && p.weight > max.weight ? p : max), filtered[0]) : null;
                }
                const currentVal = bestPerf ? (goal.target_reps && goal.target_reps > 1 ? bestPerf.reps : bestPerf.weight) : 0;
                const targetVal = goal.target_reps && goal.target_reps > 1 ? goal.target_reps : goal.target_weight;
                if (typeof targetVal === 'number' && currentVal >= targetVal && targetVal) {
                  createClient().auth.getUser().then(async ({ data: { user } }) => {
                    if (user) {
                      // Mettre à jour le statut de l'objectif à 'Atteint' dans Supabase
                      await createClient()
                        .from('training_goals')
                        .update({ status: 'Atteint', updated_at: new Date().toISOString() })
                        .eq('id', goal.id);
                      // Attribuer le badge
                      awardGoalBadge(goal, user.id);
                    }
                  });
                  return false;
                }
                return true;
              }).map((goal) => {
                let bestPerf: ProgressData | null = null;
                if (goal.target_reps && goal.target_reps > 1) {
                  const filtered = progressData
                    .filter((p) => p.weight === 0 && goal.exercises?.name && p.exercise === goal.exercises.name);
                  bestPerf = filtered.length > 0 ? filtered.reduce((max, p) => (max && p.reps > max.reps ? p : max), filtered[0]) : null;
                } else {
                  const filtered = progressData
                    .filter((p) => goal.exercises?.name && p.exercise === goal.exercises.name);
                  bestPerf = filtered.length > 0 ? filtered.reduce((max, p) => (max && p.weight > max.weight ? p : max), filtered[0]) : null;
                }
                const current = bestPerf ? (goal.target_reps && goal.target_reps > 1 ? bestPerf.reps : bestPerf.weight) : 0;
                const target = goal.target_reps && goal.target_reps > 1 ? goal.target_reps : goal.target_weight;
                const unit = goal.target_reps && goal.target_reps > 1 ? 'reps' : 'kg';
                const percent = typeof target === 'number' && target ? Math.min((current / target) * 100, 100) : 0;
                return (
                  <div key={goal.id} className={`p-4 rounded-lg ${unit === 'kg' ? 'bg-orange-50' : 'bg-green-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{goal.exercises?.name} {target}{unit}</h3>
                      <span className={`text-sm ${unit === 'kg' ? 'text-orange-600' : 'text-green-600'}`}>{current}/{target} {unit}</span>
                    </div>
                    <div className={`w-full ${unit === 'kg' ? 'bg-orange-200' : 'bg-green-200'} rounded-full h-2`}>
                      <div className={`${unit === 'kg' ? 'bg-orange-500' : 'bg-green-500'} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Award className="h-6 w-6 text-yellow-500" />
              <span>Badges</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Badge Déterminé */}
              <div className={`text-center p-4 rounded-lg ${(trainingGoals.filter(g => g.status === 'Atteint').length) >= 10 ? 'bg-yellow-50' : 'bg-gray-50 opacity-50'}`}>
                <Trophy className={`h-8 w-8 mx-auto mb-2 ${(trainingGoals.filter(g => g.status === 'Atteint').length) >= 10 ? 'text-yellow-500' : 'text-gray-400'}`} />
                <h3 className={`font-medium ${(trainingGoals.filter(g => g.status === 'Atteint').length) >= 10 ? 'text-gray-900' : 'text-gray-500'}`}>Déterminé</h3>
                <p className={`text-sm ${(trainingGoals.filter(g => g.status === 'Atteint').length) >= 10 ? 'text-gray-600' : 'text-gray-400'}`}>10 séances consécutives</p>
                {(trainingGoals.filter(g => g.status === 'Atteint').length) >= 10 && <div className="text-xs text-gray-500 mt-1">Atteint le {new Date().toLocaleDateString('fr-FR')}</div>}
              </div>
              {/* Badge Force brute */}
              <div className={`text-center p-4 rounded-lg ${(trainingGoals.filter(g => (g.target_weight ?? 0) >= 50).length) >= 1 ? 'bg-orange-50' : 'bg-gray-50 opacity-50'}`}>
                <Flame className={`h-8 w-8 mx-auto mb-2 ${(trainingGoals.filter(g => (g.target_weight ?? 0) >= 50).length) >= 1 ? 'text-orange-500' : 'text-gray-400'}`} />
                <h3 className={`font-medium ${(trainingGoals.filter(g => (g.target_weight ?? 0) >= 50).length) >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>Force brute</h3>
                <p className={`text-sm ${(trainingGoals.filter(g => (g.target_weight ?? 0) >= 50).length) >= 1 ? 'text-gray-600' : 'text-gray-400'}`}>+50kg au total</p>
                {(trainingGoals.filter(g => (g.target_weight ?? 0) >= 50).length) >= 1 && <div className="text-xs text-gray-500 mt-1">Atteint le {new Date().toLocaleDateString('fr-FR')}</div>}
              </div>
              {/* Badge Objectif atteint (exemple : 100kg développé couché) */}
              <div className={`text-center p-4 rounded-lg ${trainingGoals.some(g => (g.target_weight ?? 0) >= 100 && g.exercises?.name === 'Développé couché' && g.status === 'Atteint') ? 'bg-blue-50' : 'bg-gray-50 opacity-50'}`}>
                <span className={`h-8 w-8 mx-auto mb-2 flex items-center justify-center text-3xl ${trainingGoals.some(g => (g.target_weight ?? 0) >= 100 && g.exercises?.name === 'Développé couché' && g.status === 'Atteint') ? '' : 'grayscale text-gray-400'}`}>🏋️‍♂️</span>
                <h3 className={`font-medium ${trainingGoals.some(g => (g.target_weight ?? 0) >= 100 && g.exercises?.name === 'Développé couché' && g.status === 'Atteint') ? 'text-gray-900' : 'text-gray-500'}`}>Objectif atteint</h3>
                <p className={`text-sm ${trainingGoals.some(g => (g.target_weight ?? 0) >= 100 && g.exercises?.name === 'Développé couché' && g.status === 'Atteint') ? 'text-gray-600' : 'text-gray-400'}`}>100kg développé couché</p>
                {trainingGoals.filter(g => (g.target_weight ?? 0) >= 100 && g.exercises?.name === 'Développé couché' && g.status === 'Atteint').map(g => (
                  <div key={g.id} className="text-xs text-gray-500 mt-1">Atteint le {new Date(g.updated_at || g.created_at).toLocaleDateString('fr-FR')}</div>
                ))}
              </div>
              {/* Badge Régulier */}
              <div className={`text-center p-4 rounded-lg ${(trainingGoals.filter(g => g.status === 'Atteint').length) >= 30 ? 'bg-gray-100' : 'bg-gray-50 opacity-50'}`}>
                <Calendar className={`h-8 w-8 mx-auto mb-2 ${(trainingGoals.filter(g => g.status === 'Atteint').length) >= 30 ? 'text-gray-700' : 'text-gray-400'}`} />
                <h3 className={`font-medium ${(trainingGoals.filter(g => g.status === 'Atteint').length) >= 30 ? 'text-gray-900' : 'text-gray-500'}`}>Régulier</h3>
                <p className={`text-sm ${(trainingGoals.filter(g => g.status === 'Atteint').length) >= 30 ? 'text-gray-600' : 'text-gray-400'}`}>30 jours consécutifs</p>
                {(trainingGoals.filter(g => g.status === 'Atteint').length) >= 30 && <div className="text-xs text-gray-500 mt-1">Atteint le {new Date().toLocaleDateString('fr-FR')}</div>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modal ajout objectif */}
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <form
              onSubmit={handleAddGoal}
              className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative"
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                onClick={() => setShowGoalModal(false)}
                title="Fermer"
              >
                <Close className="h-6 w-6" />
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" /> Nouvel objectif
              </h3>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Exercice</label>
                <select
                  value={goalExerciseId}
                  onChange={e => setGoalExerciseId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Sélectionne un exercice</option>
                  {userExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Type d&apos;objectif</label>
                <select
                  value={goalType}
                  onChange={e => setGoalType(e.target.value as 'kg' | 'reps')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="kg">Poids (kg)</option>
                  <option value="reps">Répétitions (reps)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Valeur cible</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={goalValue}
                  onChange={e => setGoalValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              {goalError && <div className="text-red-500 text-sm mb-2">{goalError}</div>}
              <button
                type="submit"
                disabled={goalLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {goalLoading ? 'Ajout...' : <><Plus className="h-4 w-4" /> Ajouter l&apos;objectif</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
} 