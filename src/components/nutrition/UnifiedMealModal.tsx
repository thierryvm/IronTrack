'use client'

import { useState } from 'react'
import { X, Search, Edit, ChefHat, Trash2, Save, Sunrise, Sun, Moon, Apple } from 'lucide-react'
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

const MEAL_TYPES = [
  { name: 'Petit-déjeuner', icon: <Sunrise className="w-6 h-6 mb-1 mx-auto" /> },
  { name: 'Déjeuner', icon: <Sun className="w-6 h-6 mb-1 mx-auto" /> },
  { name: 'Dîner', icon: <Moon className="w-6 h-6 mb-1 mx-auto" /> },
  { name: 'Collation', icon: <Apple className="w-6 h-6 mb-1 mx-auto" /> },
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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {effectiveMealType ? `Ajouter un repas — ${effectiveMealType}` : 'Ajouter un repas'}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {!mealType && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  Type de repas <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map(type => (
                    <button
                      key={type.name}
                      onClick={() => setLocalMealType(type.name)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors border ${
                        localMealType === type.name
                          ? 'bg-primary text-white border-primary'
                          : 'bg-card text-foreground border-border hover:border-orange-400'
                      }`}
                    >
                      <span className="block">{type.icon}</span>
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={`flex space-x-2 mt-4 bg-muted p-1 rounded-lg ${!mealType && !localMealType ? 'opacity-50 pointer-events-none' : ''}`}>
              <button
                onClick={() => setAddMode('smart')}
                className={`flex-1 py-2 px-2 rounded-md text-sm font-medium transition-colors ${
                  addMode === 'smart' 
                    ? 'bg-card text-orange-800 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground dark:text-foreground'
                }`}
              >
                <Search className="h-6 w-6 inline mr-2" />
                Recherche intelligente
              </button>
              <button
                onClick={() => setAddMode('manual')}
                className={`flex-1 py-2 px-2 rounded-md text-sm font-medium transition-colors ${
                  addMode === 'manual' 
                    ? 'bg-card text-orange-800 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground dark:text-foreground'
                }`}
              >
                <Edit className="h-6 w-6 inline mr-2" />
                Saisie manuelle
              </button>
              <button
                onClick={() => setAddMode('builder')}
                className={`flex-1 py-2 px-2 rounded-md text-sm font-medium transition-colors ${
                  addMode === 'builder' 
                    ? 'bg-card text-orange-800 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground dark:text-foreground'
                }`}
              >
                <ChefHat className="h-6 w-6 inline mr-2" />
                Créateur de repas
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 max-h-[calc(90vh-140px)]">
            {addMode === 'smart' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-2"><Search className="h-10 w-10 text-muted-foreground" /></div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Recherche intelligente</h3>
                  <p className="text-muted-foreground text-sm">
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
                  <div className="flex justify-center mb-2"><Edit className="h-10 w-10 text-muted-foreground" /></div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Saisie manuelle</h3>
                  <p className="text-muted-foreground text-sm">
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
                  <div className="flex justify-center mb-2"><ChefHat className="h-10 w-10 text-muted-foreground" /></div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Créateur de repas</h3>
                  <p className="text-muted-foreground text-sm">
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
        <label className="block text-sm font-medium text-foreground mb-1">
          Nom du repas *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
            errors.name ? 'border-red-500' : 'border-border'
          }`}
          placeholder="Ex: Salade de poulet"
          maxLength={100}
        />
        {errors.name && <p className="text-safe-error text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Quantité *
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              className={`flex-1 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.quantity ? 'border-red-500' : 'border-border'
              }`}
              min="1"
              max="10000"
            />
            <select
              value={form.unit}
              onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
              className="px-2 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
          <label className="block text-sm font-medium text-foreground mb-1">
            Calories *
          </label>
          <input
            type="number"
            value={form.calories}
            onChange={(e) => setForm(prev => ({ ...prev, calories: e.target.value }))}
            className={`w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.calories ? 'border-red-500' : 'border-border'
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
          <label className="block text-sm font-medium text-foreground mb-1">
            Protéines (g) *
          </label>
          <input
            type="number"
            value={form.protein}
            onChange={(e) => setForm(prev => ({ ...prev, protein: e.target.value }))}
            className={`w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.protein ? 'border-red-500' : 'border-border'
            }`}
            min="0"
            max="500"
            step="0.1"
          />
          {errors.protein && <p className="text-safe-error text-xs mt-1">{errors.protein}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Glucides (g) *
          </label>
          <input
            type="number"
            value={form.carbs}
            onChange={(e) => setForm(prev => ({ ...prev, carbs: e.target.value }))}
            className={`w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.carbs ? 'border-red-500' : 'border-border'
            }`}
            min="0"
            max="500"
            step="0.1"
          />
          {errors.carbs && <p className="text-safe-error text-xs mt-1">{errors.carbs}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Lipides (g) *
          </label>
          <input
            type="number"
            value={form.fat}
            onChange={(e) => setForm(prev => ({ ...prev, fat: e.target.value }))}
            className={`w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.fat ? 'border-red-500' : 'border-border'
            }`}
            min="0"
            max="200"
            step="0.1"
          />
          {errors.fat && <p className="text-safe-error text-xs mt-1">{errors.fat}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nom du repas *
          </label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="w-full px-2 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Ex: Salade mixte"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Ajouter des ingrédients
          </label>
          <FoodSearchAutocomplete
            onFoodSelect={addIngredient}
            placeholder="Rechercher un ingrédient..."
          />
        </div>

        {ingredients.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Ingrédients ({ingredients.length})</h4>
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{ingredient.food.name}</div>
                  <div className="text-sm text-muted-foreground">
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
                    className="w-20 px-2 py-1 border border-border rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                    min="1"
                    max="10000"
                  />
                  <span className="text-sm text-gray-600">g</span>
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

            <div className="bg-orange-50 p-4 rounded-lg">
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

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="submit"
            disabled={saving || !mealName.trim() || ingredients.length === 0}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
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