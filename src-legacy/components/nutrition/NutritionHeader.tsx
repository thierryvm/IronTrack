import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChefHat, Plus } from "lucide-react"

interface NutritionHeaderProps {
  onOpenRecipeLibrary: () => void
  onOpenMealModal: () => void
}

export function NutritionHeader({ onOpenRecipeLibrary, onOpenMealModal }: NutritionHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold max-sm:text-2xl">Nutrition</h1>
            <p className="text-white/90 max-sm:text-sm">Suis ton alimentation et tes objectifs</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onOpenRecipeLibrary}
              variant="outline"
              className="bg-transparent text-white border-white/20 hover:bg-muted/10"
            >
              <ChefHat className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
              <span>Mes recettes</span>
            </Button>
            <Button
              onClick={onOpenMealModal}
              className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white"
            >
              <Plus className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
              <span>Ajouter un repas</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
