'use client'

import { useState, useEffect } from 'react'
import { Calculator, Scale } from 'lucide-react'
import type { NutritionData } from './FoodSearchAutocomplete'

interface CalculatedNutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface PortionCalculatorProps {
  selectedFood: NutritionData | null
  onNutritionCalculated: (nutrition: CalculatedNutrition) => void
  className?: string
}

const PortionCalculator: React.FC<PortionCalculatorProps> = ({
  selectedFood,
  onNutritionCalculated,
  className = ""
}) => {
  const [portion, setPortion] = useState('100')
  const [calculatedNutrition, setCalculatedNutrition] = useState<CalculatedNutrition>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  })

  // Fonction de validation et sanitisation des entrées numériques
  const sanitizeNumericInput = (value: string): string => {
    // Autoriser seulement les chiffres et un point décimal
    return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
  }

  // Calcul automatique des valeurs nutritionnelles
  useEffect(() => {
    if (!selectedFood || !portion) {
      const emptyNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }
      setCalculatedNutrition(emptyNutrition)
      onNutritionCalculated(emptyNutrition)
      return
    }

    const portionValue = parseFloat(portion)
    
    if (isNaN(portionValue) || portionValue <= 0 || portionValue > 10000) {
      const emptyNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }
      setCalculatedNutrition(emptyNutrition)
      onNutritionCalculated(emptyNutrition)
      return
    }

    // Calculer les valeurs pour la portion spécifiée
    const factor = portionValue / 100
    const calculated = {
      calories: Math.round(selectedFood.calories_per_100g * factor),
      protein: Math.round(selectedFood.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(selectedFood.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(selectedFood.fat_per_100g * factor * 10) / 10
    }

    setCalculatedNutrition(calculated)
    onNutritionCalculated(calculated)
  }, [selectedFood, portion, onNutritionCalculated])

  const handlePortionChange = (value: string) => {
    const sanitized = sanitizeNumericInput(value)
    // Limiter à 5 caractères pour éviter les valeurs trop importantes
    if (sanitized.length <= 5) {
      setPortion(sanitized)
    }
  }

  // Boutons de portions prédéfinies
  const quickPortions = [50, 100, 150, 200, 250]

  if (!selectedFood) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center text-gray-500">
          <Scale className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Sélectionnez un aliment pour calculer la portion</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Informations sur l'aliment sélectionné */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            {selectedFood.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedFood.image_url}
                alt={selectedFood.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <Scale className={`h-6 w-6 text-green-600 ${selectedFood.image_url ? 'hidden' : ''}`} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-green-900">{selectedFood.name}</h3>
            {selectedFood.brand && (
              <p className="text-sm text-green-700">{selectedFood.brand}</p>
            )}
            <p className="text-xs text-green-600 mt-1">
              Valeurs pour 100g : {Math.round(selectedFood.calories_per_100g)} cal, {selectedFood.protein_per_100g}g prot, {selectedFood.carbs_per_100g}g glu, {selectedFood.fat_per_100g}g lip
            </p>
          </div>
        </div>
      </div>

      {/* Calculateur de portion */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Calculator className="h-5 w-5 text-orange-800" />
          <h4 className="font-medium text-gray-900">Calculer la portion</h4>
        </div>

        {/* Input portion */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantité consommée (en grammes)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={portion}
              onChange={(e) => handlePortionChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="100"
              maxLength={5}
            />
            <span className="text-gray-500 text-sm">g</span>
          </div>
        </div>

        {/* Boutons portions rapides */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portions courantes
          </label>
          <div className="flex flex-wrap gap-2">
            {quickPortions.map((amount) => (
              <button
                key={amount}
                onClick={() => setPortion(amount.toString())}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  portion === amount.toString()
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {amount}g
              </button>
            ))}
          </div>
        </div>

        {/* Résultats calculés */}
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <h5 className="font-medium text-orange-900 mb-2">
            Valeurs nutritionnelles pour {portion}g
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-800">
                {calculatedNutrition.calories}
              </div>
              <div className="text-xs text-orange-700">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {calculatedNutrition.protein}g
              </div>
              <div className="text-xs text-blue-700">Protéines</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {calculatedNutrition.carbs}g
              </div>
              <div className="text-xs text-yellow-700">Glucides</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {calculatedNutrition.fat}g
              </div>
              <div className="text-xs text-purple-700">Lipides</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortionCalculator