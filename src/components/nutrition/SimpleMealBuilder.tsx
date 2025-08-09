'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
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

interface SimpleMealBuilderProps {
  onMealAdded: () => void
  mealType: string
  selectedDate: Date
  userId: string
}

export default function SimpleMealBuilder({
  onMealAdded,
  mealType,
  selectedDate,
  userId
}: SimpleMealBuilderProps) {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState<number>(100)
  const [unit, setUnit] = useState<string>('g')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

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
      const nutritionData = {
        user_id: userId,
        food_name: selectedFood.name,
        meal_type: mealType,
        calories: Math.round(selectedFood.calories * factor),
        protein: Math.round(selectedFood.protein * factor * 10) / 10,
        carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
        fat: Math.round(selectedFood.fat * factor * 10) / 10,
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

      setSelectedFood(null)
      setQuantity(100)
      setUnit('g')
      onMealAdded()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher un aliment
            </label>
            <FoodSearchAutocomplete
              onFoodSelect={(food) => setSelectedFood({
                id: food.id || '',
                name: food.name,
                calories: food.calories_per_100g,
                protein: food.protein_per_100g,
                carbs: food.carbs_per_100g,
                fat: food.fat_per_100g,
                brand: food.brand
              })}
              placeholder="Rechercher un aliment..."
            />
          </div>

          {selectedFood && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{selectedFood.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="ml-2 font-medium">{selectedFood.calories} kcal</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Protéines:</span>
                    <span className="ml-2 font-medium">{selectedFood.protein}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Glucides:</span>
                    <span className="ml-2 font-medium">{selectedFood.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lipides:</span>
                    <span className="ml-2 font-medium">{selectedFood.fat}g</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="tasse">tasse</option>
                    <option value="cuillère">cuillère</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">
                  Valeurs nutritionnelles pour {quantity}{unit}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-orange-700">Calories:</span>
                    <span className="ml-2 font-medium">{Math.round(selectedFood.calories * quantity / 100)} kcal</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Protéines:</span>
                    <span className="ml-2 font-medium">{Math.round(selectedFood.protein * quantity / 100 * 10) / 10}g</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Glucides:</span>
                    <span className="ml-2 font-medium">{Math.round(selectedFood.carbs * quantity / 100 * 10) / 10}g</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Lipides:</span>
                    <span className="ml-2 font-medium">{Math.round(selectedFood.fat * quantity / 100 * 10) / 10}g</span>
                  </div>
                </div>
              </div>
            </div>
          )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={handleSave}
          disabled={!selectedFood || saving}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Ajouter le repas</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}