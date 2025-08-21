'use client'

import { useState } from 'react'
import { Plus, Save, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import FoodSearchAutocomplete from './FoodSearchAutocomplete'

interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  brand?: string
  categories?: string
}

interface InlineMealFormProps {
  mealType: string
  selectedDate: Date
  userId: string
  onMealAdded: () => void
}

export default function InlineMealForm({
  mealType,
  selectedDate,
  userId,
  onMealAdded
}: InlineMealFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState<number>(100)
  const [saving, setSaving] = useState(false)
  const [mealName, setMealName] = useState('')

  const supabase = createClient()

  // Fonction de sanitisation sécurisée
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>"&;\\|`${}()\[\]]/g, '')
      .replace(/[^a-zA-Z0-9\s\u00C0-\u017F\-,.']/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 100)
  }

  const handleSave = async () => {
    if (!selectedFood || !userId) return

    setSaving(true)
    try {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      // Calculer les valeurs nutritionnelles pour la quantité
      const factor = quantity / 100
      const finalName = sanitizeInput(mealName || selectedFood.name)
      
      const nutritionData = {
        user_id: userId,
        food_name: finalName,
        meal_type: mealType,
        calories: Math.round(selectedFood.calories * factor),
        protein: Math.round(selectedFood.protein * factor * 10) / 10,
        carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
        fat: Math.round(selectedFood.fat * factor * 10) / 10,
        quantity: quantity,
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
      setSelectedFood(null)
      setQuantity(100)
      setMealName('')
      setIsOpen(false)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedFood(null)
    setQuantity(100)
    setMealName('')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-800 dark:text-orange-300 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="h-5 w-5" />
        <span>Ajouter un aliment</span>
      </button>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
      <div className="space-y-4">
        {/* Recherche d'aliment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rechercher un aliment
          </label>
          <FoodSearchAutocomplete
            onFoodSelect={(food) => {
              setSelectedFood({
                id: food.id || '',
                name: food.name,
                calories: food.calories_per_100g,
                protein: food.protein_per_100g,
                carbs: food.carbs_per_100g,
                fat: food.fat_per_100g,
                brand: food.brand
              })
              setMealName(food.name)
            }}
            placeholder="Rechercher un aliment..."
          />
        </div>

        {selectedFood && (
          <>
            {/* Nom personnalisé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du repas (optionnel)
              </label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(sanitizeInput(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 text-sm"
                placeholder={selectedFood.name}
                maxLength={100}
              />
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantité (g)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(10000, Number(e.target.value))))}
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 text-sm"
              />
            </div>

            {/* Aperçu nutritionnel */}
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Valeurs nutritionnelles pour {quantity}g
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-700">Calories:</span>
                  <span className="ml-2 font-medium text-orange-800 dark:text-orange-300">
                    {Math.round(selectedFood.calories * quantity / 100)} kcal
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-700">Protéines:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {Math.round(selectedFood.protein * quantity / 100 * 10) / 10}g
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-700">Glucides:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {Math.round(selectedFood.carbs * quantity / 100 * 10) / 10}g
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-700">Lipides:</span>
                  <span className="ml-2 font-medium text-yellow-600">
                    {Math.round(selectedFood.fat * quantity / 100 * 10) / 10}g
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors text-sm"
          >
            <X className="h-4 w-4 inline mr-1" />
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFood || saving}
            className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-700 mr-1"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}