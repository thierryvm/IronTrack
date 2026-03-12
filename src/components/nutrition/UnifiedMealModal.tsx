'use client'

import { useState } from 'react'
import { X, Search, Edit, ChefHat, Trash2, Save } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import SimpleMealBuilder from './SimpleMealBuilder'
import FoodSearchAutocomplete from './FoodSearchAutocomplete'

interface UnifiedMealModalProps {
  isOpen: boolean
  onClose: () => void
  onMealAdded: () => void
  mealType: string
  selectedDate: Date
  userId: string
}

// Fix #34/#36 : types de repas standard
const MEAL_TYPES = [
  { name: 'Petit-déjeuner', icon: '🌅' },
  { name: 'Déjeuner', icon: '☀️' },
  { name: 'Dîner', icon: '🌙' },
  { name: 'Collation', icon: '🍎' },
]

export default function UnifiedMealModal({
  isOpen,
  onClose,
  onMealAdded,
  mealType,
  selectedDate,
  userId
}: UnifiedMealModalProps) {
  const [addMode, setAddMode] = useState<'smart' | 'manual' | 'builder'>('smart')
  // Fix #34/#36 : sélecteur de type quand le modal est ouvert sans type pré-sélectionné
  const [localMealType, setLocalMealType] = useState<string>(mealType)

  const handleClose = () => {
    setAddMode('smart')
    setLocalMealType(mealType)
    onClose()
  }

  const handleMealAdded = () => {
    onMealAdded()
    handleClose()
  }

  // Mettre à jour localMealType quand mealType change (ouverture depuis catégorie spécifique)
  const effectiveMealType = localMealType || mealType

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Overlay avec effet de flou */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        />
        
        {/* Contenu de la modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {effectiveMealType ? `Ajouter un repas — ${effectiveMealType}` : 'Ajouter un repas'}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-safe-muted" />
              </button>
            </div>
            
            {/* Fix #34/#36 : Sélecteur de type de repas si non pré-défini */}
            {!mealType && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de repas <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map(type => (
                    <button
                      key={type.name}
                      onClick={() => setLocalMealType(type.name)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors border ${
                        localMealType === type.name
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-400'
                      }`}
                    >
                      <span className="block text-base mb-1">{type.icon}</span>
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Onglets de sélection du mode */}
            <div className={`flex space-x-1 mt-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ${!mealType && !localMealType ? 'opacity-50 pointer-events-none' : ''}`}>
              <button
                onClick={() => setAddMode('smart')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  addMode === 'smart' 
                    ? 'bg-white dark:bg-gray-900 text-orange-800 dark:text-orange-300 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Search className="h-6 w-6 inline mr-2" />
                Recherche intelligente
              </button>
              <button
                onClick={() => setAddMode('manual')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  addMode === 'manual' 
                    ? 'bg-white dark:bg-gray-900 text-orange-800 dark:text-orange-300 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Edit className="h-6 w-6 inline mr-2" />
                Saisie manuelle
              </button>
              <button
                onClick={() => setAddMode('builder')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  addMode === 'builder' 
                    ? 'bg-white dark:bg-gray-900 text-orange-800 dark:text-orange-300 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <ChefHat className="h-6 w-6 inline mr-2" />
                Créateur de repas
              </button>
            </div>
          </div>

          {/* Contenu basé sur le mode sélectionné */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {addMode === 'smart' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Recherche intelligente</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Trouvez rapidement des aliments avec notre base de données étendue
                  </p>
                </div>
                
                <SimpleMealBuilder
                  mealType={effectiveMealType}
                  selectedDate={selectedDate}
                  userId={userId}
                  onMealAdded={handleMealAdded}
                />
              </div>
            )}

            {addMode === 'manual' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">✏️</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Saisie manuelle</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Entrez manuellement les valeurs nutritionnelles de votre repas
                  </p>
                </div>
                
                <ManualMealForm
                  mealType={effectiveMealType}
                  selectedDate={selectedDate}
                  userId={userId}
                  onMealAdded={handleMealAdded}
                />
              </div>
            )}

            {addMode === 'builder' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">👨‍🍳</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Créateur de repas</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Créez des repas complexes avec plusieurs ingrédients
                  </p>
                </div>
                
                <MultiIngredientMealBuilder
                  mealType={effectiveMealType}
                  selectedDate={selectedDate}
                  userId={userId}
                  onMealAdded={handleMealAdded}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Composant pour la saisie manuelle
function ManualMealForm({
  mealType,
  selectedDate,
  userId,
  onMealAdded
}: {
  mealType: string
  selectedDate: Date
  userId: string
  onMealAdded: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    quantity: '100',
    unit: 'g'
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Fonction de sanitisation sécurisée
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>"&;\\|`${}()\[\]]/g, '')
      .replace(/[^a-zA-Z0-9\s\u00C0-\u017F\-,.']/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 100)
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!form.name.trim()) {
      newErrors.name = 'Le nom du repas est requis'
    }

    const calories = parseFloat(form.calories)
    if (isNaN(calories) || calories <= 0 || calories > 5000) {
      newErrors.calories = 'Les calories doivent être entre 1 et 5000'
    }

    const protein = parseFloat(form.protein)
    if (isNaN(protein) || protein < 0 || protein > 500) {
      newErrors.protein = 'Les protéines doivent être entre 0 et 500g'
    }

    const carbs = parseFloat(form.carbs)
    if (isNaN(carbs) || carbs < 0 || carbs > 500) {
      newErrors.carbs = 'Les glucides doivent être entre 0 et 500g'
    }

    const fat = parseFloat(form.fat)
    if (isNaN(fat) || fat < 0 || fat > 200) {
      newErrors.fat = 'Les lipides doivent être entre 0 et 200g'
    }

    const quantity = parseFloat(form.quantity)
    if (isNaN(quantity) || quantity <= 0 || quantity > 10000) {
      newErrors.quantity = 'La quantité doit être entre 1 et 10000g'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      const supabase = (await import('@/utils/supabase/client')).createClient()
      
      const now = new Date()
      const timeStr = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      const nutritionData = {
        user_id: userId,
        food_name: sanitizeInput(form.name),
        meal_type: mealType,
        calories: parseFloat(form.calories),
        protein: parseFloat(form.protein),
        carbs: parseFloat(form.carbs),
        fat: parseFloat(form.fat),
        date: dateStr,
        time: timeStr
      }

      const { error } = await supabase
        .from('nutrition_logs')
        .insert([nutritionData])

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        return
      }

      onMealAdded()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom du repas *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 ${
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Ex: Salade de poulet"
          maxLength={100}
        />
        {errors.name && <p className="text-safe-error text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantité *
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              min="1"
              max="10000"
            />
            <select
              value={form.unit}
              onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="tasse">tasse</option>
              <option value="cuillère">cuillère</option>
            </select>
          </div>
          {errors.quantity && <p className="text-safe-error text-xs mt-1">{errors.quantity}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Calories *
          </label>
          <input
            type="number"
            value={form.calories}
            onChange={(e) => setForm(prev => ({ ...prev, calories: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 ${
              errors.calories ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            min="1"
            max="5000"
            step="0.1"
          />
          {errors.calories && <p className="text-safe-error text-xs mt-1">{errors.calories}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Protéines (g) *
          </label>
          <input
            type="number"
            value={form.protein}
            onChange={(e) => setForm(prev => ({ ...prev, protein: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 ${
              errors.protein ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            min="0"
            max="500"
            step="0.1"
          />
          {errors.protein && <p className="text-safe-error text-xs mt-1">{errors.protein}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Glucides (g) *
          </label>
          <input
            type="number"
            value={form.carbs}
            onChange={(e) => setForm(prev => ({ ...prev, carbs: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 ${
              errors.carbs ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            min="0"
            max="500"
            step="0.1"
          />
          {errors.carbs && <p className="text-safe-error text-xs mt-1">{errors.carbs}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lipides (g) *
          </label>
          <input
            type="number"
            value={form.fat}
            onChange={(e) => setForm(prev => ({ ...prev, fat: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 ${
              errors.fat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            min="0"
            max="200"
            step="0.1"
          />
          {errors.fat && <p className="text-safe-error text-xs mt-1">{errors.fat}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-gray-700"></div>
              <span>Sauvegarde...</span>
            </>
          ) : (
            <span>Ajouter le repas</span>
          )}
        </button>
      </div>
    </form>
  )
}

// Composant pour créer des repas avec plusieurs ingrédients
function MultiIngredientMealBuilder({
  mealType,
  selectedDate,
  userId,
  onMealAdded
}: {
  mealType: string
  selectedDate: Date
  userId: string
  onMealAdded: () => void
}) {
  const [mealName, setMealName] = useState('')
  const [ingredients, setIngredients] = useState<Array<{
    id: string
    food: { name: string; calories: number; protein: number; carbs: number; fat: number }
    quantity: number
  }>>([])
  const [saving, setSaving] = useState(false)

  // Fonction de sanitisation
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>"&;\\|`${}()\[\]]/g, '')
      .replace(/[^a-zA-Z0-9\s\u00C0-\u017F\-,.']/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 100)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addIngredient = (food: any) => {
    const newIngredient = {
      id: Date.now().toString(),
      food: {
        name: food.name,
        calories: food.calories_per_100g,
        protein: food.protein_per_100g,
        carbs: food.carbs_per_100g,
        fat: food.fat_per_100g
      },
      quantity: 100
    }
    setIngredients(prev => [...prev, newIngredient])
  }

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, quantity: Math.max(1, Math.min(10000, quantity)) } : ing
    ))
  }

  const calculateTotalNutrition = () => {
    return ingredients.reduce((total, ingredient) => {
      const factor = ingredient.quantity / 100
      const calories = ingredient.food.calories || 0
      const protein = ingredient.food.protein || 0
      const carbs = ingredient.food.carbs || 0
      const fat = ingredient.food.fat || 0
      
      return {
        calories: total.calories + (calories * factor),
        protein: total.protein + (protein * factor),
        carbs: total.carbs + (carbs * factor),
        fat: total.fat + (fat * factor)
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!mealName.trim() || ingredients.length === 0) return

    setSaving(true)
    try {
      const supabase = (await import('@/utils/supabase/client')).createClient()
      
      const now = new Date()
      const timeStr = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      const dateStr = selectedDate.toISOString().split('T')[0]
      const totalNutrition = calculateTotalNutrition()
      
      const nutritionData = {
        user_id: userId,
        food_name: sanitizeInput(mealName),
        meal_type: mealType,
        calories: Math.round(totalNutrition.calories),
        protein: Math.round(totalNutrition.protein * 10) / 10,
        carbs: Math.round(totalNutrition.carbs * 10) / 10,
        fat: Math.round(totalNutrition.fat * 10) / 10,
        date: dateStr,
        time: timeStr
      }

      const { error } = await supabase
        .from('nutrition_logs')
        .insert([nutritionData])

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        return
      }

      onMealAdded()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSaving(false)
    }
  }

  const totalNutrition = calculateTotalNutrition()

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom du repas *
          </label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
            placeholder="Ex: Salade mixte"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ajouter des ingrédients
          </label>
          <FoodSearchAutocomplete
            onFoodSelect={addIngredient}
            placeholder="Rechercher un ingrédient..."
          />
        </div>

        {ingredients.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Ingrédients ({ingredients.length})</h4>
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{ingredient.food.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {Math.round((ingredient.food.calories || 0) * ingredient.quantity / 100)} kcal • 
                    P: {Math.round((ingredient.food.protein || 0) * ingredient.quantity / 100 * 10) / 10}g • 
                    G: {Math.round((ingredient.food.carbs || 0) * ingredient.quantity / 100 * 10) / 10}g • 
                    L: {Math.round((ingredient.food.fat || 0) * ingredient.quantity / 100 * 10) / 10}g
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => updateQuantity(ingredient.id, Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-600"
                    min="1"
                    max="10000"
                  />
                  <span className="text-sm text-gray-600 dark:text-safe-muted">g</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient.id)}
                    className="p-1 text-safe-error hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}

            {/* Résumé nutritionnel */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Total nutritionnel</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-700">Calories:</span>
                  <span className="ml-2 font-medium">{Math.round(totalNutrition.calories)} kcal</span>
                </div>
                <div>
                  <span className="text-orange-700">Protéines:</span>
                  <span className="ml-2 font-medium">{Math.round(totalNutrition.protein * 10) / 10}g</span>
                </div>
                <div>
                  <span className="text-orange-700">Glucides:</span>
                  <span className="ml-2 font-medium">{Math.round(totalNutrition.carbs * 10) / 10}g</span>
                </div>
                <div>
                  <span className="text-orange-700">Lipides:</span>
                  <span className="ml-2 font-medium">{Math.round(totalNutrition.fat * 10) / 10}g</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={saving || !mealName.trim() || ingredients.length === 0}
            className="px-6 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-gray-700"></div>
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <Save className="h-6 w-6" />
                <span>Créer le repas</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}