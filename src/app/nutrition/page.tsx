'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { NutritionLayout, NutritionLayoutContainer, NutritionLayoutCard, NutritionLayoutGrid, NutritionLayoutScreenLoader, NutritionLayoutBlockLoader, NutritionLayoutFooterText } from '@/components/layout/NutritionLayout'
import { NutritionHeader } from '@/components/nutrition/NutritionHeader'
import { NutritionProgressCards } from '@/components/nutrition/NutritionProgressCards'
import { DailyMealsList } from '@/components/nutrition/DailyMealsList'

// Lazy loading des composants lourds
const RecipeLibrary = dynamic(() => import('@/components/nutrition/RecipeLibrary'), {
  ssr: false,
  loading: () => <NutritionLayoutBlockLoader height="h-96" text="Chargement de la bibliothèque..." />
})

const UnifiedMealModal = dynamic(() => import('@/components/nutrition/UnifiedMealModal'), {
  ssr: false,
  loading: () => <NutritionLayoutBlockLoader height="h-64" text="Chargement du modal..." />
})

const NutritionCharts = dynamic(() => import('@/components/nutrition/NutritionCharts'), {
  ssr: false,
  loading: () => <NutritionLayoutBlockLoader height="h-64" text="Chargement des graphiques..." />
})

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

      if (error) throw error
      setMeals(data || [])
    } catch (error) {
      console.error('Erreur chargement repas:', error)
    }
  }, [userId, selectedDate, supabase])

  const loadWeeklyMeals = useCallback(async () => {
    if (!userId) return

    try {
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
        // SECURITY: Limit weekly data against abusive user loads
        .limit(100)

      if (error) throw error
      setWeeklyMeals(data || [])
    } catch (error) {
      console.error('Erreur chargement weekly meals:', error)
    }
  }, [userId, supabase])

  const deleteMeal = async (mealId: number) => {
    if (!userId || !confirm('Supprimer ce repas ?')) return

    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        // SECURITY UPDATE: IDOR protection. Force user verification on delete
        .eq('id', mealId)
        .eq('user_id', userId)

      if (error) throw error
      loadMeals()
    } catch (error) {
      console.error('Erreur de suppression:', error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const supabaseClient = createClient()
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }
      setUserId(user.id)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (userId) {
      loadMeals()
      loadWeeklyMeals()
    }
  }, [userId, selectedDate, loadMeals, loadWeeklyMeals])

  const todayNutrition = useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [meals])

  const goals = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80
  }

  const todayMeals = useMemo(() => {
    const selectedDateStr = selectedDate.toDateString()
    return meals.filter(m => new Date(m.date).toDateString() === selectedDateStr)
  }, [meals, selectedDate])

  const macroData = useMemo(() => {
    const total = todayNutrition.protein + todayNutrition.carbs + todayNutrition.fat
    if (total === 0) return []
    return [
      { name: 'Protéines', value: todayNutrition.protein, color: 'hsl(var(--safe-info))', percentage: Math.round((todayNutrition.protein / total) * 100) },
      { name: 'Glucides', value: todayNutrition.carbs, color: 'hsl(var(--safe-success))', percentage: Math.round((todayNutrition.carbs / total) * 100) },
      { name: 'Lipides', value: todayNutrition.fat, color: 'hsl(var(--safe-warning))', percentage: Math.round((todayNutrition.fat / total) * 100) }
    ]
  }, [todayNutrition])

  const weeklyData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    
    return days.map((day, index) => {
      const currentDate = new Date(monday)
      currentDate.setDate(monday.getDate() + index)
      const dateStr = currentDate.toISOString().split('T')[0]
      
      const dayMeals = weeklyMeals.filter(m => m.date === dateStr)
      const dayNutrition = dayMeals.reduce((acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
      }), { calories: 0, protein: 0 })
      
      return {
        day,
        calories: Math.round(dayNutrition.calories),
        protein: Math.round(dayNutrition.protein),
        isToday: dateStr === today.toISOString().split('T')[0],
        date: dateStr,
        mealsCount: dayMeals.length
      }
    })
  }, [weeklyMeals])

  if (loading) {
    return (
      <NutritionLayout>
        <NutritionLayoutScreenLoader />
      </NutritionLayout>
    )
  }

  return (
    <NutritionLayout>
      <NutritionHeader 
        onOpenRecipeLibrary={() => setShowRecipeLibrary(true)}
        onOpenMealModal={() => { setSelectedMealType(''); setShowMealModal(true); }}
      />
      
      <NutritionLayoutContainer>
        <NutritionProgressCards todayNutrition={todayNutrition} goals={goals} />

        <NutritionLayoutGrid>
          <NutritionLayoutCard title="Répartition des macronutriments">
            <NutritionCharts macroData={macroData} weeklyData={[]} showWeekly={false} />
          </NutritionLayoutCard>
          
          <NutritionLayoutCard 
            title="Évolution hebdomadaire" 
            headerRight={`${weeklyData.reduce((acc, d) => acc + d.mealsCount, 0)} repas`}
          >
            <NutritionCharts macroData={[]} weeklyData={weeklyData} showWeekly={true} />
            <NutritionLayoutFooterText>
              Aperçu global de votre semaine nutritionnelle.
            </NutritionLayoutFooterText>
          </NutritionLayoutCard>
        </NutritionLayoutGrid>

        <DailyMealsList 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          todayMeals={todayMeals}
          onOpenMealModal={(type) => { setSelectedMealType(type); setShowMealModal(true); }}
          onDeleteMeal={deleteMeal}
        />
      </NutritionLayoutContainer>

      {showMealModal && userId && (
        <UnifiedMealModal
          isOpen={showMealModal}
          onClose={() => setShowMealModal(false)}
          onMealAdded={() => { loadMeals(); setShowMealModal(false); }}
          mealType={selectedMealType}
          selectedDate={selectedDate}
          userId={userId}
        />
      )}

      {showRecipeLibrary && userId && (
        <RecipeLibrary
          isOpen={showRecipeLibrary}
          onClose={() => setShowRecipeLibrary(false)}
          userId={userId}
        />
      )}
    </NutritionLayout>
  )
}