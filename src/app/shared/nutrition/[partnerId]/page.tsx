'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Calendar, TrendingUp, Users, Info, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

interface NutritionLog {
  id: string
  date: string
  meal_type: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  created_at: string
}

interface DailyStats {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  meals: NutritionLog[]
}

interface PartnerProfile {
  id: string
  pseudo: string | null
  full_name: string | null
  avatar_url: string | null
}

interface SharedNutritionData {
  partner: PartnerProfile
  nutritionLogs: NutritionLog[]
  dailyStats: DailyStats[]
  dateRange: string
}

export default function SharedNutritionPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const partnerId = params.partnerId as string

  const [nutritionData, setNutritionData] = useState<SharedNutritionData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Générer les 7 derniers jours pour le sélecteur de date
  const generateDateOptions = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const loadSharedNutrition = useCallback(async (date?: string) => {
    if (!isAuthenticated || !user) return

    try {
      setError(null)

      const url = new URL('/api/nutrition/shared', window.location.origin)
      url.searchParams.set('partnerId', partnerId)
      if (date) {
        url.searchParams.set('date', date)
      }

      const response = await fetch(url.toString())
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du chargement')
      }

      setNutritionData(result.data)
    } catch (err) {
      console.error('Erreur chargement nutrition partagée:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
    }
  }, [isAuthenticated, user, partnerId])

  useEffect(() => {
    if (isAuthenticated && user && partnerId) {
      loadSharedNutrition()
    }
  }, [isAuthenticated, user, partnerId, loadSharedNutrition])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    loadSharedNutrition(date)
  }

  const getMealTypeIcon = (mealType: string) => {
    const icons: Record<string, string> = {
      'Petit-déjeuner': '🌅',
      'Déjeuner': '☀️',
      'Dîner': '🌆',
      'Souper': '🌙',
      'Collation': '🍎'
    }
    return icons[mealType] || '🍽️'
  }

  const getMealTypeColor = (mealType: string) => {
    const colors: Record<string, string> = {
      'Petit-déjeuner': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Déjeuner': 'bg-orange-100 text-orange-800 border-orange-200',
      'Dîner': 'bg-blue-100 text-blue-800 border-blue-200',
      'Souper': 'bg-purple-100 text-purple-800 border-purple-200',
      'Collation': 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[mealType] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatMacroPercentage = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  }

  const getPartnerDisplayName = (partner: PartnerProfile) => {
    return partner.pseudo || partner.full_name || 'Partenaire'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 rounded-full p-2">
                <Info className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Erreur d&apos;accès</h3>
                <p className="text-red-700">{error}</p>
                <div className="mt-4 space-y-2 text-sm text-red-600">
                  <p>Vérifiez que :</p>
                  <ul className="ml-4 space-y-1">
                    <li>• Vous êtes partenaires acceptés</li>
                    <li>• Le partage nutrition est activé</li>
                    <li>• Vous avez les bonnes permissions</li>
                  </ul>
                </div>
                <button
                  onClick={() => router.push('/training-partners')}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Gérer mes partenaires
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!nutritionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const selectedDayStats = selectedDate 
    ? nutritionData.dailyStats.find(day => day.date === selectedDate)
    : nutritionData.dailyStats[0]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-3">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Nutrition de {getPartnerDisplayName(nutritionData.partner)}
                  </h1>
                  <p className="text-green-100">
                    {selectedDate ? 'Jour sélectionné' : 'Derniers 7 jours'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-3">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Sélecteur de date */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner un jour</h3>
          <div className="grid grid-cols-7 gap-2">
            {generateDateOptions().map(date => {
              const dateObj = new Date(date)
              const isSelected = selectedDate === date
              const hasData = nutritionData.dailyStats.some(day => day.date === date)
              
              return (
                <button
                  key={date}
                  onClick={() => handleDateChange(date)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    isSelected
                      ? 'bg-green-500 text-white'
                      : hasData
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!hasData}
                >
                  <div className="text-xs font-medium">
                    {dateObj.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className="text-sm">
                    {dateObj.getDate()}
                  </div>
                  {hasData && (
                    <div className="w-2 h-2 bg-current rounded-full mx-auto mt-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {selectedDayStats && (
          <motion.div
            key={selectedDayStats.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Statistiques du jour */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Résumé du jour</span>
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4">
                  <div className="text-2xl font-bold">{selectedDayStats.totalCalories}</div>
                  <div className="text-orange-100">Calories totales</div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">
                      {Math.round(selectedDayStats.totalProtein)}g
                    </div>
                    <div className="text-xs text-blue-500">Protéines</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-semibold text-yellow-600">
                      {Math.round(selectedDayStats.totalCarbs)}g
                    </div>
                    <div className="text-xs text-yellow-500">Glucides</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">
                      {Math.round(selectedDayStats.totalFat)}g
                    </div>
                    <div className="text-xs text-purple-500">Lipides</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Répartition macronutriments</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Protéines: {formatMacroPercentage(selectedDayStats.totalProtein * 4, selectedDayStats.totalCalories)}</span>
                      <span>Glucides: {formatMacroPercentage(selectedDayStats.totalCarbs * 4, selectedDayStats.totalCalories)}</span>
                      <span>Lipides: {formatMacroPercentage(selectedDayStats.totalFat * 9, selectedDayStats.totalCalories)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des repas */}
            <div className="lg:col-span-2 space-y-4">
              {['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Souper', 'Collation'].map(mealType => {
                const mealsOfType = selectedDayStats.meals.filter(meal => meal.meal_type === mealType)
                
                if (mealsOfType.length === 0) return null

                return (
                  <div key={mealType} className="bg-white rounded-xl shadow-md p-6">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getMealTypeColor(mealType)} mb-4`}>
                      <span>{getMealTypeIcon(mealType)}</span>
                      <span>{mealType}</span>
                      <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">
                        {mealsOfType.length} élément{mealsOfType.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {mealsOfType.map(meal => (
                        <div key={meal.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{meal.food_name}</h4>
                              <div className="text-sm text-gray-500 mt-1">
                                {meal.time && `${meal.time} • `}
                                {meal.calories} cal
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div>P: {meal.protein}g</div>
                              <div>G: {meal.carbs}g</div>
                              <div>L: {meal.fat}g</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {nutritionData.dailyStats.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune donnée nutrition disponible
            </h3>
            <p className="text-gray-600">
              {getPartnerDisplayName(nutritionData.partner)} n&apos;a pas encore enregistré de repas pour cette période.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}