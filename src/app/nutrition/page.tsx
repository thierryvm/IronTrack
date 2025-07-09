'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Apple, 
  Target, 
  Flame, 
  Scale, 
  Clock,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { createClient } from '@/lib/supabase'
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

  // Ajout d'un état pour afficher les erreurs globales
  const [globalError, setGlobalError] = useState<string | null>(null);

  const supabase = createClient()

  const goals: NutritionGoals = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80
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
  const todayNutrition = getTotalNutrition(todayMeals)

  // Génère une clé unique pour forcer le re-render (hash simple)
  const todayMealsKey = todayMeals.map(m => `${m.id}-${m.calories}-${m.protein}-${m.carbs}-${m.fat}`).join('|')

  // Log pour debug : vérifier les repas du jour utilisés pour l'affichage
  console.log('todayMeals pour affichage:', todayMeals)
  console.log('todayNutrition pour PieChart:', todayNutrition)

  const weeklyData = [
    { day: 'Lun', calories: 2400, protein: 170, carbs: 230, fat: 75 },
    { day: 'Mar', calories: 2600, protein: 185, carbs: 250, fat: 85 },
    { day: 'Mer', calories: 2300, protein: 160, carbs: 220, fat: 70 },
    { day: 'Jeu', calories: 2500, protein: 180, carbs: 240, fat: 80 },
    { day: 'Ven', calories: 2700, protein: 190, carbs: 260, fat: 90 },
    { day: 'Sam', calories: 2800, protein: 195, carbs: 270, fat: 95 },
    { day: 'Dim', calories: 2200, protein: 155, carbs: 210, fat: 65 }
  ]

  // Ajout d'un repas dans Supabase
  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)
    setGlobalError(null);
    try {
      if (!userId) throw new Error('Utilisateur non connecté')
      if (!addForm.name || !addForm.type || !addForm.calories || !addForm.protein || !addForm.carbs || !addForm.fat || !addForm.time) {
        setAddError('Tous les champs sont obligatoires')
        setAddLoading(false)
        return
      }
      const dateString = selectedDate.toISOString().split('T')[0]
      const { error } = await supabase.from('nutrition_logs').insert({
        user_id: userId,
        date: dateString,
        meal_type: addForm.type,
        food_name: addForm.name,
        calories: Number(addForm.calories),
        protein: Number(addForm.protein),
        carbs: Number(addForm.carbs),
        fat: Number(addForm.fat),
        time: addForm.time,
      })
      if (error) throw error
      setShowAddModal(false)
      setAddForm({ name: '', type: 'Déjeuner', calories: '', protein: '', carbs: '', fat: '', time: '' })
      await loadMeals()
      console.log('Liste des repas après ajout:', meals);
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : String(err))
      setGlobalError('Erreur lors de l\'ajout du repas : ' + (err instanceof Error ? err.message : String(err)));
      alert('Erreur lors de l\'ajout du repas : ' + (err instanceof Error ? err.message : String(err)));
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
      console.log('Tentative suppression repas, id:', mealId);
      const { error, data } = await supabase.from('nutrition_logs').delete().eq('id', mealId)
      console.log('Résultat suppression Supabase:', { error, data, mealId })
      if (error) throw error
      await loadMeals()
      console.log('Liste des repas après suppression:', meals);
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
    setGlobalError(null);
    try {
      if (!userId || !editMeal) throw new Error('Utilisateur ou repas manquant')
      if (!editForm.name || !editForm.type || !editForm.calories || !editForm.protein || !editForm.carbs || !editForm.fat || !editForm.time) {
        setEditError('Tous les champs sont obligatoires')
        setEditLoading(false)
        return
      }
      const updatePayload = {
        meal_type: editForm.type,
        food_name: editForm.name,
        calories: Number(editForm.calories),
        protein: Number(editForm.protein),
        carbs: Number(editForm.carbs),
        fat: Number(editForm.fat),
        time: editForm.time,
      }
      const updateId = String(editMeal.id)
      console.log('Update Supabase:', { id: updateId, ...updatePayload })
      const { error } = await supabase.from('nutrition_logs').update(updatePayload).eq('id', updateId)
      if (error) throw error
      await loadMeals() // Recharge la liste avant de fermer le modal
      setEditMeal(null)
      console.log('Liste des repas après édition:', meals);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : String(err))
      setGlobalError('Erreur lors de la modification du repas : ' + (err instanceof Error ? err.message : String(err)));
      alert('Erreur lors de la modification du repas : ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setEditLoading(false)
    }
  }

  // Ajoute un log après chaque chargement de repas
  useEffect(() => {
    if (!loading) {
      console.log('Repas chargés:', meals)
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

        {/* Résumé nutritionnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Calories</p>
                <p className={`text-2xl font-bold ${getProgressColor(todayNutrition.calories, goals.calories)}`}>
                  {todayNutrition.calories}
                </p>
                <p className="text-sm text-gray-500">/ {goals.calories} kcal</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(todayNutrition.calories, goals.calories)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Protéines</p>
                <p className={`text-2xl font-bold ${getProgressColor(todayNutrition.protein, goals.protein)}`}>
                  {todayNutrition.protein}g
                </p>
                <p className="text-sm text-gray-500">/ {goals.protein}g</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(todayNutrition.protein, goals.protein)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Glucides</p>
                <p className={`text-2xl font-bold ${getProgressColor(todayNutrition.carbs, goals.carbs)}`}>
                  {todayNutrition.carbs}g
                </p>
                <p className="text-sm text-gray-500">/ {goals.carbs}g</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Apple className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(todayNutrition.carbs, goals.carbs)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Lipides</p>
                <p className={`text-2xl font-bold ${getProgressColor(todayNutrition.fat, goals.fat)}`}>
                  {todayNutrition.fat}g
                </p>
                <p className="text-sm text-gray-500">/ {goals.fat}g</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Scale className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(todayNutrition.fat, goals.fat)}%` }}
              ></div>
            </div>
          </div>
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
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key={todayMealsKey}>
                <Pie
                  data={[
                    { name: 'Protéines', value: todayNutrition.protein * 4, color: '#3B82F6' },
                    { name: 'Glucides', value: todayNutrition.carbs * 4, color: '#10B981' },
                    { name: 'Lipides', value: todayNutrition.fat * 9, color: '#F59E0B' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`}
                >
                  {[
                    { name: 'Protéines', value: todayNutrition.protein * 4, color: '#3B82F6' },
                    { name: 'Glucides', value: todayNutrition.carbs * 4, color: '#10B981' },
                    { name: 'Lipides', value: todayNutrition.fat * 9, color: '#F59E0B' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | string) => [`${value} kcal`, 'Calories']} />
              </PieChart>
            </ResponsiveContainer>
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

      {/* Modal d'ajout de repas */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter un repas</h3>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom du repas</label>
                <input type="text" className="mt-1 block w-full border rounded px-3 py-2" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select className="mt-1 block w-full border rounded px-3 py-2" value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
                  {mealTypes.map(mt => <option key={mt.name} value={mt.name}>{mt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calories</label>
                  <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={addForm.calories} onChange={e => setAddForm(f => ({ ...f, calories: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure</label>
                  <input type="time" className="mt-1 block w-full border rounded px-3 py-2" value={addForm.time} onChange={e => setAddForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Protéines (g)</label>
                  <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={addForm.protein} onChange={e => setAddForm(f => ({ ...f, protein: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Glucides (g)</label>
                  <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={addForm.carbs} onChange={e => setAddForm(f => ({ ...f, carbs: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lipides (g)</label>
                  <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={addForm.fat} onChange={e => setAddForm(f => ({ ...f, fat: e.target.value }))} />
                </div>
              </div>
              {addError && <div className="text-red-600 text-sm">{addError}</div>}
              <button type="submit" className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors" disabled={addLoading}>
                {addLoading ? 'Ajout en cours...' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowAddModal(false)} className="w-full mt-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de repas */}
      {editMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Modifier le repas</h3>
            <form onSubmit={handleEditMeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom du repas</label>
                <input type="text" className="mt-1 block w-full border rounded px-3 py-2" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select className="mt-1 block w-full border rounded px-3 py-2" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}>
                  {mealTypes.map(mt => <option key={mt.name} value={mt.name}>{mt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calories</label>
                  <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={editForm.calories} onChange={e => setEditForm(f => ({ ...f, calories: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure</label>
                  <input type="time" className="mt-1 block w-full border rounded px-3 py-2" value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Protéines (g)</label>
                  <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={editForm.protein} onChange={e => setEditForm(f => ({ ...f, protein: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Glucides (g)</label>
                  <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={editForm.carbs} onChange={e => setEditForm(f => ({ ...f, carbs: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lipides (g)</label>
                  <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={editForm.fat} onChange={e => setEditForm(f => ({ ...f, fat: e.target.value }))} />
                </div>
              </div>
              {editError && <div className="text-red-600 text-sm">{editError}</div>}
              <button type="submit" className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors" disabled={editLoading}>
                {editLoading ? 'Modification...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setEditMeal(null)} className="w-full mt-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 