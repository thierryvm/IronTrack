'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { safeJSONStringify } from '@/utils/json'
import { 
  ChefHat, 
  Search, 
  Heart, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Tag, 
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react'

interface RecipeIngredient {
  id: string
  food_name: string
  food_id?: string
  quantity: number
  unit: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

interface Recipe {
  id: string
  name: string
  description?: string
  servings: number
  preparation_time?: number
  cooking_time?: number
  total_time?: number
  difficulty?: 'facile' | 'moyen' | 'difficile'
  tags?: string[]
  instructions?: string
  notes?: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  is_favorite: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  ingredients: RecipeIngredient[]
}

interface RecipeLibraryProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onRecipeSelect?: (recipe: Recipe) => void
  onRecipeEdit?: (recipe: Recipe) => void
  className?: string
}

export default function RecipeLibrary({ 
  isOpen,
  onClose,
  userId,
  onRecipeSelect, 
  onRecipeEdit, 
  className = '' 
}: RecipeLibraryProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'updated_at' | 'total_calories'>('updated_at')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Charger les recettes
  const loadRecipes = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/nutrition/recipes')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des recettes')
      }

      const data = await response.json()
      const recipes = data.recipes || []
      setRecipes(recipes)
      
      // Extraire les tags uniques
      const allTags = recipes.flatMap((recipe: Recipe) => recipe.tags || [])
      setAvailableTags([...new Set(allTags as string[])])
    } catch (err) {
      console.error('Erreur lors du chargement des recettes:', err)
      setError('Impossible de charger les recettes')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Charger les recettes au montage
  useEffect(() => {
    if (isOpen && userId) {
      loadRecipes()
    }
  }, [isOpen, userId, loadRecipes])

  // Filtrer et trier les recettes
  useEffect(() => {
    let filtered = [...recipes]

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filtrer par favoris
    if (showFavoritesOnly) {
      filtered = filtered.filter(recipe => recipe.is_favorite)
    }

    // Filtrer par tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(recipe => 
        selectedTags.every(tag => recipe.tags?.includes(tag))
      )
    }

    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'total_calories':
          return b.total_calories - a.total_calories
        case 'updated_at':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

    setFilteredRecipes(filtered)
  }, [recipes, searchQuery, showFavoritesOnly, selectedTags, sortBy])

  // Basculer favori
  const toggleFavorite = async (recipeId: string) => {
    try {
      const recipe = recipes.find(r => r.id === recipeId)
      if (!recipe) return

      const response = await fetch(`/api/nutrition/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: safeJSONStringify({
          is_favorite: !recipe.is_favorite
        })
      })

      if (response.ok) {
        setRecipes(prev => prev.map(r => 
          r.id === recipeId 
            ? { ...r, is_favorite: !r.is_favorite }
            : r
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du favori:', error)
    }
  }

  // Supprimer une recette
  const deleteRecipe = async (recipeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) return

    try {
      const response = await fetch(`/api/nutrition/recipes/${recipeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRecipes(prev => prev.filter(r => r.id !== recipeId))
        if (selectedRecipe?.id === recipeId) {
          setSelectedRecipe(null)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  // Formater le temps de préparation
  const formatPrepTime = (minutes: number): string => {
    if (minutes === 0) return 'Non défini'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  // Formater la nutrition par portion
  const formatNutritionPerServing = (recipe: Recipe) => {
    const calories = Math.round(recipe.total_calories / recipe.servings)
    const protein = Math.round(recipe.total_protein / recipe.servings * 10) / 10
    const carbs = Math.round(recipe.total_carbs / recipe.servings * 10) / 10
    const fat = Math.round(recipe.total_fat / recipe.servings * 10) / 10
    
    return { calories, protein, carbs, fat }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-orange-800 dark:text-orange-300" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mes Recettes</h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 dark:text-safe-muted">
                {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-700 dark:text-gray-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une recette..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Filtres rapides */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  showFavoritesOnly 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Heart className={`h-5 w-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span>Favoris</span>
              </button>

              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'updated_at' | 'total_calories')}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
              >
                <option value="updated_at">Plus récentes</option>
                <option value="name">Nom A-Z</option>
                <option value="total_calories">Calories (élevées)</option>
              </select>
            </div>

            {/* Tags disponibles */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Tag className="h-5 w-5" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-800 dark:text-orange-300" />
              <span className="ml-3 text-gray-600 dark:text-gray-300">Chargement des recettes...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <AlertTriangle className="h-8 w-8 text-safe-error" />
              <span className="ml-3 text-red-600">{error}</span>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune recette trouvée</h3>
              <p className="text-gray-600 dark:text-safe-muted">
                {searchQuery || selectedTags.length > 0 || showFavoritesOnly
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Créez votre première recette avec le constructeur de repas'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => {
                const nutrition = formatNutritionPerServing(recipe)
                
                return (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                            {recipe.name}
                          </h3>
                          {recipe.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {recipe.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleFavorite(recipe.id)}
                          className={`p-1 rounded-full transition-colors ${
                            recipe.is_favorite 
                              ? 'text-safe-error hover:bg-red-50' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          <Heart className={`h-6 w-6 ${recipe.is_favorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Infos générales */}
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-safe-muted mb-3">
                        <div className="flex items-center space-x-1">
                          <Users className="h-6 w-6" />
                          <span>{recipe.servings} portion{recipe.servings > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-6 w-6" />
                          <span>{formatPrepTime(recipe.preparation_time || 0)}</span>
                        </div>
                      </div>

                      {/* Nutrition par portion */}
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-orange-800 dark:text-orange-300">{nutrition.calories}</div>
                          <div className="text-gray-600 dark:text-safe-muted">cal</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{nutrition.protein}g</div>
                          <div className="text-gray-600 dark:text-safe-muted">prot</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{nutrition.carbs}g</div>
                          <div className="text-gray-600 dark:text-safe-muted">glu</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-yellow-600">{nutrition.fat}g</div>
                          <div className="text-gray-600 dark:text-safe-muted">lip</div>
                        </div>
                      </div>

                      {/* Tags */}
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {recipe.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {recipe.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{recipe.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRecipe(recipe)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => onRecipeEdit?.(recipe)}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => deleteRecipe(recipe.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRecipeSelect?.(recipe)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                          <Plus className="h-6 w-6" />
                          <span>Ajouter au repas</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal de détails de recette */}
        <AnimatePresence>
          {selectedRecipe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedRecipe(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedRecipe.name}</h3>
                      {selectedRecipe.description && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedRecipe.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedRecipe(null)}
                      className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-600 dark:text-safe-muted" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Informations générales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <span className="text-gray-600 dark:text-gray-300">{selectedRecipe.servings} portion{selectedRecipe.servings > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <span className="text-gray-600 dark:text-gray-300">{formatPrepTime(selectedRecipe.preparation_time || 0)}</span>
                    </div>
                  </div>

                  {/* Nutrition totale */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Valeurs nutritionnelles totales</h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-orange-800 dark:text-orange-300">{selectedRecipe.total_calories}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">calories</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{selectedRecipe.total_protein}g</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">protéines</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{selectedRecipe.total_carbs}g</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">glucides</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">{selectedRecipe.total_fat}g</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">lipides</div>
                      </div>
                    </div>
                  </div>

                  {/* Ingrédients */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Ingrédients</h4>
                    <div className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="font-medium">{ingredient.food_name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{ingredient.quantity}{ingredient.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedRecipe(null)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => {
                        onRecipeSelect?.(selectedRecipe)
                        setSelectedRecipe(null)
                      }}
                      className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-6 w-6" />
                      <span>Ajouter au repas</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}