'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, Package, X } from 'lucide-react'

export interface NutritionData {
  id: string
  name: string
  brand?: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  image_url?: string
  categories?: string
  quantity?: string
}

interface FoodSearchAutocompleteProps {
  onFoodSelect: (food: NutritionData) => void
  placeholder?: string
  className?: string
}

const FoodSearchAutocomplete: React.FC<FoodSearchAutocompleteProps> = ({
  onFoodSelect,
  placeholder = "Rechercher un aliment...",
  className = ""
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NutritionData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction de sanitisation des entrées
  const sanitizeInput = useCallback((input: string): string => {
    return input
      // Supprimer seulement les caractères vraiment dangereux
      .replace(/[<>&"]/g, '')
      // Garder les apostrophes et caractères utiles pour la recherche
      .replace(/[^a-zA-Z0-9\s\u00C0-\u017F\-'.,]/g, '')
      // Normaliser les espaces multiples en espaces simples
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100)
  }, [])

  // Fonction de recherche avec debounce
  const searchFood = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const sanitizedQuery = sanitizeInput(searchQuery)
      
      if (!sanitizedQuery) {
        setResults([])
        setIsOpen(false)
        return
      }

      const response = await fetch(`/api/nutrition/search?q=${encodeURIComponent(sanitizedQuery)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur de recherche')
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data.products || [])
        setIsOpen(true)
        setSelectedIndex(-1)
      } else {
        throw new Error(data.error || 'Erreur de recherche')
      }
    } catch (err) {
      console.error('Erreur recherche nutrition:', err)
      setError(err instanceof Error ? err.message : 'Erreur de recherche')
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [sanitizeInput])

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      searchFood(query)
    }, 800)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, searchFood])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleFoodSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleFoodSelect = (food: NutritionData) => {
    onFoodSelect(food)
    setQuery('') // Vider le champ pour permettre l'ajout d'autres ingrédients
    setIsOpen(false)
    setSelectedIndex(-1)
    setResults([]) // Effacer les résultats
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setError(null)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
    setError(null)
    inputRef.current?.focus()
  }

  const formatNutrientInfo = (food: NutritionData): string => {
    const parts = []
    if (food.calories_per_100g > 0) parts.push(`${Math.round(food.calories_per_100g)} cal`)
    if (food.protein_per_100g > 0) parts.push(`${food.protein_per_100g}g prot`)
    if (food.carbs_per_100g > 0) parts.push(`${food.carbs_per_100g}g glu`)
    if (food.fat_per_100g > 0) parts.push(`${food.fat_per_100g}g lip`)
    return parts.join(' • ')
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Input de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-gray-700 dark:text-gray-300 animate-spin" />
          ) : (
            <Search className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          autoComplete="off"
          spellCheck="false"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 dark:text-gray-300"
          >
            <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="absolute z-10 w-full mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Résultats de recherche */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {results.map((food, index) => (
              <button
                key={`${food.id}-${index}-${food.name}`}
                onClick={() => handleFoodSelect(food)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 focus:outline-none border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  index === selectedIndex ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Image ou icône */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {food.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={food.image_url}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <Package className={`h-6 w-6 text-gray-700 dark:text-gray-300 ${food.image_url ? 'hidden' : ''}`} />
                  </div>

                  {/* Informations produit */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {food.name}
                    </h4>
                    
                    {food.brand && (
                      <p className="text-xs text-gray-600 dark:text-safe-muted truncate mt-1">
                        {food.brand}
                      </p>
                    )}
                    
                    <p className="text-xs text-orange-800 dark:text-orange-300 mt-1">
                      {formatNutrientInfo(food)} (pour 100g)
                    </p>

                    {food.quantity && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        Conditionnement: {food.quantity}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            
            {/* Footer avec attribution OpenFoodFacts */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-safe-muted text-center">
                Données fournies par{' '}
                <a 
                  href="https://world.openfoodfacts.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-800 dark:text-orange-300 hover:underline"
                >
                  Open Food Facts
                </a>
              </p>
            </div>
        </div>
      )}

      {/* Message aucun résultat */}
      {isOpen && !isLoading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-600 dark:text-safe-muted">
          <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">Aucun aliment trouvé pour &quot;{query}&quot;</p>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
            Essayez un terme plus général ou vérifiez l'orthographe
          </p>
        </div>
      )}
    </div>
  )
}

export default FoodSearchAutocomplete