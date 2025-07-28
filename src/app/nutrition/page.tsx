'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, ChefHat, Calendar, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import RecipeLibrary from '@/components/nutrition/RecipeLibrary'
import UnifiedMealModal from '@/components/nutrition/UnifiedMealModal'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface Meal {
  id: number
  food_name: string
  meal_type: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  date: string
}

export default function NutritionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [meals, setMeals] = useState<Meal[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [userId, setUserId] = useState<string | null>(null)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showRecipeLibrary, setShowRecipeLibrary] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<string>('')
  const [weeklyMeals, setWeeklyMeals] = useState<Meal[]>([])

  const supabase = createClient()

  // Charger les repas depuis la base de données
  const loadMeals = useCallback(async () => {
    if (!userId) return

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .order('time', { ascending: true })

      if (error) {
        console.error('Erreur lors du chargement des repas:', error)
        return
      }

      setMeals(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des repas:', error)
    }
  }, [userId, selectedDate, supabase])

  // Charger les repas de la semaine
  const loadWeeklyMeals = useCallback(async () => {
    if (!userId) return

    try {
      // Calculer le début et fin de la semaine
      const today = new Date()
      const monday = new Date(today)
      monday.setDate(today.getDate() - today.getDay() + 1)
      
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', monday.toISOString().split('T')[0])
        .lte('date', sunday.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) {
        console.error('Erreur lors du chargement des repas hebdomadaires:', error)
        return
      }

      setWeeklyMeals(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des repas hebdomadaires:', error)
    }
  }, [userId, supabase])

  // Ouvrir le modal unifié
  const openMealModal = (mealType: string) => {
    setSelectedMealType(mealType)
    setShowMealModal(true)
  }

  // Fermer le modal unifié
  const closeMealModal = () => {
    setShowMealModal(false)
    setSelectedMealType('')
  }

  // Ouvrir la bibliothèque de recettes
  const openRecipeLibrary = () => {
    setShowRecipeLibrary(true)
  }

  // Fermer la bibliothèque de recettes
  const closeRecipeLibrary = () => {
    setShowRecipeLibrary(false)
  }

  // Callback après ajout de repas
  const onMealAdded = () => {
    loadMeals()
    closeMealModal()
  }

  // Supprimer un repas
  const deleteMeal = async (mealId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) return

    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('id', mealId)

      if (error) {
        console.error('Erreur lors de la suppression:', error)
        return
      }

      loadMeals()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
      } else {
        setUserId(user.id)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Charger les repas quand userId ou selectedDate change
  useEffect(() => {
    if (userId) {
      loadMeals()
      loadWeeklyMeals()
    }
  }, [userId, selectedDate, loadMeals, loadWeeklyMeals])

  const mealTypes = [
    { name: 'Petit-déjeuner', color: '#FF6B6B', icon: '🌅' },
    { name: 'Déjeuner', color: '#4ECDC4', icon: '☀️' },
    { name: 'Dîner', color: '#45B7D1', icon: '🌙' },
    { name: 'Collation', color: '#96CEB4', icon: '🍎' },
    { name: 'Souper', color: '#FFD700', icon: '🍲' }
  ]

  // Calculer les totaux nutritionnels du jour
  const todayNutrition = meals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.calories,
      protein: total.protein + meal.protein,
      carbs: total.carbs + meal.carbs,
      fat: total.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // Objectifs nutritionnels
  const goals = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80
  }

  // Filtrer les repas du jour par type
  const todayMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date).toDateString()
    const selectedDateStr = selectedDate.toDateString()
    return mealDate === selectedDateStr
  })

  // Données pour le graphique en camembert (macronutriments)
  const macroData = useMemo(() => {
    const total = todayNutrition.protein + todayNutrition.carbs + todayNutrition.fat
    if (total === 0) return []
    
    return [
      { name: 'Protéines', value: todayNutrition.protein, color: '#3B82F6', percentage: Math.round((todayNutrition.protein / total) * 100) },
      { name: 'Glucides', value: todayNutrition.carbs, color: '#10B981', percentage: Math.round((todayNutrition.carbs / total) * 100) },
      { name: 'Lipides', value: todayNutrition.fat, color: '#F59E0B', percentage: Math.round((todayNutrition.fat / total) * 100) }
    ]
  }, [todayNutrition])

  // Données pour l'évolution hebdomadaire avec vraies données
  const weeklyData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    
    return days.map((day, index) => {
      const currentDate = new Date(monday)
      currentDate.setDate(monday.getDate() + index)
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Filtrer les repas pour cette date
      const dayMeals = weeklyMeals.filter(meal => meal.date === dateStr)
      
      // Calculer les totaux
      const dayNutrition = dayMeals.reduce(
        (total, meal) => ({
          calories: total.calories + meal.calories,
          protein: total.protein + meal.protein,
        }),
        { calories: 0, protein: 0 }
      )
      
      const isToday = dateStr === today.toISOString().split('T')[0]
      
      return {
        day,
        calories: Math.round(dayNutrition.calories),
        protein: Math.round(dayNutrition.protein),
        isToday,
        date: dateStr,
        mealsCount: dayMeals.length
      }
    })
  }, [weeklyMeals])

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
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div>
              <h1 className="text-3xl font-bold max-sm:text-2xl">Nutrition</h1>
              <p className="text-orange-100 max-sm:text-sm">Suis ton alimentation et tes objectifs</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={openRecipeLibrary}
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center space-x-2 max-sm:px-3 max-sm:py-2 max-sm:text-sm"
              >
                <ChefHat className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                <span>Mes recettes</span>
              </button>
              <button 
                onClick={() => openMealModal('Repas rapide')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2 max-sm:px-3 max-sm:py-2 max-sm:text-sm"
              >
                <Plus className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                <span>Ajouter un repas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Objectifs nutritionnels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Calories</h3>
                <p className="text-3xl font-bold text-orange-500">{Math.round(todayNutrition.calories)}</p>
                <p className="text-sm text-gray-600">/ {goals.calories} kcal</p>
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((todayNutrition.calories / goals.calories) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Protéines</h3>
                <p className="text-3xl font-bold text-blue-500">{Math.round(todayNutrition.protein * 10) / 10}</p>
                <p className="text-sm text-gray-600">/ {goals.protein}g</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💪</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((todayNutrition.protein / goals.protein) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Glucides</h3>
                <p className="text-3xl font-bold text-green-500">{Math.round(todayNutrition.carbs * 10) / 10}</p>
                <p className="text-sm text-gray-600">/ {goals.carbs}g</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍞</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((todayNutrition.carbs / goals.carbs) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Lipides</h3>
                <p className="text-3xl font-bold text-yellow-500">{Math.round(todayNutrition.fat * 10) / 10}</p>
                <p className="text-sm text-gray-600">/ {goals.fat}g</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🥑</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((todayNutrition.fat / goals.fat) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Graphiques nutritionnels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Répartition des macronutriments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des macronutriments</h3>
            {macroData.length > 0 ? (
              <div className="flex items-center justify-center">
                <div className="w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${Math.round(Number(value) * 10) / 10}g`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="ml-6 space-y-3">
                  {macroData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{Math.round(item.value * 10) / 10}g ({item.percentage}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune donnée à afficher</p>
                <p className="text-sm">Ajoutez des repas pour voir la répartition</p>
              </div>
            )}
          </motion.div>

          {/* Évolution hebdomadaire */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Évolution hebdomadaire</h3>
              <div className="text-sm text-gray-500">
                {weeklyData.reduce((total, day) => total + day.mealsCount, 0)} repas cette semaine
              </div>
            </div>
            
            {weeklyData.every(day => day.calories === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p className="font-medium">Aucune donnée cette semaine</p>
                <p className="text-sm mt-2">Commencez à enregistrer vos repas pour voir votre évolution nutritionnelle</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value, index) => {
                        const day = weeklyData[index]
                        return day?.isToday ? `${value} 📅` : value
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const day = props.payload
                        return [
                          name === 'Calories' ? `${value} kcal` : `${value}g`,
                          name,
                          day.isToday ? '(Aujourd\'hui)' : '',
                          `${day.mealsCount} repas`
                        ]
                      }}
                      labelFormatter={(label, payload) => {
                        const day = payload?.[0]?.payload
                        return `${label}${day?.isToday ? ' (Aujourd\'hui)' : ''}`
                      }}
                    />
                    <Legend />
                    <Bar dataKey="calories" fill="#F97316" name="Calories" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="protein" fill="#3B82F6" name="Protéines (g)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              💡 Ce graphique montre vos apports nutritionnels de la semaine. Les jours avec plus de repas indiquent une meilleure régularité.
            </div>
          </motion.div>
        </div>

        {/* Repas du jour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-900">Repas du jour</h2>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <Calendar className="h-4 w-4" />
                <span>Aujourd'hui</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{todayMeals.length} repas enregistrés</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {mealTypes.map(mealType => (
              <div key={mealType.name} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Header de la section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{mealType.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{mealType.name}</h3>
                        <p className="text-sm text-gray-600">
                          {todayMeals.filter(meal => meal.meal_type === mealType.name).length} repas • 
                          {Math.round(todayMeals.filter(meal => meal.meal_type === mealType.name).reduce((total, meal) => total + meal.calories, 0))} kcal
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => openMealModal(mealType.name)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>

                {/* Liste des repas */}
                <div className="p-4">
                  {todayMeals.filter(meal => meal.meal_type === mealType.name).length > 0 ? (
                    <div className="space-y-3">
                      {todayMeals.filter(meal => meal.meal_type === mealType.name).map((meal, index) => (
                        <div key={`${meal.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{meal.food_name}</div>
                            <div className="text-sm text-gray-600">{meal.time}</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-medium text-orange-600">{Math.round(meal.calories)} kcal</div>
                              <div className="text-xs text-gray-500">
                                P: {Math.round(meal.protein * 10) / 10}g • 
                                G: {Math.round(meal.carbs * 10) / 10}g • 
                                L: {Math.round(meal.fat * 10) / 10}g
                              </div>
                            </div>
                            <button
                              onClick={() => deleteMeal(meal.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Supprimer ce repas"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🍽️</div>
                      <p className="text-sm">Aucun repas pour {mealType.name.toLowerCase()}</p>
                      <p className="text-xs mt-1">Cliquez sur &quot;Ajouter&quot; pour commencer</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal Unifié pour l'ajout de repas */}
      {showMealModal && userId && (
        <UnifiedMealModal
          isOpen={showMealModal}
          onClose={closeMealModal}
          onMealAdded={onMealAdded}
          mealType={selectedMealType}
          selectedDate={selectedDate}
          userId={userId}
        />
      )}

      {/* Modal RecipeLibrary */}
      {showRecipeLibrary && userId && (
        <RecipeLibrary
          isOpen={showRecipeLibrary}
          onClose={closeRecipeLibrary}
          userId={userId}
        />
      )}
    </div>
  )
}