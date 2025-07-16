'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  BarChart3,
  Dumbbell,
  Award,
  Activity,
  Plus,
  X as Close,
  Pencil,
  Trash2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { createClient } from '@/utils/supabase/client'
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

// Helper pour générer les données complètes d'un badge
function getBadgeData(exerciseName: string, goalType: string, goalValue: string, extraKg?: string, extraDuration?: string, extraSpeed?: string) {
  const name = exerciseName.toLowerCase();
  
  // Génération de l'icône selon l'exercice
  let icon = '🏅';
  if (name.includes('vélo')) icon = '🚴‍♂️';
  else if (name.includes('tapis') || name.includes('course')) icon = '🏃‍♂️';
  else if (name.includes('rameur')) icon = '🚣‍♂️';
  else if (name.includes('marche')) icon = '🚶‍♂️';
  else if (name.includes('développé couché')) icon = '🏋️‍♂️';
  else if (name.includes('développé incliné')) icon = '🏋️‍♂️';
  else if (name.includes('développé militaire')) icon = '💪';
  else if (name.includes('développé')) icon = '🏋️‍♂️'; // Pour tous les autres types de développé
  else if (name.includes('pompes')) icon = '🤸‍♂️';
  else if (name.includes('squat')) icon = '🏋️‍♀️';
  else if (name.includes('tractions')) icon = '🧗‍♂️';
  else if (name.includes('abdos') || name.includes('gainage')) icon = '💪';
  else if (name.includes('curl') || name.includes('biceps')) icon = '💪';
  else if (name.includes('dips') || name.includes('triceps')) icon = '🤸‍♂️';
  else if (name.includes('soulev') || name.includes('deadlift')) icon = '🏋️';
  else if (name.includes('rowing') || name.includes('tirage')) icon = '🔥';
  else if (name.includes('natation') || name.includes('swim')) icon = '🏊‍♂️';
  
  // Génération de la description complète
  let description = '';
  if (goalType === 'kg') {
    description = `${goalValue} kg`;
  } else if (goalType === 'reps') {
    description = `${goalValue} reps`;
    if (extraKg) description += ` à ${extraKg} kg`;
    if (extraDuration) description += ` en ${extraDuration} min`;
  } else if (goalType === 'duration') {
    description = `${goalValue} min`;
  } else if (goalType === 'distance') {
    description = `${goalValue} km`;
    if (extraDuration) description += ` en ${extraDuration} min`;
    if (extraSpeed) description += ` à ${extraSpeed} km/h`;
  } else if (goalType === 'speed') {
    description = `${goalValue} km/h`;
  } else if (goalType === 'calories') {
    description = `${goalValue} kcal`;
  }
  
  return {
    icon,
    name: exerciseName,
    description,
    category: 'Objectifs'
  };
}

// Créer automatiquement un badge "En cours" lors de l'ajout d'un objectif
async function createGoalBadge(exerciseName: string, goalType: string, goalValue: string, userId: string, goalId: number, extraKg?: string, extraDuration?: string, extraSpeed?: string) {
  const supabase = createClient();
  const badgeData = getBadgeData(exerciseName, goalType, goalValue, extraKg, extraDuration, extraSpeed);
  
  try {
    const { error } = await supabase.from('achievements').insert({
      user_id: userId,
      name: badgeData.name,
      description: badgeData.description,
      icon: badgeData.icon,
      category: badgeData.category,
      status: 'En cours', // Statut initial
      goal_id: goalId, // Lien vers l'objectif
      created_at: new Date().toISOString(),
      unlocked_at: null // Sera défini quand l'objectif sera atteint
    });
    
    if (error) {
      console.error('Erreur création badge:', error.message);
    }
  } catch (err) {
    console.error('Erreur création badge:', err);
  }
}

// Valider un badge quand l'objectif est atteint
async function validateGoalBadge(goalId: number, userId: string, badgeId?: number) {
  const supabase = createClient();
  
  try {
    // Essayer d'abord avec l'ID du badge si fourni (plus fiable)
    if (badgeId) {
      const { data: dataById, error: errorById } = await supabase
        .from('achievements')
        .update({ 
          status: 'Validé',
          unlocked_at: new Date().toISOString()
        })
        .eq('id', badgeId)
        .eq('user_id', userId)
        .select();
      
      if (!errorById && dataById?.length > 0) {
        return; // Succès !
      }
    }
    
    // Fallback avec goal_id + user_id
    const { error } = await supabase
      .from('achievements')
      .update({ 
        status: 'Validé',
        unlocked_at: new Date().toISOString()
      })
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('Erreur validation badge:', error.message);
    }
  } catch (err) {
    console.error('Erreur validation badge:', err);
  }
}

// Rétrograder un badge quand l'objectif n'est plus atteint
async function downgradeBadge(goalId: number, userId: string, badgeId?: number) {
  const supabase = createClient();
  
  try {
    // Essayer d'abord avec l'ID du badge si fourni
    if (badgeId) {
      const { data: dataById, error: errorById } = await supabase
        .from('achievements')
        .update({ 
          status: 'En cours',
          unlocked_at: null
        })
        .eq('id', badgeId)
        .eq('user_id', userId)
        .select();
      
      if (!errorById && dataById?.length > 0) {
        return; // Succès !
      }
    }
    
    // Fallback avec goal_id + user_id
    const { error } = await supabase
      .from('achievements')
      .update({ 
        status: 'En cours',
        unlocked_at: null
      })
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('Erreur rétrogradation badge:', error.message);
    }
  } catch (err) {
    console.error('Erreur rétrogradation badge:', err);
  }
}

// Fonction utilitaire pour icône et texte badge selon l'objectif (non utilisée actuellement)
/* function getBadgeIconAndText(goal: TrainingGoal) {
  if (!goal.exercises?.name) return { icon: '🏅', title: 'Objectif', desc: '' };
  const name = goal.exercises.name.toLowerCase();
  // Attribution d'icônes spécifiques selon l'exercice ou le type d'objectif
  if (name.includes('vélo')) {
    return {
      icon: '🚴‍♂️',
      title: goal.exercises.name,
      desc: badgeDesc(goal)
    };
  }
  if (name.includes('tapis')) {
    return {
      icon: '🏃‍♂️',
      title: goal.exercises.name,
      desc: badgeDesc(goal)
    };
  }
  if (name.includes('rameur')) {
    return {
      icon: '🚣‍♂️',
      title: goal.exercises.name,
      desc: badgeDesc(goal)
    };
  }
  if (name.includes('course')) {
    return {
      icon: '🏃‍♂️',
      title: goal.exercises.name,
      desc: badgeDesc(goal)
    };
  }
  if (name.includes('marche')) {
    return {
      icon: '🚶‍♂️',
      title: goal.exercises.name,
      desc: badgeDesc(goal)
    };
  }
  // Muscu classiques
  if (goal.exercises.name === 'Développé couché') {
    return {
      icon: '🏋️‍♂️',
      title: 'Développé couché',
      desc: badgeDesc(goal)
    };
  }
  if (goal.exercises.name === 'Pompes') {
    return {
      icon: '🤸‍♂️',
      title: 'Pompes',
      desc: badgeDesc(goal)
    };
  }
  if (goal.exercises.name === 'Squat') {
    return {
      icon: '🏋️‍♀️',
      title: 'Squat',
      desc: badgeDesc(goal)
    };
  }
  if (goal.exercises.name === 'Tractions') {
    return {
      icon: '🧗‍♂️',
      title: 'Tractions',
      desc: badgeDesc(goal)
    };
  }
  if (goal.exercises.name === 'Abdos') {
    return {
      icon: '💪',
      title: 'Abdos',
      desc: badgeDesc(goal)
    };
  }
  // Par défaut
  return {
    icon: '🏅',
    title: goal.exercises.name,
    desc: badgeDesc(goal)
  };
} */
// Helper pour la description dynamique
function badgeDesc(goal: TrainingGoal) {
  if (goal.target_weight) return `${goal.target_weight} kg`;
  if (goal.target_reps) {
    const kg = (goal as unknown as Record<string, unknown>).extra_kg;
    const dur = (goal as unknown as Record<string, unknown>).extra_duration;
    if (kg && dur) return `${goal.target_reps} reps à ${kg} kg en ${dur} min`;
    if (kg) return `${goal.target_reps} reps à ${kg} kg`;
    if (dur) return `${goal.target_reps} reps en ${dur} min`;
    return `${goal.target_reps} reps`;
  }
  if ((goal as unknown as Record<string, unknown>).target_distance) {
    const dur = (goal as unknown as Record<string, unknown>).extra_duration;
    const speed = (goal as unknown as Record<string, unknown>).extra_speed;
    if (dur && speed) return `${(goal as unknown as Record<string, unknown>).target_distance} km en ${dur} min à ${speed} km/h`;
    if (dur) return `${(goal as unknown as Record<string, unknown>).target_distance} km en ${dur} min`;
    if (speed) return `${(goal as unknown as Record<string, unknown>).target_distance} km à ${speed} km/h`;
    return `${(goal as unknown as Record<string, unknown>).target_distance} km`;
  }
  if ((goal as unknown as Record<string, unknown>).target_duration) return `${(goal as unknown as Record<string, unknown>).target_duration} min`;
  if ((goal as unknown as Record<string, unknown>).target_calories) return `${(goal as unknown as Record<string, unknown>).target_calories} kcal`;
  return '';
}

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30j')
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [trainingGoals, setTrainingGoals] = useState<TrainingGoal[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalExerciseId, setGoalExerciseId] = useState('')
  type GoalType = 'kg' | 'reps' | 'duration' | 'distance' | 'speed' | 'calories';
  const [goalType, setGoalType] = useState<GoalType>('kg')
  const [goalValue, setGoalValue] = useState('')
  const [goalLoading, setGoalLoading] = useState(false)
  const [goalError, setGoalError] = useState('')
  const [userExercises, setUserExercises] = useState<UserExercise[]>([])
  const [userGender, setUserGender] = useState<string | null>(null)
  const lastPunchlineRef = useRef<string | null>(null)
  const [achievements, setAchievements] = useState<{id: number, name: string, description: string, icon: string, status: 'En cours' | 'Validé', goal_id?: number}[]>([])

  // Ajout d'un état pour l'animation de félicitations
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsMsg, setCongratsMsg] = useState('');

  // Ajout d'un état pour l'édition et la suppression d'objectifs
  const [editGoalId, setEditGoalId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<TrainingGoal | null>(null);

  // Ajout d'un champ poids additionnel si besoin
  const [goalExtraKg, setGoalExtraKg] = useState('');
  // Ajout d'un champ durée additionnelle si besoin
  const [goalExtraDuration, setGoalExtraDuration] = useState('');
  // Ajout d'un champ vitesse additionnelle si besoin
  const [goalExtraSpeed, setGoalExtraSpeed] = useState('');

  // Suggestions muscu avancées avec durée
  const muscuRepsKgDuration = [
    'développé couché', 'squat', 'tractions', 'dips', 'soulevé de terre', 'rowing', 'développé militaire', 'curl', 'presse', 'fentes', 'hip thrust', 'mollets', 'abdos lestés'
  ];

  // Suggestions cardio avancées
  const cardioTypes = ['tapis', 'vélo', 'rameur', 'course', 'marche'];

  useEffect(() => {
    loadProgressData()
    loadTrainingGoals()
    fetchExercises()
    fetchGender()
    loadAchievements()
  }, [selectedPeriod])
  
  // Fonction pour synchroniser les badges avec les objectifs atteints
  const syncAchievementsWithGoals = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // IMPORTANT: Recharger les badges AVANT la synchronisation
    const { data: freshBadges } = await supabase
      .from('achievements')
      .select('id, name, description, icon, status, goal_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    
    // Récupérer les objectifs atteints DIRECTEMENT depuis la base de données
    const { data: freshGoals } = await supabase
      .from('training_goals')
      .select(`
        id,
        status,
        exercises:exercise_id (name)
      `)
      .eq('user_id', user.id)
      .eq('status', 'Atteint');
    
    
    if (!freshGoals || !freshBadges) return;
    
    for (const goal of freshGoals) {
      const correspondingBadge = freshBadges.find(badge => badge.goal_id === goal.id);
      
      if (correspondingBadge && correspondingBadge.status !== 'Validé') {
        await validateGoalBadge(goal.id, user.id, correspondingBadge.id);
      } else if (!correspondingBadge) {
      } else if (correspondingBadge.status === 'Validé') {
      }
    }
    
    // Vérifier les badges "Validés" qui n'ont plus d'objectif "Atteint" correspondant
    const validatedBadges = freshBadges.filter(badge => badge.status === 'Validé' && badge.goal_id);
    for (const badge of validatedBadges) {
      const hasCorrespondingGoal = freshGoals.find(goal => goal.id === badge.goal_id);
      if (!hasCorrespondingGoal) {
        // L'objectif n'est plus atteint, rétrograder le badge
        await downgradeBadge(badge.goal_id!, user.id, badge.id);
      }
    }
    
    // Recharger les achievements après synchronisation pour mettre à jour le state React
    setTimeout(() => loadAchievements(), 1000);
  }

  const loadAchievements = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('achievements')
      .select('id, name, description, icon, status, goal_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setAchievements(data)
  }

  // useEffect pour recalculer le statut des objectifs après modification ou changement de performances
  useEffect(() => {
    async function checkAndUpdateGoals() {
      const supabase = createClient();
      
      for (const goal of trainingGoals) {
        
        let currentVal = 0;
        let targetVal = 0;
        let isGoalMet = false;
        
        // Logique pour différents types d'objectifs
        if (goal.target_weight) {
          // Objectif de poids (développé couché, etc.)
          const filtered = progressData.filter((p) => goal.exercises?.name && p.exercise === goal.exercises.name);
          const bestPerf = filtered.length > 0 ? filtered.reduce((max, p) => (max && p.weight > max.weight ? p : max), filtered[0]) : null;
          currentVal = bestPerf ? bestPerf.weight : 0;
          targetVal = goal.target_weight;
        } else if (goal.target_reps) {
          // Objectif de répétitions
          const filtered = progressData.filter((p) => p.weight === 0 && goal.exercises?.name && p.exercise === goal.exercises.name);
          const bestPerf = filtered.length > 0 ? filtered.reduce((max, p) => (max && p.reps > max.reps ? p : max), filtered[0]) : null;
          currentVal = bestPerf ? bestPerf.reps : 0;
          targetVal = goal.target_reps;
        } else if ((goal as unknown as Record<string, unknown>).target_distance) {
          // Objectif de distance (vélo, course, etc.) - Pour l'instant, on considère comme atteint si l'exercice a été fait
          const filtered = progressData.filter((p) => goal.exercises?.name && p.exercise === goal.exercises.name);
          isGoalMet = filtered.length > 0; // Simplification pour les tests
        } else if ((goal as unknown as Record<string, unknown>).target_duration) {
          // Objectif de durée
          const filtered = progressData.filter((p) => goal.exercises?.name && p.exercise === goal.exercises.name);
          isGoalMet = filtered.length > 0; // Simplification pour les tests
        }
        
        // Vérifier si l'objectif est atteint
        const goalAchieved = isGoalMet || (targetVal > 0 && currentVal >= targetVal);
        
        if (goalAchieved && goal.status !== 'Atteint') {
          await supabase.from('training_goals').update({ status: 'Atteint', updated_at: new Date().toISOString() }).eq('id', goal.id);
          
          // Valider le badge correspondant et animation
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await validateGoalBadge(goal.id, user.id);
            handleGoalAchieved(goal);
            // Recharger les achievements pour mettre à jour l'affichage
            setTimeout(() => loadAchievements(), 500);
          }
        } else if (!goalAchieved && goal.status === 'Atteint') {
          await supabase.from('training_goals').update({ status: 'En cours' }).eq('id', goal.id);
          
          // Rétrograder le badge correspondant
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await downgradeBadge(goal.id, user.id);
            // Recharger les achievements pour mettre à jour l'affichage
            setTimeout(() => loadAchievements(), 500);
          }
        }
      }
    }
    if (trainingGoals.length > 0 && progressData.length > 0) {
      checkAndUpdateGoals();
      // Synchroniser les badges après mise à jour des objectifs
      setTimeout(() => syncAchievementsWithGoals(), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingGoals, progressData]);

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
      // Construction dynamique selon le type d'objectif
      const insertData: Record<string, unknown> = {
        user_id: user.id,
        exercise_id: Number(goalExerciseId),
        created_at: new Date().toISOString(),
        target_weight: null,
        target_reps: null,
        target_duration: null,
        target_distance: null,
        target_speed: null,
        target_calories: null,
        extra_kg: null,
        extra_duration: null,
      }
      if (goalType === 'kg') {
        insertData.target_weight = Number(goalValue);
      } else if (goalType === 'reps') {
        insertData.target_reps = Number(goalValue);
        if (goalExtraKg) insertData.extra_kg = Number(goalExtraKg);
        if (goalExtraDuration) insertData.extra_duration = Number(goalExtraDuration);
      } else if (goalType === 'duration') {
        insertData.target_duration = Number(goalValue);
      } else if (goalType === 'distance') {
        insertData.target_distance = Number(goalValue);
        if (goalExtraDuration) insertData.extra_duration = Number(goalExtraDuration);
        if (goalExtraSpeed) insertData.extra_speed = Number(goalExtraSpeed);
      } else if (goalType === 'speed') {
        insertData.target_speed = Number(goalValue);
      } else if (goalType === 'calories') {
        insertData.target_calories = Number(goalValue);
      }

      let error = null;
      let newGoalId = null;
      
      if (editGoalId) {
        // Edition d'un objectif existant
        const { error: updateError } = await supabase.from('training_goals').update(insertData).eq('id', editGoalId)
        error = updateError
        newGoalId = editGoalId
      } else {
        // Création d'un nouvel objectif
        const { data: goalData, error: insertError } = await supabase.from('training_goals').insert(insertData).select('id').single()
        error = insertError
        if (goalData) newGoalId = goalData.id
      }
      if (error) throw error
      
      // Créer automatiquement un badge "En cours" pour les nouveaux objectifs
      if (!editGoalId && newGoalId) {
        const selectedExercise = userExercises.find(ex => ex.id === Number(goalExerciseId));
        if (selectedExercise) {
          await createGoalBadge(
            selectedExercise.name,
            goalType,
            goalValue,
            user.id,
            newGoalId,
            goalExtraKg,
            goalExtraDuration,
            goalExtraSpeed
          );
          // Recharger les achievements pour afficher le nouveau badge
          setTimeout(() => loadAchievements(), 500);
        }
      }
      setShowGoalModal(false)
      setGoalExerciseId('')
      setGoalType('kg')
      setGoalValue('')
      setGoalExtraKg('') // Reset extra_kg
      setGoalExtraDuration('') // Reset extra_duration
      setGoalExtraSpeed('') // Reset extra_speed
      setEditGoalId(null)
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
    "C\'est lundi, on bosse les jambes ! (Personne n\'y échappe, même pas IronBuddy) 🦵",
    "Lundi motivation : la fonte n\'attend pas !",
    "Si tu t\'entraînes un lundi, tu peux tout affronter cette semaine !",
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
      "On sent que ça progresse, la fonte n\'a qu\'à bien se tenir !",
      "Bientôt tu soulèveras la salle entière ! 🏟️"
    ],
    highWeight: [
      "Tu passes la barre des 500kg, Hulk commence à trembler ! 💚",
      "500kg ? IronBuddy va devoir appeler les Avengers !",
      "La gravité commence à s\'inquiéter..."
    ],
    tonWeight: [
      "1 tonne soulevée ! Appelle la NASA, t\'es plus humain 🚀",
      "IronBuddy propose de te sponsoriser pour les JO ! 🥇",
      "La salle va devoir renforcer le plancher !"
    ],
    regularity: [
      "10 séances, la régularité c\'est la clé ! IronBuddy est fier de toi 🔑",
      "La persévérance paie toujours, continue comme ça !",
      "IronBuddy commence à s\'inquiéter pour les haltères..."
    ],
    improvement: [
      "+10% d\'amélioration, tu vas devoir changer de t-shirt ! 👕",
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

  // Dans la logique où un objectif passe à \'Atteint\', déclencher l\'animation
  const handleGoalAchieved = (goal: TrainingGoal) => {
    setCongratsMsg(`Bravo Thierry, badge débloqué : ${goal.exercises?.name} ${goal.target_weight ? goal.target_weight + 'kg' : goal.target_reps ? goal.target_reps + ' reps' : ''} ! 🏅`);
    setShowCongrats(true);
    
    // Rafraîchir les badges après validation
    setTimeout(async () => {
      await loadAchievements();
      setShowCongrats(false);
      
      // Redirection vers l'onglet profil/statistiques après 2 secondes pour laisser le temps à la DB de se synchroniser
      setTimeout(() => {
        window.location.href = '/profile?refresh=' + Date.now();
      }, 2000);
    }, 3500);
  };

  // Pré-remplir le formulaire pour l\'édition
  const handleEditGoal = (goal: TrainingGoal) => {
    setEditGoalId(goal.id);
    setGoalExerciseId(goal.exercise_id.toString());
    // Déduire le type d\'objectif et la valeur
    if ((goal as unknown as Record<string, unknown>).target_duration) {
      setGoalType('duration');
      setGoalValue((goal as unknown as Record<string, unknown>).target_duration?.toString() ?? '');
    } else if ((goal as unknown as Record<string, unknown>).target_distance) {
      setGoalType('distance');
      setGoalValue((goal as unknown as Record<string, unknown>).target_distance?.toString() ?? '');
    } else if ((goal as unknown as Record<string, unknown>).target_speed) {
      setGoalType('speed');
      setGoalValue((goal as unknown as Record<string, unknown>).target_speed?.toString() ?? '');
    } else if ((goal as unknown as Record<string, unknown>).target_calories) {
      setGoalType('calories');
      setGoalValue((goal as unknown as Record<string, unknown>).target_calories?.toString() ?? '');
    } else if (goal.target_weight) {
      setGoalType('kg');
      setGoalValue(goal.target_weight.toString());
    } else if (goal.target_reps) {
      setGoalType('reps');
      setGoalValue(goal.target_reps.toString());
      if ((goal as unknown as Record<string, unknown>).extra_kg) setGoalExtraKg((goal as unknown as Record<string, unknown>).extra_kg?.toString() ?? '');
      if ((goal as unknown as Record<string, unknown>).extra_duration) setGoalExtraDuration((goal as unknown as Record<string, unknown>).extra_duration?.toString() ?? '');
      if ((goal as unknown as Record<string, unknown>).extra_speed) setGoalExtraSpeed((goal as unknown as Record<string, unknown>).extra_speed?.toString() ?? '');
    }
    setShowGoalModal(true);
  };

  // Suppression d'un objectif
  const handleDeleteGoal = (goal: TrainingGoal) => {
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };
  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;
    const supabase = createClient();
    await supabase.from('training_goals').delete().eq('id', goalToDelete.id);
    setShowDeleteModal(false);
    setGoalToDelete(null);
    loadTrainingGoals();
  };
  const cancelDeleteGoal = () => {
    setShowDeleteModal(false);
    setGoalToDelete(null);
  };

  // Générateur de suggestions d'objectifs selon l'exercice sélectionné
  function getGoalSuggestions(exerciseName: string | undefined): Array<{label: string, type: GoalType, value: number, extraKg?: number, extraDuration?: number, extraSpeed?: number}> {
    if (!exerciseName) return [];
    const name = exerciseName.toLowerCase();
    // Cardio avancé
    for (const c of cardioTypes) {
      if (name.includes(c)) {
        return [
          { label: '3 km en 15 min', type: 'distance', value: 3, extraDuration: 15 },
          { label: '5 km à 10 km/h', type: 'distance', value: 5, extraSpeed: 10 },
          { label: '30 min de ' + c, type: 'duration', value: 30 },
          { label: '10 km de ' + c, type: 'distance', value: 10 },
        ];
      }
    }
    // Muscu avancé
    for (const exo of muscuRepsKgDuration) {
      if (name.includes(exo)) {
        return [
          { label: `10 reps à 80 kg en 2 min`, type: 'reps', value: 10, extraKg: 80, extraDuration: 2 },
          { label: `20 reps à 60 kg`, type: 'reps', value: 20, extraKg: 60 },
          { label: `100 kg ${exo}`, type: 'kg', value: 100 },
        ];
      }
    }
    // Pompes, abdos, gainage, etc. (reps only)
    if (name.includes('pompes') || name.includes('abdos') || name.includes('gainage')) {
      return [
        { label: '20 pompes', type: 'reps', value: 20 },
        { label: '50 pompes', type: 'reps', value: 50 },
      ];
    }
    // Cardio
    if (name.includes('course')) {
      return [
        { label: '5 km de course', type: 'distance', value: 5 },
        { label: '30 min de course', type: 'duration', value: 30 },
        { label: '10 km/h sur 20 min', type: 'speed', value: 10 },
      ];
    }
    if (name.includes('tapis')) {
      return [
        { label: '30 min de tapis', type: 'duration', value: 30 },
        { label: '3 km sur tapis', type: 'distance', value: 3 },
      ];
    }
    if (name.includes('vélo')) {
      return [
        { label: '10 km de vélo', type: 'distance', value: 10 },
        { label: '45 min de vélo', type: 'duration', value: 45 },
      ];
    }
    if (name.includes('rameur')) {
      return [
        { label: '2000 m rameur', type: 'distance', value: 2 },
        { label: '20 min rameur', type: 'duration', value: 20 },
      ];
    }
    // Suggestions génériques
    return [
      { label: '30 min d’activité', type: 'duration', value: 30 },
      { label: '100 kcal brûlées', type: 'calories', value: 100 },
    ];
  }

  // Préparation du JSX conditionnel pour le formulaire d'objectif
  let dynamicGoalFields: React.ReactNode = null;
  if (showGoalModal) {
    const selected = userExercises.find(ex => String(ex.id) === String(goalExerciseId));
    const suggestions = getGoalSuggestions(selected?.name);
    dynamicGoalFields = (
      <>
        {/* Suggestions d’objectifs dynamiques */}
        {suggestions.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Suggestions d’objectifs</label>
            <p className="text-xs text-gray-500 mb-2">Clique sur une suggestion pour pré-remplir le formulaire automatiquement et gagner du temps (et de la motivation) ! 💡</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-sm hover:bg-orange-200"
                  onClick={() => {
                    setGoalType(s.type);
                    setGoalValue(s.value.toString());
                    if (s.extraDuration) setGoalExtraDuration(s.extraDuration.toString());
                    if (s.extraSpeed) setGoalExtraSpeed(s.extraSpeed.toString());
                    if (s.extraKg) setGoalExtraKg(s.extraKg.toString());
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Type d&apos;objectif</label>
          <select
            value={goalType}
            onChange={e => setGoalType(e.target.value as GoalType)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
          >
            <option value="kg">Poids (kg)</option>
            <option value="reps">Répétitions (reps)</option>
            <option value="duration">Durée (minutes)</option>
            <option value="distance">Distance (km)</option>
            <option value="speed">Vitesse (km/h)</option>
            <option value="calories">Calories</option>
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
            placeholder={
              goalType === 'kg' ? 'Ex: 100 (kg)' :
              goalType === 'reps' ? 'Ex: 20 (répétitions)' :
              goalType === 'duration' ? 'Ex: 30 (minutes)' :
              goalType === 'distance' ? 'Ex: 5 (km)' :
              goalType === 'speed' ? 'Ex: 6 (km/h)' :
              goalType === 'calories' ? 'Ex: 200' :
              ''
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        {/* Champ poids additionnel si objectif reps + kg généralisé */}
        {goalType === 'reps' && selected && muscuRepsKgDuration.some(exo => selected.name.toLowerCase().includes(exo)) && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Durée max (minutes)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={goalExtraDuration}
              onChange={e => setGoalExtraDuration(e.target.value)}
              placeholder="Ex: 2 (minutes)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}
        {goalType === 'distance' && selected && cardioTypes.some(c => selected.name.toLowerCase().includes(c)) && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Durée max (minutes)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={goalExtraDuration}
                onChange={e => setGoalExtraDuration(e.target.value)}
                placeholder="Ex: 15 (minutes)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Vitesse cible (km/h)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={goalExtraSpeed}
                onChange={e => setGoalExtraSpeed(e.target.value)}
                placeholder="Ex: 10 (km/h)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </>
        )}
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Skeleton header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 rounded-xl mb-8 animate-pulse min-h-[80px]" />
          {/* Skeleton stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 min-h-[110px] animate-pulse" />
            ))}
          </div>
          {/* Skeleton graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 min-h-[340px] animate-pulse" />
            <div className="bg-white rounded-xl shadow-md p-6 min-h-[340px] animate-pulse" />
          </div>
          {/* Skeleton progression par exercice */}
          <div className="bg-white rounded-xl shadow-md p-6 min-h-[180px] animate-pulse" />
          {/* Skeleton objectifs et badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-xl shadow-md p-6 min-h-[180px] animate-pulse" />
            <div className="bg-white rounded-xl shadow-md p-6 min-h-[180px] animate-pulse" />
          </div>
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
          <div className="bg-white rounded-xl shadow-md p-6 min-h-[110px]">
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

          <div className="bg-white rounded-xl shadow-md p-6 min-h-[110px]">
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

          <div className="bg-white rounded-xl shadow-md p-6 min-h-[110px]">
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

          <div className="bg-white rounded-xl shadow-md p-6 min-h-[110px]">
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
            className="bg-white rounded-xl shadow-md p-6 min-h-[340px]"
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
            className="bg-white rounded-xl shadow-md p-6 min-h-[340px]"
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
          className="bg-white rounded-xl shadow-md p-6 min-h-[180px]"
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
                    key={`${exercise.exercise}-${index}-${exercise.muscle_group}`}
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
          <div className="bg-white rounded-xl shadow-md p-6 min-h-[180px]">
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
              {trainingGoals.filter(goal => goal.status !== 'Atteint').length === 0 && (
                <div className="text-gray-500 text-sm">
                  {trainingGoals.length === 0 
                    ? "Aucun objectif défini pour l'instant. Ajoute-en un pour te challenger !" 
                    : "Tous tes objectifs sont atteints ! 🎉 Félicitations, ajoute-en de nouveaux pour continuer à progresser."
                  }
                </div>
              )}
              {/* Afficher seulement les objectifs "En cours" sans doublons */}
              {trainingGoals
                .filter(goal => goal.status !== 'Atteint')
                .reduce((unique, goal) => {
                  // Créer une clé unique basée sur l'exercice + type + valeur
                  const goalExtended = goal as unknown as Record<string, unknown>;
                  const key = `${goal.exercise_id}-${goal.target_weight || 0}-${goal.target_reps || 0}-${goalExtended.target_duration || 0}-${goalExtended.target_distance || 0}`;
                  const existing = unique.find(g => {
                    const gExtended = g as unknown as Record<string, unknown>;
                    return `${g.exercise_id}-${g.target_weight || 0}-${g.target_reps || 0}-${gExtended.target_duration || 0}-${gExtended.target_distance || 0}` === key;
                  });
                  if (!existing) {
                    unique.push(goal);
                  }
                  return unique;
                }, [] as TrainingGoal[])
                .map((goal) => {
                // Détection dynamique du type d'objectif et des valeurs
                let target: number | null = null;
                let current: number | null = null;
                let unit = '';
                let extraKg: number | null = null;
                let extraDuration: number | null = null;
                // extraSpeed variable non utilisée supprimée
                if (goal.target_weight) {
                  target = goal.target_weight;
                  unit = 'kg';
                  const filtered = progressData.filter((p) => goal.exercises?.name && p.exercise === goal.exercises.name);
                  current = filtered.length > 0 ? filtered.reduce((max, p) => (max && p.weight > max.weight ? p : max), filtered[0]).weight : 0;
                } else if (goal.target_reps) {
                  target = goal.target_reps;
                  unit = 'reps';
                  const filtered = progressData.filter((p) => p.weight === 0 && goal.exercises?.name && p.exercise === goal.exercises.name);
                  current = filtered.length > 0 ? filtered.reduce((max, p) => (max && p.reps > max.reps ? p : max), filtered[0]).reps : 0;
                  if ((goal as unknown as Record<string, unknown>).extra_kg) extraKg = Number((goal as unknown as Record<string, unknown>).extra_kg);
                  if ((goal as unknown as Record<string, unknown>).extra_duration) extraDuration = Number((goal as unknown as Record<string, unknown>).extra_duration);
                } else if ((goal as unknown as Record<string, unknown>).target_duration) {
                  target = Number((goal as unknown as Record<string, unknown>).target_duration);
                  unit = 'min';
                  current = 0;
                } else if ((goal as unknown as Record<string, unknown>).target_distance) {
                  target = Number((goal as unknown as Record<string, unknown>).target_distance);
                  unit = 'km';
                  current = 0;
                } else if ((goal as unknown as Record<string, unknown>).target_speed) {
                  target = Number((goal as unknown as Record<string, unknown>).target_speed);
                  unit = 'km/h';
                  current = 0;
                } else if ((goal as unknown as Record<string, unknown>).target_calories) {
                  target = Number((goal as unknown as Record<string, unknown>).target_calories);
                  unit = 'kcal';
                  current = 0;
                }
                const percent = typeof target === 'number' && target ? Math.min((current! / target) * 100, 100) : 0;
                const bgClass = goal.status !== 'Atteint' ? 'bg-gray-100' : (unit === 'kg' ? 'bg-orange-50' : 'bg-green-50');
                const barClass = goal.status !== 'Atteint' ? 'bg-gray-300' : (unit === 'kg' ? 'bg-orange-500' : 'bg-green-500');
                const textClass = goal.status !== 'Atteint' ? 'text-gray-500' : (unit === 'kg' ? 'text-orange-600' : 'text-green-600');
                return (
                  <div key={goal.id} className={`p-4 rounded-lg ${bgClass}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${goal.status !== 'Atteint' ? 'text-gray-500' : 'text-gray-900'}`}>{goal.exercises?.name}<br /><span className="text-sm text-gray-600">{badgeDesc(goal)}</span></h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${textClass}`}>{current}/{target} {unit}{extraKg ? ` à ${extraKg} kg` : ''}{extraDuration ? ` en ${extraDuration} min` : ''}</span>
                        <button title="Éditer" onClick={() => handleEditGoal(goal)} className="ml-2 text-blue-500 hover:text-blue-700"><Pencil className="h-4 w-4" /></button>
                        <button title="Supprimer" onClick={() => handleDeleteGoal(goal)} className="ml-1 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className={`w-full rounded-full h-2 ${goal.status !== 'Atteint' ? 'bg-gray-200' : (unit === 'kg' ? 'bg-orange-200' : 'bg-green-200')}`}> 
                      <div className={`${barClass} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Badges à valider */}
          <div className="bg-white rounded-xl shadow-md p-6 min-h-[180px]">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Award className="h-6 w-6 text-yellow-500" />
              <span>Badges à valider</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Filtrer les badges liés aux objectifs "En cours" seulement */}
              {(() => {
                const filteredAchievements = achievements.filter(a => 
                  a.goal_id && 
                  trainingGoals.some(goal => goal.id === a.goal_id && goal.status !== 'Atteint')
                );
                return filteredAchievements;
              })().map(achievement => (
                <div key={achievement.id} className="text-center p-4 rounded-lg bg-gray-50 opacity-50">
                  <span className="h-8 w-8 mx-auto mb-2 flex items-center justify-center text-3xl grayscale">{achievement.icon}</span>
                  <h3 className="font-medium text-gray-500">{achievement.name}</h3>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </div>
              ))}
              {achievements.filter(a => 
                a.goal_id && 
                trainingGoals.some(goal => goal.id === a.goal_id && goal.status !== 'Atteint')
              ).length === 0 && (
                <div className="col-span-2 text-center text-gray-400 italic">Aucun badge à valider, lance-toi un nouveau défi !</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Modal ajout objectif */}
        {showGoalModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm modal-backdrop"
            style={{ backdropFilter: 'blur(8px)' }}
          >
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
              {dynamicGoalFields}
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

        {/* Modal de confirmation suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Trash2 className="h-6 w-6 text-red-500" /> Supprimer l&apos;objectif ?</h2>
              <p className="mb-6">Tu es sûr de vouloir supprimer cet objectif ? IronBuddy va pleurer un peu…</p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelDeleteGoal} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold">Annuler</button>
                <button onClick={confirmDeleteGoal} className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold">Supprimer</button>
              </div>
            </div>
          </div>
        )}

        {/* Animation/message de félicitations */}
        {showCongrats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(8px)' }}>
            <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center animate-avatar-pop" style={{ boxShadow: '0 0 32px 8px #a855f7, 0 0 0 #fff' }}>
              <span className="text-5xl mb-4">🏅</span>
              <h2 className="text-2xl font-bold text-orange-600 mb-2">Félicitations !</h2>
              <p className="text-lg text-gray-800">{congratsMsg}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 