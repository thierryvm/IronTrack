'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Apple, 
  Target, 
  Flame, 
  Scale, 
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  X as LucideX,
  AlertTriangle,
  Utensils
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
// Importer les conseils de la mascotte
import { advices as mascotAdvices } from '../../components/ui/Mascot';

interface Meal {
  id: number
  name: string
  type: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Souper' | 'Collation'
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  date: string
}

interface NutritionGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface NutritionLogRow {
  id: number;
  food_name: string;
  meal_type: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Souper' | 'Collation';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  date: string;
}

const mealTypes = [
  { name: 'Petit-déjeuner', color: '#FF6B6B', icon: '🌅' },
  { name: 'Déjeuner', color: '#4ECDC4', icon: '☀️' },
  { name: 'Dîner', color: '#45B7D1', icon: '🌙' },
  { name: 'Collation', color: '#96CEB4', icon: '🍎' },
  { name: 'Souper', color: '#FFD700', icon: '🍲' }
]

export default function NutritionPage() {
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
      }
    };
    checkAuth();
  }, [router]);

  const [meals, setMeals] = useState<Meal[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // État pour le formulaire d'ajout de repas
  const [addForm, setAddForm] = useState({
    name: '',
    type: 'Déjeuner',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    time: '',
  })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // État pour l'édition de repas
  const [editMeal, setEditMeal] = useState<Meal | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'Déjeuner',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    time: '',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})

  // Ajout d'un état pour afficher les erreurs globales
  const [globalError, setGlobalError] = useState<string | null>(null);

  const supabase = createClient()

  const goals: NutritionGoals = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80
  }

  // Fonctions de validation et sanitisation
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>"'&]/g, '')
  }

  const validateNumericInput = (value: string, fieldName: string, min = 0, max = 10000): string | null => {
    if (!value || value.trim() === '') {
      return `${fieldName} est requis`
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      return `${fieldName} doit être un nombre valide`
    }
    if (num < min) {
      return `${fieldName} doit être supérieur ou égal à ${min}`
    }
    if (num > max) {
      return `${fieldName} ne peut pas dépasser ${max}`
    }
    return null
  }

  const validateForm = (form: typeof addForm): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    // Validation du nom
    const sanitizedName = sanitizeInput(form.name)
    if (!sanitizedName || sanitizedName.length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    if (sanitizedName.length > 100) {
      errors.name = 'Le nom ne peut pas dépasser 100 caractères'
    }
    
    // Validation des valeurs numériques
    const caloriesError = validateNumericInput(form.calories, 'Calories', 1, 5000)
    if (caloriesError) errors.calories = caloriesError
    
    const proteinError = validateNumericInput(form.protein, 'Protéines', 0, 500)
    if (proteinError) errors.protein = proteinError
    
    const carbsError = validateNumericInput(form.carbs, 'Glucides', 0, 1000)
    if (carbsError) errors.carbs = carbsError
    
    const fatError = validateNumericInput(form.fat, 'Lipides', 0, 500)
    if (fatError) errors.fat = fatError
    
    // Validation de l'heure
    if (!form.time || !/^\d{2}:\d{2}$/.test(form.time)) {
      errors.time = 'L\'heure doit être au format HH:MM'
    }
    
    return errors
  }

  const handleNumericInput = (value: string, setter: (value: string) => void) => {
    // Permet seulement les nombres et point décimal
    const sanitized = value.replace(/[^0-9.]/g, '')
    // Empêche plusieurs points décimaux
    const parts = sanitized.split('.')
    const result = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitized
    setter(result)
  }

  useEffect(() => {
    // Récupère l'utilisateur connecté au premier rendu
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    fetchUser()
  }, [supabase])

  const loadMeals = useCallback(async () => {
    setLoading(true)
    try {
      if (!userId) return
      const dateString = selectedDate.toISOString().split('T')[0]
      const { data } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateString)
        .order('time', { ascending: true })
      // Mapping des champs DB -> Meal
      const mappedMeals: Meal[] = (data || []).map((row: NutritionLogRow) => ({
        id: row.id,
        name: row.food_name,
        type: row.meal_type,
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fat: row.fat,
        time: row.time,
        date: row.date
      }))
      setMeals(mappedMeals)
    } catch (error) {
      console.error('Erreur lors du chargement des repas:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, selectedDate, supabase])

  useEffect(() => {
    if (userId) {
      loadMeals()
    }
  }, [selectedDate, userId, loadMeals])

  const getMealsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return meals.filter(meal => meal.date === dateString)
  }

  const getTotalNutrition = (meals: Meal[]) => {
    return meals.reduce((total, meal) => ({
      calories: total.calories + meal.calories,
      protein: total.protein + meal.protein,
      carbs: total.carbs + meal.carbs,
      fat: total.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100
    if (percentage >= 90 && percentage <= 110) return 'text-green-600'
    if (percentage > 110) return 'text-red-600'
    return 'text-orange-600'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const todayMeals = getMealsForDate(selectedDate)
  const todayNutrition = useMemo(() => getTotalNutrition(todayMeals), [todayMeals])

  // Génère une clé unique pour forcer le re-render (hash simple)
  const todayMealsKey = todayMeals.map(m => `${m.id}-${m.calories}-${m.protein}-${m.carbs}-${m.fat}`).join('|')

  // Log pour debug : vérifier les repas du jour utilisés pour l'affichage

  // Données hebdomadaires réelles
  const [weeklyData, setWeeklyData] = useState<Array<{day: string, calories: number, protein: number, carbs: number, fat: number}>>([])

  // Charger les données hebdomadaires réelles
  const loadWeeklyData = useCallback(async () => {
    if (!userId) return
    
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Lundi
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day.toISOString().split('T')[0])
    }
    
    try {
      const { data } = await supabase
        .from('nutrition_logs')
        .select('date, calories, protein, carbs, fat')
        .eq('user_id', userId)
        .in('date', weekDays)
      
      const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      const weeklyStats = weekDays.map((date, index) => {
        const dayMeals = data?.filter(meal => meal.date === date) || []
        const dayTotal = dayMeals.reduce(
          (total, meal) => ({
            calories: total.calories + (meal.calories || 0),
            protein: total.protein + (meal.protein || 0),
            carbs: total.carbs + (meal.carbs || 0),
            fat: total.fat + (meal.fat || 0)
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )
        
        return {
          day: dayNames[index],
          ...dayTotal
        }
      })
      
      setWeeklyData(weeklyStats)
    } catch (error) {
      console.error('Erreur lors du chargement des données hebdomadaires:', error)
      // Fallback vers des données par défaut
      setWeeklyData([
        { day: 'Lun', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Mar', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Mer', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Jeu', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Ven', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Sam', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Dim', calories: 0, protein: 0, carbs: 0, fat: 0 }
      ])
    }
  }, [userId, supabase])

  useEffect(() => {
    if (userId) {
      loadWeeklyData()
    }
  }, [userId, loadWeeklyData])

  // Ajout d'un repas dans Supabase
  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)
    setGlobalError(null)
    setFormErrors({})
    
    try {
      if (!userId) throw new Error('Utilisateur non connecté')
      
      // Validation du formulaire
      const errors = validateForm(addForm)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        setAddLoading(false)
        return
      }
      
      const sanitizedName = sanitizeInput(addForm.name)
      const dateString = selectedDate.toISOString().split('T')[0]
      
      const { error } = await supabase.from('nutrition_logs').insert({
        user_id: userId,
        date: dateString,
        meal_type: addForm.type,
        food_name: sanitizedName,
        calories: parseFloat(addForm.calories),
        protein: parseFloat(addForm.protein),
        carbs: parseFloat(addForm.carbs),
        fat: parseFloat(addForm.fat),
        time: addForm.time,
      })
      
      if (error) throw error
      
      setShowAddModal(false)
      setAddForm({ name: '', type: 'Déjeuner', calories: '', protein: '', carbs: '', fat: '', time: '' })
      setFormErrors({})
      await loadMeals()
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : String(err))
      setGlobalError('Erreur lors de l\'ajout du repas : ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setAddLoading(false)
    }
  }

  // Suppression d'un repas
  const handleDeleteMeal = async (id: number | string) => {
    setGlobalError(null);
    if (!userId) return
    if (!window.confirm('Supprimer ce repas ?')) return
    try {
      // On force l'ID en string pour éviter les soucis de typage
      const mealId = String(id)
      const { error } = await supabase.from('nutrition_logs').delete().eq('id', mealId)
      if (error) throw error
      await loadMeals()
    } catch (error) {
      setGlobalError('Erreur lors de la suppression du repas : ' + (error instanceof Error ? error.message : String(error)));
      alert('Erreur lors de la suppression du repas : ' + (error instanceof Error ? error.message : String(error)));
      if (error instanceof Error) {
        alert('Erreur lors de la suppression du repas : ' + error.message)
      } else {
        alert('Erreur lors de la suppression du repas (type inconnu)')
      }
      console.error('Erreur Supabase:', error)
    }
  }

  // Ouvre le modal d'édition avec les valeurs du repas
  const openEditModal = (meal: Meal) => {
    setEditMeal(meal)
    setEditForm({
      name: meal.name,
      type: meal.type,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      time: meal.time,
    })
  }

  // Met à jour le repas dans Supabase
  const handleEditMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError(null)
    setGlobalError(null)
    setEditFormErrors({})
    
    try {
      if (!userId || !editMeal) throw new Error('Utilisateur ou repas manquant')
      
      // Validation du formulaire
      const errors = validateForm(editForm)
      if (Object.keys(errors).length > 0) {
        setEditFormErrors(errors)
        setEditLoading(false)
        return
      }
      
      const sanitizedName = sanitizeInput(editForm.name)
      const updatePayload = {
        meal_type: editForm.type,
        food_name: sanitizedName,
        calories: parseFloat(editForm.calories),
        protein: parseFloat(editForm.protein),
        carbs: parseFloat(editForm.carbs),
        fat: parseFloat(editForm.fat),
        time: editForm.time,
      }
      
      const updateId = String(editMeal.id)
      const { error } = await supabase.from('nutrition_logs').update(updatePayload).eq('id', updateId)
      if (error) throw error
      
      await loadMeals()
      setEditMeal(null)
      setEditFormErrors({})
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : String(err))
      setGlobalError('Erreur lors de la modification du repas : ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setEditLoading(false)
    }
  }

  // Ajoute un log après chaque chargement de repas
  useEffect(() => {
    if (!loading) {
    }
  }, [meals, loading])

  // Conseil du jour dynamique
  const [adviceIndex, setAdviceIndex] = useState(() => Math.floor(Math.random() * mascotAdvices.length));
  const [adviceAnim, setAdviceAnim] = useState(false);
  const handleNewAdvice = () => {
    setAdviceAnim(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * mascotAdvices.length);
      } while (newIndex === adviceIndex && mascotAdvices.length > 1);
      setAdviceIndex(newIndex);
      setAdviceAnim(false);
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la nutrition...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message d'incitation si le suivi est désactivé */}
      {/* Objectifs, barres et rappels affichés seulement si activé */}
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div>
              <h1 className="text-3xl font-bold max-sm:text-2xl">Nutrition</h1>
              <p className="text-orange-100 max-sm:text-sm">Suis ton alimentation et tes objectifs</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2 max-sm:w-full max-sm:justify-center max-sm:px-3 max-sm:py-2 max-sm:text-sm"
            >
              <Plus className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
              <span>Ajouter un repas</span>
            </button>
          </div>
        </div>
      </div>

      {globalError && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center font-semibold">
          {globalError}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 max-sm:py-3">
        {/* Sélecteur de date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 max-sm:p-3 max-sm:mb-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-900">{formatDate(selectedDate)}</h2>
            <div className="flex space-x-2 max-sm:space-x-1 max-sm:mt-2">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors max-sm:px-2 max-sm:py-1 max-sm:text-xs"
              >
                Hier
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors max-sm:px-2 max-sm:py-1 max-sm:text-xs"
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors max-sm:px-2 max-sm:py-1 max-sm:text-xs"
              >
                Demain
              </button>
            </div>
          </div>
        </motion.div>

        {/* Résumé nutritionnel moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {[
            { 
              name: 'Calories', 
              value: todayNutrition.calories, 
              goal: goals.calories, 
              unit: '', 
              suffix: 'kcal',
              icon: Flame, 
              color: 'orange',
              bgColor: 'bg-orange-500',
              lightColor: 'bg-orange-100',
              textColor: 'text-orange-500'
            },
            { 
              name: 'Protéines', 
              value: todayNutrition.protein, 
              goal: goals.protein, 
              unit: 'g', 
              suffix: 'g',
              icon: Target, 
              color: 'blue',
              bgColor: 'bg-blue-500',
              lightColor: 'bg-blue-100',
              textColor: 'text-blue-500'
            },
            { 
              name: 'Glucides', 
              value: todayNutrition.carbs, 
              goal: goals.carbs, 
              unit: 'g', 
              suffix: 'g',
              icon: Apple, 
              color: 'green',
              bgColor: 'bg-green-500',
              lightColor: 'bg-green-100',
              textColor: 'text-green-500'
            },
            { 
              name: 'Lipides', 
              value: todayNutrition.fat, 
              goal: goals.fat, 
              unit: 'g', 
              suffix: 'g',
              icon: Scale, 
              color: 'yellow',
              bgColor: 'bg-yellow-500',
              lightColor: 'bg-yellow-100',
              textColor: 'text-yellow-500'
            }
          ].map((macro) => {
            const Icon = macro.icon
            const percentage = getProgressPercentage(macro.value, macro.goal)
            const isOverGoal = macro.value > macro.goal
            
            return (
              <motion.div
                key={macro.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{macro.name}</p>
                    <div className="flex items-baseline space-x-1">
                      <span className={`text-2xl sm:text-3xl font-bold ${getProgressColor(macro.value, macro.goal)}`}>
                        {macro.value}
                      </span>
                      {macro.name === 'Calories' && (
                        <Icon className="h-5 w-5 text-orange-500 mb-1" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">/ {macro.goal} {macro.suffix}</p>
                  </div>
                  {macro.name !== 'Calories' && (
                    <div className={`p-2 sm:p-3 ${macro.lightColor} rounded-full flex-shrink-0`}>
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${macro.textColor}`} />
                    </div>
                  )}
                </div>
                
                {/* Barre de progression améliorée */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`${macro.bgColor} h-2.5 rounded-full transition-all duration-700 ease-out ${isOverGoal ? 'animate-pulse' : ''}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-gray-600">
                      {percentage.toFixed(0)}%
                    </span>
                    {isOverGoal && (
                      <span className="text-xs font-medium text-red-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Dépassé
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Répartition des macronutriments */}
          <motion.div
            key={todayMealsKey + '-pie'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Répartition des macronutriments</h2>
            
            {/* Statistiques macros style moderne */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { name: 'Protéines', value: todayNutrition.protein, unit: 'g', calories: todayNutrition.protein * 4, color: 'blue', goal: goals.protein },
                { name: 'Glucides', value: todayNutrition.carbs, unit: 'g', calories: todayNutrition.carbs * 4, color: 'green', goal: goals.carbs },
                { name: 'Lipides', value: todayNutrition.fat, unit: 'g', calories: todayNutrition.fat * 9, color: 'yellow', goal: goals.fat }
              ].map((macro) => {
                const percentage = todayNutrition.calories > 0 ? (macro.calories / todayNutrition.calories * 100) : 0
                const goalPercentage = macro.value > 0 ? (macro.value / macro.goal * 100) : 0
                
                const bgColorMap = {
                  blue: 'bg-blue-100',
                  green: 'bg-green-100', 
                  yellow: 'bg-yellow-100'
                }
                const textColorMap = {
                  blue: 'text-blue-600',
                  green: 'text-green-600',
                  yellow: 'text-yellow-600'
                }
                const progressColorMap = {
                  blue: 'bg-blue-500',
                  green: 'bg-green-500',
                  yellow: 'bg-yellow-500'
                }
                
                return (
                  <div key={macro.name} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${bgColorMap[macro.color as keyof typeof bgColorMap]}`}>
                      <span className={`${textColorMap[macro.color as keyof typeof textColorMap]} font-bold text-sm`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{macro.name}</p>
                    <p className="text-xs text-gray-600">
                      {macro.value}{macro.unit} / {macro.goal}{macro.unit}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`${progressColorMap[macro.color as keyof typeof progressColorMap]} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(goalPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Graphique en secteurs amélioré */}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart key={todayMealsKey}>
                <Pie
                  data={[
                    { name: 'Protéines', value: todayNutrition.protein * 4, color: '#3B82F6', grams: todayNutrition.protein },
                    { name: 'Glucides', value: todayNutrition.carbs * 4, color: '#10B981', grams: todayNutrition.carbs },
                    { name: 'Lipides', value: todayNutrition.fat * 9, color: '#F59E0B', grams: todayNutrition.fat }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent, grams }) => {
                    const percentage = percent !== undefined ? (percent * 100).toFixed(0) : '0'
                    return `${name}\n${percentage}% (${grams}g)`
                  }}
                  labelLine={false}
                >
                  {[
                    { name: 'Protéines', value: todayNutrition.protein * 4, color: '#3B82F6' },
                    { name: 'Glucides', value: todayNutrition.carbs * 4, color: '#10B981' },
                    { name: 'Lipides', value: todayNutrition.fat * 9, color: '#F59E0B' }
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number | string, name: string) => [
                    `${value} kcal`, 
                    name
                  ]} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            {todayNutrition.calories === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Utensils className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">Aucune donnée nutritionnelle</p>
                <p className="text-sm">Ajoutez des repas pour voir la répartition</p>
              </div>
            )}
          </motion.div>

          {/* Évolution hebdomadaire */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Évolution hebdomadaire</h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value: number | string) => [`${value} kcal`, 'Calories']} />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Liste des repas */}
        <motion.div
          key={todayMealsKey + '-cards'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Repas du jour</h2>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">
                {todayMeals.length} repas enregistrés
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {mealTypes.map(mealType => {
              const typeMeals = todayMeals.filter(meal => meal.type === mealType.name)
              return (
                <div key={mealType.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{mealType.icon}</span>
                    <h3 className="font-semibold text-gray-900">{mealType.name}</h3>
                    <div className="flex-1"></div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {typeMeals.length > 0 ? (
                    <div className="space-y-3">
                      {typeMeals.map(meal => (
                        <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <h4 className="font-medium text-gray-900">{meal.name}</h4>
                              <p className="text-sm text-gray-600">{meal.time}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{meal.calories} kcal</p>
                              <p className="text-xs text-gray-500">
                                P: {meal.protein}g | G: {meal.carbs}g | L: {meal.fat}g
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => openEditModal(meal)}>
                                <Edit className="h-4 w-4" />
                              </button>
                              <button type="button" className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" onClick={() => handleDeleteMeal(meal.id)}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Apple className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Aucun repas enregistré</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Conseils nutritionnels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Conseil du jour</h2>
            <motion.p
              key={adviceIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: adviceAnim ? 0 : 1, y: adviceAnim ? 10 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-green-100 mb-4 min-h-[48px] flex items-center justify-center"
            >
              <span className="mr-2">💡</span>{mascotAdvices[adviceIndex]}
            </motion.p>
            <button
              onClick={handleNewAdvice}
              className="inline-flex items-center px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold text-sm transition-colors"
              title="Nouveau conseil"
            >
              <span role="img" aria-label="refresh" className="mr-1">🔄</span>Nouveau conseil
            </button>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{getProgressPercentage(todayNutrition.protein, goals.protein).toFixed(0)}%</p>
                <p className="text-sm text-green-100">Objectif protéines</p>
              </div>
              <div className="w-32 bg-green-600 rounded-full h-2">
                <div 
                  className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(todayNutrition.protein, goals.protein)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal d'ajout de repas moderne */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            onClick={() => setShowAddModal(false)}
          >
            {/* Overlay avec effet de flou */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.75), rgba(20,20,30,0.6))',
                backdropFilter: 'blur(15px) brightness(0.7)',
                WebkitBackdropFilter: 'blur(15px) brightness(0.7)'
              }}
            />
            
            {/* Container centré pour la modal */}
            <div className="relative flex items-center justify-center min-h-full p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Ajouter un repas</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <LucideX className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <form onSubmit={handleAddMeal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du repas *</label>
                    <input 
                      type="text" 
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={addForm.name} 
                      onChange={e => {
                        setAddForm(f => ({ ...f, name: e.target.value }))
                        if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }))
                      }}
                      placeholder="Ex: Salade de poulet"
                      maxLength={100}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de repas</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                      value={addForm.type} 
                      onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
                    >
                      {mealTypes.map(mt => <option key={mt.name} value={mt.name}>{mt.icon} {mt.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calories *</label>
                      <input 
                        type="text" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          formErrors.calories ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={addForm.calories} 
                        onChange={e => {
                          handleNumericInput(e.target.value, (value) => setAddForm(f => ({ ...f, calories: value })))
                          if (formErrors.calories) setFormErrors(prev => ({ ...prev, calories: '' }))
                        }}
                        placeholder="Ex: 350"
                      />
                      {formErrors.calories && <p className="text-red-500 text-xs mt-1">{formErrors.calories}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
                      <input 
                        type="time" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          formErrors.time ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={addForm.time} 
                        onChange={e => {
                          setAddForm(f => ({ ...f, time: e.target.value }))
                          if (formErrors.time) setFormErrors(prev => ({ ...prev, time: '' }))
                        }}
                      />
                      {formErrors.time && <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g) *</label>
                      <input 
                        type="text" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          formErrors.protein ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={addForm.protein} 
                        onChange={e => {
                          handleNumericInput(e.target.value, (value) => setAddForm(f => ({ ...f, protein: value })))
                          if (formErrors.protein) setFormErrors(prev => ({ ...prev, protein: '' }))
                        }}
                        placeholder="25"
                      />
                      {formErrors.protein && <p className="text-red-500 text-xs mt-1">{formErrors.protein}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g) *</label>
                      <input 
                        type="text" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          formErrors.carbs ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={addForm.carbs} 
                        onChange={e => {
                          handleNumericInput(e.target.value, (value) => setAddForm(f => ({ ...f, carbs: value })))
                          if (formErrors.carbs) setFormErrors(prev => ({ ...prev, carbs: '' }))
                        }}
                        placeholder="15"
                      />
                      {formErrors.carbs && <p className="text-red-500 text-xs mt-1">{formErrors.carbs}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g) *</label>
                      <input 
                        type="text" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          formErrors.fat ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={addForm.fat} 
                        onChange={e => {
                          handleNumericInput(e.target.value, (value) => setAddForm(f => ({ ...f, fat: value })))
                          if (formErrors.fat) setFormErrors(prev => ({ ...prev, fat: '' }))
                        }}
                        placeholder="12"
                      />
                      {formErrors.fat && <p className="text-red-500 text-xs mt-1">{formErrors.fat}</p>}
                    </div>
                  </div>
                  
                  {addError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-red-700 text-sm">{addError}</span>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-2">
                    <button 
                      type="submit" 
                      className="flex-1 bg-orange-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50" 
                      disabled={addLoading}
                    >
                      {addLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Ajout...
                        </span>
                      ) : (
                        'Ajouter le repas'
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowAddModal(false)
                        setFormErrors({})
                        setAddError(null)
                      }} 
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'édition de repas moderne */}
      <AnimatePresence>
        {editMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            onClick={() => setEditMeal(null)}
          >
            {/* Overlay avec effet de flou */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.75), rgba(20,20,30,0.6))',
                backdropFilter: 'blur(15px) brightness(0.7)',
                WebkitBackdropFilter: 'blur(15px) brightness(0.7)'
              }}
            />
            
            {/* Container centré pour la modal */}
            <div className="relative flex items-center justify-center min-h-full p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Modifier le repas</h3>
                  <button
                    onClick={() => setEditMeal(null)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <LucideX className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <form onSubmit={handleEditMeal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du repas *</label>
                    <input 
                      type="text" 
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        editFormErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={editForm.name} 
                      onChange={e => {
                        setEditForm(f => ({ ...f, name: e.target.value }))
                        if (editFormErrors.name) setEditFormErrors(prev => ({ ...prev, name: '' }))
                      }}
                      placeholder="Ex: Salade de poulet"
                      maxLength={100}
                    />
                    {editFormErrors.name && <p className="text-red-500 text-xs mt-1">{editFormErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de repas</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                      value={editForm.type} 
                      onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                    >
                      {mealTypes.map(mt => <option key={mt.name} value={mt.name}>{mt.icon} {mt.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calories *</label>
                      <input 
                        type="text" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          editFormErrors.calories ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.calories} 
                        onChange={e => {
                          handleNumericInput(e.target.value, (value) => setEditForm(f => ({ ...f, calories: value })))
                          if (editFormErrors.calories) setEditFormErrors(prev => ({ ...prev, calories: '' }))
                        }}
                        placeholder="Ex: 350"
                      />
                      {editFormErrors.calories && <p className="text-red-500 text-xs mt-1">{editFormErrors.calories}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
                      <input 
                        type="time" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          editFormErrors.time ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.time} 
                        onChange={e => {
                          setEditForm(f => ({ ...f, time: e.target.value }))
                          if (editFormErrors.time) setEditFormErrors(prev => ({ ...prev, time: '' }))
                        }}
                      />
                      {editFormErrors.time && <p className="text-red-500 text-xs mt-1">{editFormErrors.time}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g) *</label>
                      <input 
                        type="text" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          editFormErrors.protein ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.protein} 
                        onChange={e => {
                          handleNumericInput(e.target.value, (value) => setEditForm(f => ({ ...f, protein: value })))
                          if (editFormErrors.protein) setEditFormErrors(prev => ({ ...prev, protein: '' }))
                        }}
                        placeholder="25"
                      />
                      {editFormErrors.protein && <p className="text-red-500 text-xs mt-1">{editFormErrors.protein}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g) *</label>
                      <input 
                        type="text" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          editFormErrors.carbs ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.carbs} 
                        onChange={e => {
                          handleNumericInput(e.target.value, (value) => setEditForm(f => ({ ...f, carbs: value })))
                          if (editFormErrors.carbs) setEditFormErrors(prev => ({ ...prev, carbs: '' }))
                        }}
                        placeholder="15"
                      />
                      {editFormErrors.carbs && <p className="text-red-500 text-xs mt-1">{editFormErrors.carbs}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g) *</label>
                      <input 
                        type="text" 
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          editFormErrors.fat ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.fat} 
                        onChange={e => {
                          handleNumericInput(e.target.value, (value) => setEditForm(f => ({ ...f, fat: value })))
                          if (editFormErrors.fat) setEditFormErrors(prev => ({ ...prev, fat: '' }))
                        }}
                        placeholder="12"
                      />
                      {editFormErrors.fat && <p className="text-red-500 text-xs mt-1">{editFormErrors.fat}</p>}
                    </div>
                  </div>
                  
                  {editError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-red-700 text-sm">{editError}</span>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-2">
                    <button 
                      type="submit" 
                      className="flex-1 bg-orange-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50" 
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Modification...
                        </span>
                      ) : (
                        'Enregistrer les modifications'
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditMeal(null)
                        setEditFormErrors({})
                        setEditError(null)
                      }} 
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 