import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Flame, Dumbbell, Wheat, Droplet } from "lucide-react"

interface NutritionProgressCardsProps {
  todayNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  goals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export function NutritionProgressCards({ todayNutrition, goals }: NutritionProgressCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Calories</h3>
              <p className="text-3xl font-bold text-orange-800 dark:text-orange-500">{Math.round(todayNutrition.calories)}</p>
              <p className="text-sm text-muted-foreground">/ {goals.calories} kcal</p>
            </div>
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={ { width: `${Math.min((todayNutrition.calories / goals.calories) * 100, 100)}%` } }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Protéines</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Math.round(todayNutrition.protein * 10) / 10}</p>
              <p className="text-sm text-muted-foreground">/ {goals.protein}g</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={ { width: `${Math.min((todayNutrition.protein / goals.protein) * 100, 100)}%` } }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Glucides</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{Math.round(todayNutrition.carbs * 10) / 10}</p>
              <p className="text-sm text-muted-foreground">/ {goals.carbs}g</p>
            </div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
              <Wheat className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={ { width: `${Math.min((todayNutrition.carbs / goals.carbs) * 100, 100)}%` } }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-yellow-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Lipides</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{Math.round(todayNutrition.fat * 10) / 10}</p>
              <p className="text-sm text-muted-foreground">/ {goals.fat}g</p>
            </div>
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Droplet className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
              style={ { width: `${Math.min((todayNutrition.fat / goals.fat) * 100, 100)}%` } }
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
