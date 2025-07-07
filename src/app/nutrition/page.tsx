'use client'

import { useState, useEffect } from 'react'
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

interface Meal {
  id: number
  name: string
  type: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation'
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

const mealTypes = [
  { name: 'Petit-déjeuner', color: '#FF6B6B', icon: '🌅' },
  { name: 'Déjeuner', color: '#4ECDC4', icon: '☀️' },
  { name: 'Dîner', color: '#45B7D1', icon: '🌙' },
  { name: 'Collation', color: '#96CEB4', icon: '🍎' }
]

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const goals: NutritionGoals = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80
  }

  useEffect(() => {
    loadMeals()
  }, [selectedDate])

  const loadMeals = async () => {
    try {
      // Simuler des données pour le moment
      const mockMeals: Meal[] = [
        {
          id: 1,
          name: 'Omelette protéinée',
          type: 'Petit-déjeuner',
          calories: 350,
          protein: 25,
          carbs: 8,
          fat: 22,
          time: '08:00',
          date: '2024-01-15'
        },
        {
          id: 2,
          name: 'Poulet riz brocoli',
          type: 'Déjeuner',
          calories: 650,
          protein: 45,
          carbs: 60,
          fat: 20,
          time: '12:30',
          date: '2024-01-15'
        },
        {
          id: 3,
          name: 'Shake protéiné',
          type: 'Collation',
          calories: 200,
          protein: 30,
          carbs: 15,
          fat: 5,
          time: '16:00',
          date: '2024-01-15'
        },
        {
          id: 4,
          name: 'Saumon quinoa',
          type: 'Dîner',
          calories: 550,
          protein: 35,
          carbs: 45,
          fat: 25,
          time: '19:30',
          date: '2024-01-15'
        }
      ]

      setMeals(mockMeals)
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des repas:', error)
      setLoading(false)
    }
  }

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

  const weeklyData = [
    { day: 'Lun', calories: 2400, protein: 170, carbs: 230, fat: 75 },
    { day: 'Mar', calories: 2600, protein: 185, carbs: 250, fat: 85 },
    { day: 'Mer', calories: 2300, protein: 160, carbs: 220, fat: 70 },
    { day: 'Jeu', calories: 2500, protein: 180, carbs: 240, fat: 80 },
    { day: 'Ven', calories: 2700, protein: 190, carbs: 260, fat: 90 },
    { day: 'Sam', calories: 2800, protein: 195, carbs: 270, fat: 95 },
    { day: 'Dim', calories: 2200, protein: 155, carbs: 210, fat: 65 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Nutrition</h1>
              <p className="text-orange-100">Suis ton alimentation et tes objectifs</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter un repas</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sélecteur de date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{formatDate(selectedDate)}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hier
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Répartition des macronutriments</h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
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
                              <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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
            <p className="text-green-100 mb-4">
              Pour optimiser ta prise de masse musculaire, assure-toi de consommer suffisamment de protéines 
              (1.6-2.2g par kg de poids corporel) et de bien répartir tes repas sur la journée.
            </p>
            <div className="flex items-center justify-center space-x-4">
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

      {/* Modal d'ajout de repas (à implémenter) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter un repas</h3>
            <p className="text-gray-600 mb-4">Fonctionnalité à venir...</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 