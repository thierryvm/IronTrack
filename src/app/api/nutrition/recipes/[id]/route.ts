import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

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

interface RecipeUpdateData {
  name?: string
  description?: string
  servings?: number
  preparation_time?: number
  tags?: string[]
  ingredients?: RecipeIngredient[]
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

// Fonction pour vérifier si l'utilisateur peut modifier la recette
async function canUserModifyRecipe(supabase: SupabaseClient, recipeId: string, userId: string): Promise<boolean> {
  const { data: recipe, error } = await supabase
    .from('saved_recipes')
    .select('user_id')
    .eq('id', recipeId)
    .single()

  if (error || !recipe) {
    return false
  }

  return recipe.user_id === userId
}

// GET - Récupérer une recette spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(`[API LOG] /api/nutrition/recipes/[id]/route.ts - ${request?.method || 'UNKNOWN'} appelé à`, new Date().toISOString());
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const recipeId = (await params).id

    // Récupérer la recette complète avec ingrédients
    const { data: recipe, error } = await supabase
      .from('recipe_with_ingredients')
      .select('*')
      .eq('id', recipeId)
      .single()

    if (error) {
      console.error('Erreur récupération recette:', error)
      return NextResponse.json({ error: 'Recette non trouvée' }, { status: 404 })
    }

    // Vérifier l'accès (propriétaire ou recette publique)
    if (recipe.user_id !== user.id && !recipe.is_public) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      recipe
    })

  } catch (error) {
    console.error('Erreur API recipe GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une recette
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(`[API LOG] /api/nutrition/recipes/[id]/route.ts - ${request?.method || 'UNKNOWN'} appelé à`, new Date().toISOString());
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const recipeId = (await params).id
    const body: RecipeUpdateData = await request.json()

    // Vérifier si l'utilisateur peut modifier cette recette
    if (!(await canUserModifyRecipe(supabase, recipeId, user.id))) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const sanitizedName = sanitizeString(body.name)
      if (!sanitizedName || sanitizedName.length < 2) {
        return NextResponse.json({ 
          error: 'Le nom doit contenir au moins 2 caractères' 
        }, { status: 400 })
      }
      updateData.name = sanitizedName
    }

    if (body.description !== undefined) {
      updateData.description = body.description ? sanitizeString(body.description) : null
    }

    if (body.servings !== undefined) {
      if (body.servings < 1 || body.servings > 20) {
        return NextResponse.json({ 
          error: 'Le nombre de portions doit être entre 1 et 20' 
        }, { status: 400 })
      }
      updateData.servings = body.servings
    }

    if (body.preparation_time !== undefined) {
      updateData.preparation_time = body.preparation_time || 0
    }

    if (body.tags !== undefined) {
      updateData.tags = body.tags?.map(tag => sanitizeString(tag)).filter(Boolean) || []
    }

    if (body.is_favorite !== undefined) {
      updateData.is_favorite = body.is_favorite
    }

    if (body.is_public !== undefined) {
      updateData.is_public = body.is_public
    }

    // Si des ingrédients sont fournis, les mettre à jour
    if (body.ingredients) {
      // Calculer les nouveaux totaux nutritionnels
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
          sort_order: ingredient.sort_order || index,
          recipe_id: recipeId
        }
      })

      // Mettre à jour les totaux nutritionnels
      updateData.total_calories = Math.round(totalCalories)
      updateData.total_protein = Math.round(totalProtein * 100) / 100
      updateData.total_carbs = Math.round(totalCarbs * 100) / 100
      updateData.total_fat = Math.round(totalFat * 100) / 100
      updateData.total_fiber = Math.round(totalFiber * 100) / 100
      updateData.total_sugar = Math.round(totalSugar * 100) / 100
      updateData.total_sodium = Math.round(totalSodium * 100) / 100

      // Supprimer les anciens ingrédients
      const { error: deleteError } = await supabase
        .from('saved_recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)

      if (deleteError) {
        console.error('Erreur suppression anciens ingrédients:', deleteError)
        return NextResponse.json({ error: 'Erreur mise à jour ingrédients' }, { status: 500 })
      }

      // Ajouter les nouveaux ingrédients
      if (validatedIngredients.length > 0) {
        const { error: insertError } = await supabase
          .from('saved_recipe_ingredients')
          .insert(validatedIngredients)

        if (insertError) {
          console.error('Erreur ajout nouveaux ingrédients:', insertError)
          return NextResponse.json({ error: 'Erreur mise à jour ingrédients' }, { status: 500 })
        }
      }
    }

    // Mettre à jour la recette
    const { error: updateError } = await supabase
      .from('saved_recipes')
      .update(updateData)
      .eq('id', recipeId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour recette:', updateError)
      return NextResponse.json({ error: 'Erreur mise à jour recette' }, { status: 500 })
    }

    // Récupérer la recette complète mise à jour
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipe_with_ingredients')
      .select('*')
      .eq('id', recipeId)
      .single()

    if (fetchError) {
      console.error('Erreur récupération recette mise à jour:', fetchError)
      return NextResponse.json({ error: 'Erreur récupération recette' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recipe: completeRecipe,
      message: 'Recette mise à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur API recipe PUT:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une recette
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(`[API LOG] /api/nutrition/recipes/[id]/route.ts - ${request?.method || 'UNKNOWN'} appelé à`, new Date().toISOString());
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const recipeId = (await params).id

    // Vérifier si l'utilisateur peut supprimer cette recette
    if (!(await canUserModifyRecipe(supabase, recipeId, user.id))) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Supprimer la recette (les ingrédients seront supprimés par CASCADE)
    const { error: deleteError } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', recipeId)

    if (deleteError) {
      console.error('Erreur suppression recette:', deleteError)
      return NextResponse.json({ error: 'Erreur suppression recette' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Recette supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur API recipe DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}