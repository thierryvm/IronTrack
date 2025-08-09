'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  ChefHat, 
  Scale, 
  CheckCircle, 
  X as LucideX, 
  ArrowLeft, 
  ArrowRight,
  Save,
  Calculator,
  AlertTriangle,
  BookOpen,
  Tag
} from 'lucide-react'
import FoodSearchAutocomplete, { NutritionData } from './FoodSearchAutocomplete'

// Types pour le constructeur de repas
interface MealIngredient {
  id: string
  food: NutritionData
  quantity: number
  unit: string
  calculatedNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

interface MealComposition {
  id?: string
  name: string
  ingredients: MealIngredient[]
  totalNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  servings: number
  preparationTime?: number
  tags?: string[]
}

// Unités de mesure avec conversions
const UNIT_CATEGORIES = {
  weight: {
    name: 'Poids',
    units: [
      { value: 'g', label: 'grammes', factor: 1 },
      { value: 'kg', label: 'kilogrammes', factor: 1000 },
      { value: 'oz', label: 'onces', factor: 28.35 },
      { value: 'lb', label: 'livres', factor: 453.59 }
    ]
  },
  volume: {
    name: 'Volume',
    units: [
      { value: 'ml', label: 'millilitres', factor: 1 },
      { value: 'l', label: 'litres', factor: 1000 },
      { value: 'cup', label: 'tasses', factor: 240 },
      { value: 'tbsp', label: 'cuillères à soupe', factor: 15 },
      { value: 'tsp', label: 'cuillères à café', factor: 5 }
    ]
  },
  piece: {
    name: 'Pièces',
    units: [
      { value: 'piece', label: 'pièce(s)', factor: 1 },
      { value: 'slice', label: 'tranche(s)', factor: 1 },
      { value: 'handful', label: 'poignée(s)', factor: 1 }
    ]
  }
}

// Conversions approximatives pour les ingrédients courants (densité)
const INGREDIENT_DENSITIES: Record<string, { density: number; preferredUnit: string; category: keyof typeof UNIT_CATEGORIES }> = {
  // Légumes
  'tomate': { density: 0.95, preferredUnit: 'piece', category: 'piece' },
  'laitue': { density: 0.12, preferredUnit: 'g', category: 'weight' },
  'concombre': { density: 0.95, preferredUnit: 'piece', category: 'piece' },
  'carotte': { density: 0.85, preferredUnit: 'piece', category: 'piece' },
  'oignon': { density: 0.9, preferredUnit: 'piece', category: 'piece' },
  
  // Protéines
  'poulet': { density: 1.05, preferredUnit: 'g', category: 'weight' },
  'boeuf': { density: 1.1, preferredUnit: 'g', category: 'weight' },
  'poisson': { density: 1.0, preferredUnit: 'g', category: 'weight' },
  'oeuf': { density: 1.03, preferredUnit: 'piece', category: 'piece' },
  
  // Féculents
  'riz': { density: 0.75, preferredUnit: 'g', category: 'weight' },
  'pâtes': { density: 0.6, preferredUnit: 'g', category: 'weight' },
  'pain': { density: 0.25, preferredUnit: 'slice', category: 'piece' },
  
  // Liquides
  'eau': { density: 1.0, preferredUnit: 'ml', category: 'volume' },
  'lait': { density: 1.03, preferredUnit: 'ml', category: 'volume' },
  'huile': { density: 0.92, preferredUnit: 'tbsp', category: 'volume' }
}

interface MealBuilderProps {
  onMealComplete: (meal: MealComposition) => void
  onCancel: () => void
  initialMeal?: MealComposition
  className?: string
  onSaveAsRecipe?: (meal: MealComposition) => Promise<void>
}

export default function MealBuilder({ onMealComplete, onCancel, initialMeal, className = '', onSaveAsRecipe }: MealBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [mealName, setMealName] = useState(initialMeal?.name || '')
  const [ingredients, setIngredients] = useState<MealIngredient[]>(initialMeal?.ingredients || [])
  const [servings, setServings] = useState(initialMeal?.servings || 1)
  const [preparationTime, setPreparationTime] = useState(initialMeal?.preparationTime || 0)
  const [tags, setTags] = useState<string[]>(initialMeal?.tags || [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingRecipe, setIsSavingRecipe] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Fonction de sécurité pour la saisie du nom
  const sanitizeMealName = useCallback((name: string): string => {
    return name
      .replace(/[<>'"&]/g, '')
      .replace(/[^a-zA-Z0-9\s\u00C0-\u017F\-,.]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100)
  }, [])

  // Fonction pour détecter l'unité recommandée
  const getRecommendedUnit = useCallback((foodName: string): { unit: string; category: keyof typeof UNIT_CATEGORIES } => {
    const normalizedName = foodName.toLowerCase()
    
    // Recherche par mot-clé
    for (const [ingredient, config] of Object.entries(INGREDIENT_DENSITIES)) {
      if (normalizedName.includes(ingredient)) {
        return { unit: config.preferredUnit, category: config.category }
      }
    }
    
    // Défaut selon le type d'aliment
    if (normalizedName.includes('liquide') || normalizedName.includes('eau') || normalizedName.includes('lait')) {
      return { unit: 'ml', category: 'volume' }
    }
    
    if (normalizedName.includes('viande') || normalizedName.includes('poisson') || normalizedName.includes('protéine')) {
      return { unit: 'g', category: 'weight' }
    }
    
    return { unit: 'g', category: 'weight' }
  }, [])

  // Fonction de conversion des unités
  const convertToGrams = useCallback((quantity: number, unit: string, foodName: string): number => {
    const normalizedName = foodName.toLowerCase()
    
    // Recherche de densité spécifique
    const density = Object.entries(INGREDIENT_DENSITIES).find(([key]) => 
      normalizedName.includes(key)
    )?.[1]?.density || 1
    
    // Conversion selon l'unité
    const allUnits = [...UNIT_CATEGORIES.weight.units, ...UNIT_CATEGORIES.volume.units, ...UNIT_CATEGORIES.piece.units]
    const unitConfig = allUnits.find(u => u.value === unit)
    
    if (!unitConfig) return quantity
    
    // Conversion spéciale pour les pièces
    if (unit === 'piece') {
      const pieceWeights: Record<string, number> = {
        'tomate': 150,
        'oeuf': 60,
        'pomme': 180,
        'orange': 200,
        'carotte': 80,
        'oignon': 150
      }
      
      const pieceWeight = Object.entries(pieceWeights).find(([key]) => 
        normalizedName.includes(key)
      )?.[1] || 100
      
      return quantity * pieceWeight
    }
    
    if (unit === 'slice') {
      return quantity * 25 // 25g par tranche moyenne
    }
    
    if (unit === 'handful') {
      return quantity * 30 // 30g par poignée
    }
    
    // Conversion volume vers poids
    if (UNIT_CATEGORIES.volume.units.some(u => u.value === unit)) {
      return quantity * unitConfig.factor * density
    }
    
    // Conversion poids
    return quantity * unitConfig.factor
  }, [])

  // Calcul des valeurs nutritionnelles pour un ingrédient
  const calculateIngredientNutrition = useCallback((ingredient: MealIngredient): MealIngredient => {
    const gramsQuantity = convertToGrams(ingredient.quantity, ingredient.unit, ingredient.food.name)
    const factor = gramsQuantity / 100 // Les valeurs sont pour 100g
    
    return {
      ...ingredient,
      calculatedNutrition: {
        calories: Math.round(ingredient.food.calories_per_100g * factor),
        protein: Math.round(ingredient.food.protein_per_100g * factor * 10) / 10,
        carbs: Math.round(ingredient.food.carbs_per_100g * factor * 10) / 10,
        fat: Math.round(ingredient.food.fat_per_100g * factor * 10) / 10
      }
    }
  }, [convertToGrams])

  // Ajout d'un ingrédient
  const addIngredient = useCallback((food: NutritionData) => {
    const recommended = getRecommendedUnit(food.name)
    const newIngredient: MealIngredient = {
      id: Date.now().toString(),
      food,
      quantity: 1,
      unit: recommended.unit,
      calculatedNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }
    
    const calculatedIngredient = calculateIngredientNutrition(newIngredient)
    setIngredients(prev => [...prev, calculatedIngredient])
  }, [getRecommendedUnit, calculateIngredientNutrition])

  // Mise à jour d'un ingrédient
  const updateIngredient = useCallback((id: string, updates: Partial<MealIngredient>) => {
    setIngredients(prev => prev.map(ingredient => {
      if (ingredient.id === id) {
        const updated = { ...ingredient, ...updates }
        return calculateIngredientNutrition(updated)
      }
      return ingredient
    }))
  }, [calculateIngredientNutrition])

  // Suppression d'un ingrédient
  const removeIngredient = useCallback((id: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient.id !== id))
  }, [])

  // Calcul du total nutritionnel
  const totalNutrition = useMemo(() => {
    return ingredients.reduce((total, ingredient) => ({
      calories: total.calories + ingredient.calculatedNutrition.calories,
      protein: total.protein + ingredient.calculatedNutrition.protein,
      carbs: total.carbs + ingredient.calculatedNutrition.carbs,
      fat: total.fat + ingredient.calculatedNutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }, [ingredients])

  // Validation des étapes
  const validateStep = useCallback((step: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (ingredients.length === 0) {
          stepErrors.ingredients = 'Ajoutez au moins un ingrédient'
        }
        break
      case 2:
        if (ingredients.some(ing => ing.quantity <= 0)) {
          stepErrors.quantities = 'Toutes les quantités doivent être positives'
        }
        break
      case 3:
        const sanitizedName = sanitizeMealName(mealName)
        if (!sanitizedName || sanitizedName.length < 2) {
          stepErrors.name = 'Le nom doit contenir au moins 2 caractères'
        }
        if (servings < 1 || servings > 20) {
          stepErrors.servings = 'Le nombre de portions doit être entre 1 et 20'
        }
        break
    }
    
    return stepErrors
  }, [ingredients, mealName, servings, sanitizeMealName])

  // Navigation entre étapes
  const nextStep = useCallback(() => {
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    
    setErrors({})
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }, [currentStep, validateStep])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setErrors({})
  }, [])

  // Gestion des tags
  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }, [newTag, tags])

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }, [])

  // Sauvegarde comme recette
  const saveAsRecipe = useCallback(async () => {
    if (!onSaveAsRecipe) return

    const stepErrors = validateStep(3)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setIsSavingRecipe(true)

    const meal: MealComposition = {
      id: initialMeal?.id,
      name: sanitizeMealName(mealName),
      ingredients,
      totalNutrition,
      servings,
      preparationTime,
      tags
    }

    try {
      await onSaveAsRecipe(meal)
    } catch (error) {
      console.error('Erreur sauvegarde recette:', error)
    } finally {
      setIsSavingRecipe(false)
    }
  }, [
    onSaveAsRecipe,
    validateStep,
    mealName,
    ingredients,
    totalNutrition,
    servings,
    preparationTime,
    tags,
    initialMeal,
    sanitizeMealName
  ])

  // Finalisation du repas
  const completeMeal = useCallback(() => {
    const stepErrors = validateStep(3)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    
    setIsLoading(true)
    
    const meal: MealComposition = {
      id: initialMeal?.id,
      name: sanitizeMealName(mealName),
      ingredients,
      totalNutrition,
      servings,
      preparationTime,
      tags
    }
    
    // Simule un petit délai pour l'UX
    setTimeout(() => {
      onMealComplete(meal)
      setIsLoading(false)
    }, 500)
  }, [
    validateStep, 
    mealName, 
    ingredients, 
    totalNutrition, 
    servings, 
    preparationTime, 
    tags, 
    onMealComplete, 
    initialMeal, 
    sanitizeMealName
  ])

  // Rendu des différentes étapes
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <ChefHat className="h-12 w-12 mx-auto text-orange-800 mb-2" />
              <h3 className="text-xl font-bold text-gray-900">Sélectionnez vos ingrédients</h3>
              <p className="text-gray-600">Recherchez et ajoutez les ingrédients de votre repas</p>
            </div>
            
            <FoodSearchAutocomplete
              onFoodSelect={addIngredient}
              placeholder="Rechercher un ingrédient..."
              className="mb-4"
            />
            
            {ingredients.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Ingrédients sélectionnés ({ingredients.length})</h4>
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-800 font-bold text-sm">
                          {ingredient.food.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{ingredient.food.name}</h5>
                        <p className="text-sm text-gray-600">
                          {ingredient.food.calories_per_100g} cal/100g
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeIngredient(ingredient.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <LucideX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {errors.ingredients && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errors.ingredients}</span>
              </div>
            )}
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Scale className="h-12 w-12 mx-auto text-orange-800 mb-2" />
              <h3 className="text-xl font-bold text-gray-900">Définissez les quantités</h3>
              <p className="text-gray-600">Ajustez les quantités pour chaque ingrédient</p>
            </div>
            
            <div className="space-y-4">
              {ingredients.map((ingredient) => {
                const recommendedUnit = getRecommendedUnit(ingredient.food.name)
                const availableUnits = UNIT_CATEGORIES[recommendedUnit.category].units
                
                return (
                  <div key={ingredient.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">{ingredient.food.name}</h5>
                      <span className="text-sm text-gray-500">
                        {ingredient.calculatedNutrition.calories} cal
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(ingredient.id, { 
                            quantity: parseFloat(e.target.value) || 0 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unité
                        </label>
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(ingredient.id, { unit: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {availableUnits.map(unit => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center">
                          <span className="font-medium text-orange-800">
                            {ingredient.calculatedNutrition.calories}
                          </span>
                          <p className="text-gray-600">cal</p>
                        </div>
                        <div className="text-center">
                          <span className="font-medium text-blue-600">
                            {ingredient.calculatedNutrition.protein}g
                          </span>
                          <p className="text-gray-600">prot</p>
                        </div>
                        <div className="text-center">
                          <span className="font-medium text-green-600">
                            {ingredient.calculatedNutrition.carbs}g
                          </span>
                          <p className="text-gray-600">glu</p>
                        </div>
                        <div className="text-center">
                          <span className="font-medium text-yellow-600">
                            {ingredient.calculatedNutrition.fat}g
                          </span>
                          <p className="text-gray-600">lip</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {errors.quantities && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errors.quantities}</span>
              </div>
            )}
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calculator className="h-12 w-12 mx-auto text-orange-800 mb-2" />
              <h3 className="text-xl font-bold text-gray-900">Résumé et sauvegarde</h3>
              <p className="text-gray-600">Nommez votre repas et vérifiez les valeurs nutritionnelles</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du repas *
                </label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  onBlur={(e) => setMealName(sanitizeMealName(e.target.value))}
                  placeholder="Ex: Salade de poulet aux légumes"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={100}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.servings ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.servings && (
                    <p className="text-red-500 text-sm mt-1">{errors.servings}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temps de préparation (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Gestion des tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (optionnel)
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder="Ex: Végétarien, Rapide, Protéiné..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      maxLength={30}
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
                          <Tag className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-700">{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <LucideX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Résumé nutritionnel */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Valeurs nutritionnelles totales</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-800">
                    {totalNutrition.calories}
                  </div>
                  <div className="text-sm text-gray-600">calories</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(totalNutrition.calories / servings)} cal/portion
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(totalNutrition.protein * 10) / 10}g
                  </div>
                  <div className="text-sm text-gray-600">protéines</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(totalNutrition.protein / servings * 10) / 10}g/portion
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(totalNutrition.carbs * 10) / 10}g
                  </div>
                  <div className="text-sm text-gray-600">glucides</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(totalNutrition.carbs / servings * 10) / 10}g/portion
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(totalNutrition.fat * 10) / 10}g
                  </div>
                  <div className="text-sm text-gray-600">lipides</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(totalNutrition.fat / servings * 10) / 10}g/portion
                  </div>
                </div>
              </div>
            </div>
            
            {/* Détail des ingrédients */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Détail des ingrédients</h4>
              <div className="space-y-2">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">
                      {ingredient.food.name} ({ingredient.quantity} {ingredient.unit})
                    </span>
                    <span className="text-gray-600">
                      {ingredient.calculatedNutrition.calories} cal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-xl shadow-lg ${className}`}
    >
      {/* Header avec progress bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialMeal ? 'Modifier le repas' : 'Créer un repas'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LucideX className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center space-x-2 mb-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep 
                  ? 'bg-orange-500 text-white' 
                  : step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-sm text-gray-600">
          Étape {currentStep} sur 3: {
            currentStep === 1 ? 'Ingrédients' : 
            currentStep === 2 ? 'Quantités' : 
            'Résumé'
          }
        </div>
      </div>
      
      {/* Contenu de l'étape */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer avec navigation */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <span>Suivant</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex space-x-3">
              {onSaveAsRecipe && (
                <button
                  onClick={saveAsRecipe}
                  disabled={isSavingRecipe}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSavingRecipe ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      <span>Sauvegarder comme recette</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={completeMeal}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Terminer</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}