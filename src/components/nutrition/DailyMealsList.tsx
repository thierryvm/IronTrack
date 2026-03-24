import * as React from "react"
import { Calendar, Plus, Trash2, Sunrise, Sun, Moon, Apple, Soup } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Meal {
  id: number
  food_name: string
  meal_type: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  date: string
}

interface DailyMealsListProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  todayMeals: Meal[]
  onOpenMealModal: (type: string) => void
  onDeleteMeal: (id: number) => void
}

const mealTypesConfig = [
  { name: 'Petit-déjeuner', icon: Sunrise },
  { name: 'Déjeuner', icon: Sun },
  { name: 'Dîner', icon: Moon },
  { name: 'Collation', icon: Apple },
  { name: 'Souper', icon: Soup }
]

export function DailyMealsList({
  selectedDate,
  setSelectedDate,
  todayMeals,
  onOpenMealModal,
  onDeleteMeal
}: DailyMealsListProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-foreground">Repas du jour</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <Label htmlFor="nutrition-date" className="sr-only">
              Sélectionner la date
            </Label>
            <Input
              id="nutrition-date"
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="text-sm w-auto focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium gap-2">
            <Calendar className="h-4 w-4" />
            Aujourd'hui
          </Badge>
          <span className="text-sm text-muted-foreground">{todayMeals.length} repas enregistrés</span>
        </div>
      </div>

      <div className="space-y-4">
        {mealTypesConfig.map(mealType => {
          const Icon = mealType.icon
          const mealsOfType = todayMeals.filter(m => m.meal_type === mealType.name)
          const totalCalories = Math.round(mealsOfType.reduce((acc, m) => acc + m.calories, 0))

          return (
            <div key={mealType.name} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Icon className="w-6 h-6 text-foreground" />
                    <div>
                      <h3 className="font-semibold text-foreground">{mealType.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {mealsOfType.length} repas • {totalCalories} kcal
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => onOpenMealModal(mealType.name)}
                    className="h-10 px-4"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="p-4">
                {mealsOfType.length > 0 ? (
                  <div className="space-y-2">
                    {mealsOfType.map(meal => (
                      <div key={meal.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-border/80 transition-colors group">
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{meal.food_name}</div>
                          <div className="text-sm text-muted-foreground">{meal.time}</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium text-orange-500">{Math.round(meal.calories)} kcal</div>
                            <div className="text-xs text-muted-foreground">
                              P: {Math.round(meal.protein * 10) / 10}g • 
                              G: {Math.round(meal.carbs * 10) / 10}g • 
                              L: {Math.round(meal.fat * 10) / 10}g
                            </div>
                          </div>
                          <Button
                            onClick={() => onDeleteMeal(meal.id)}
                            variant="destructive"
                            size="sm"
                            className="p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer ce repas"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                    <Icon className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Aucun repas pour {mealType.name.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
