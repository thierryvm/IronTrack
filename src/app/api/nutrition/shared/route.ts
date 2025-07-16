import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'

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

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')
    const date = searchParams.get('date')

    if (!partnerId) {
      return NextResponse.json({ error: 'ID du partenaire requis' }, { status: 400 })
    }

    // Vérifier que c'est un partenaire accepté avec permission de partage nutrition
    const { data: partnershipData, error: partnershipError } = await supabase
      .from('training_partners')
      .select('*')
      .eq('status', 'accepted')
      .or(`and(requester_id.eq.${user.id},partner_id.eq.${partnerId}),and(requester_id.eq.${partnerId},partner_id.eq.${user.id})`)
      .single()

    if (partnershipError || !partnershipData) {
      return NextResponse.json({ error: 'Partenariat non trouvé ou non accepté' }, { status: 404 })
    }

    // Vérifier les permissions de partage nutrition
    const { data: sharingSettings, error: sharingError } = await supabase
      .from('partner_sharing_settings')
      .select('share_nutrition')
      .eq('user_id', partnerId)
      .eq('partner_id', user.id)
      .single()

    if (sharingError || !sharingSettings?.share_nutrition) {
      return NextResponse.json({ error: 'Le partenaire n\'a pas activé le partage de nutrition' }, { status: 403 })
    }

    // Récupérer les données nutrition du partenaire
    let query = supabase
      .from('nutrition_logs')
      .select(`
        id,
        date,
        meal_type,
        food_name,
        calories,
        protein,
        carbs,
        fat,
        time,
        created_at
      `)
      .eq('user_id', partnerId)
      .order('date', { ascending: false })
      .order('time', { ascending: true })

    // Filtrer par date si spécifiée
    if (date) {
      query = query.eq('date', date)
    } else {
      // Par défaut, récupérer les 7 derniers jours
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      query = query.gte('date', sevenDaysAgo.toISOString().split('T')[0])
    }

    const { data: nutritionData, error: nutritionError } = await query

    if (nutritionError) {
      console.error('Erreur récupération nutrition partagée:', nutritionError)
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 })
    }

    // Récupérer les informations du partenaire
    const { data: partnerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, pseudo, full_name, avatar_url')
      .eq('id', partnerId)
      .single()

    if (profileError) {
      console.error('Erreur récupération profil partenaire:', profileError)
      return NextResponse.json({ error: 'Erreur lors de la récupération du profil' }, { status: 500 })
    }

    // Calculer les statistiques nutritionnelles
    const stats = nutritionData.reduce((acc, meal) => {
      const mealDate = meal.date
      if (!acc[mealDate]) {
        acc[mealDate] = {
          date: mealDate,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          meals: []
        }
      }

      acc[mealDate].totalCalories += meal.calories
      acc[mealDate].totalProtein += parseFloat(meal.protein.toString())
      acc[mealDate].totalCarbs += parseFloat(meal.carbs.toString())
      acc[mealDate].totalFat += parseFloat(meal.fat.toString())
      acc[mealDate].meals.push(meal)

      return acc
    }, {} as Record<string, { date: string; totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number; meals: NutritionLog[] }>)

    const dailyStats = Object.values(stats)

    return NextResponse.json({
      success: true,
      data: {
        partner: partnerProfile,
        nutritionLogs: nutritionData,
        dailyStats,
        dateRange: date || 'last7days'
      }
    })

  } catch (error) {
    console.error('Erreur API nutrition partagée:', error)
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 })
  }
}