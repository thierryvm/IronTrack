import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'

interface RecipeIngredient {
  food_name: string
  food_id?: string
  quantity: number
  unit: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  sodium_per_100g?: number
  calculated_calories: number
  calculated_protein: number
  calculated_carbs: number
  calculated_fat: number
  calculated_fiber?: number
  calculated_sugar?: number
  calculated_sodium?: number
  sort_order?: number
}

interface RecipeData {
  name: string
  description?: string
  servings: number
  preparation_time?: number
  tags?: string[]
  ingredients: RecipeIngredient[]
  is_favorite?: boolean
  is_public?: boolean
}

// Fonction de sanitisation sécurisée
function sanitizeString(str: string): string {
  return str
    .replace(/[<>"&]/g, '')
    .replace(/[^a-zA-Z0-9\s\u00C0-\u017F\-'.,]/g, '')
    .trim()
    .substring(0, 200)
}

// Fonction de validation des valeurs nutritionnelles
function validateNutrientValue(value: number): number {
  const num = parseFloat(String(value))
  if (isNaN(num) || num < 0 || num > 10000) {
    return 0
  }
  return Math.round(num * 100) / 100
}

// GET - Récupérer toutes les recettes de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includePublic = searchParams.get('include_public') === 'true'
    const favorites = searchParams.get('favorites') === 'true'
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    let query = supabase
      .from('recipe_with_ingredients')
      .select('*')
      .order('updated_at', { ascending: false })

    // Filtrer par utilisateur et recettes publiques si demandé
    if (includePublic) {
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`)
    } else {
      query = query.eq('user_id', user.id)
    }

    // Filtrer par favoris
    if (favorites) {
      query = query.eq('is_favorite', true)
    }

    // Recherche dans le nom et description
    if (search) {
      const sanitizedSearch = sanitizeString(search)
      query = query.or(`name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`)
    }

    // Filtrer par tags
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    const { data: recipes, error } = await query

    if (error) {
      if (process.env.NODE_ENV === 'development') {

        console.error('Erreur récupération recettes:', error)

      }
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recipes: recipes || [],
      count: recipes?.length || 0
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {

      console.error('Erreur API recipes GET:', error)

    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle recette
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body: RecipeData = await request.json()

    // Validation des données
    if (!body.name || !body.ingredients || body.ingredients.length === 0) {
      return NextResponse.json({ 
        error: 'Nom et ingrédients requis' 
      }, { status: 400 })
    }

    if (body.servings < 1 || body.servings > 20) {
      return NextResponse.json({ 
        error: 'Le nombre de portions doit être entre 1 et 20' 
      }, { status: 400 })
    }

    // Sanitiser les données
    const sanitizedName = sanitizeString(body.name)
    const sanitizedDescription = body.description ? sanitizeString(body.description) : null
    const sanitizedTags = body.tags?.map(tag => sanitizeString(tag)).filter(Boolean) || []

    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ 
        error: 'Le nom doit contenir au moins 2 caractères' 
      }, { status: 400 })
    }

    // Calculer les totaux nutritionnels
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0
    let totalSugar = 0
    let totalSodium = 0

    const validatedIngredients = body.ingredients.map((ingredient, index) => {
      const calories = validateNutrientValue(ingredient.calculated_calories)
      const protein = validateNutrientValue(ingredient.calculated_protein)
      const carbs = validateNutrientValue(ingredient.calculated_carbs)
      const fat = validateNutrientValue(ingredient.calculated_fat)
      const fiber = validateNutrientValue(ingredient.calculated_fiber || 0)
      const sugar = validateNutrientValue(ingredient.calculated_sugar || 0)
      const sodium = validateNutrientValue(ingredient.calculated_sodium || 0)

      totalCalories += calories
      totalProtein += protein
      totalCarbs += carbs
      totalFat += fat
      totalFiber += fiber
      totalSugar += sugar
      totalSodium += sodium

      return {
        food_name: sanitizeString(ingredient.food_name),
        food_id: ingredient.food_id,
        quantity: validateNutrientValue(ingredient.quantity),
        unit: sanitizeString(ingredient.unit),
        calories_per_100g: validateNutrientValue(ingredient.calories_per_100g),
        protein_per_100g: validateNutrientValue(ingredient.protein_per_100g),
        carbs_per_100g: validateNutrientValue(ingredient.carbs_per_100g),
        fat_per_100g: validateNutrientValue(ingredient.fat_per_100g),
        fiber_per_100g: validateNutrientValue(ingredient.fiber_per_100g || 0),
        sugar_per_100g: validateNutrientValue(ingredient.sugar_per_100g || 0),
        sodium_per_100g: validateNutrientValue(ingredient.sodium_per_100g || 0),
        calculated_calories: calories,
        calculated_protein: protein,
        calculated_carbs: carbs,
        calculated_fat: fat,
        calculated_fiber: fiber,
        calculated_sugar: sugar,
        calculated_sodium: sodium,
        sort_order: ingredient.sort_order || index
      }
    })

    // Créer la recette
    const { data: recipe, error: recipeError } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: user.id,
        name: sanitizedName,
        description: sanitizedDescription,
        servings: body.servings,
        preparation_time: body.preparation_time || 0,
        tags: sanitizedTags,
        total_calories: Math.round(totalCalories),
        total_protein: Math.round(totalProtein * 100) / 100,
        total_carbs: Math.round(totalCarbs * 100) / 100,
        total_fat: Math.round(totalFat * 100) / 100,
        total_fiber: Math.round(totalFiber * 100) / 100,
        total_sugar: Math.round(totalSugar * 100) / 100,
        total_sodium: Math.round(totalSodium * 100) / 100,
        is_favorite: body.is_favorite || false,
        is_public: body.is_public || false
      })
      .select()
      .single()

    if (recipeError) {
      if (process.env.NODE_ENV === 'development') {

        console.error('Erreur création recette:', recipeError)

      }
      return NextResponse.json({ error: 'Erreur création recette' }, { status: 500 })
    }

    // Ajouter les ingrédients
    const ingredientsToInsert = validatedIngredients.map(ingredient => ({
      ...ingredient,
      recipe_id: recipe.id
    }))

    const { error: ingredientsError } = await supabase
      .from('saved_recipe_ingredients')
      .insert(ingredientsToInsert)

    if (ingredientsError) {
      if (process.env.NODE_ENV === 'development') {

        console.error('Erreur ajout ingrédients:', ingredientsError)

      }
      // Supprimer la recette si l'ajout des ingrédients échoue
      await supabase.from('saved_recipes').delete().eq('id', recipe.id)
      return NextResponse.json({ error: 'Erreur ajout ingrédients' }, { status: 500 })
    }

    // Récupérer la recette complète avec ingrédients
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipe_with_ingredients')
      .select('*')
      .eq('id', recipe.id)
      .single()

    if (fetchError) {
      if (process.env.NODE_ENV === 'development') {

        console.error('Erreur récupération recette complète:', fetchError)

      }
      return NextResponse.json({ error: 'Erreur récupération recette' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recipe: completeRecipe,
      message: 'Recette créée avec succès'
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {

      console.error('Erreur API recipes POST:', error)

    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}