import { ExerciseSuggestion } from '@/types/exercise-wizard'

interface CacheEntry {
  data: ExerciseSuggestion[]
  timestamp: number
  exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement'
}

class SuggestionCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private getCacheKey(exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement', userId?: string): string {
    return `${exerciseType}-${userId || 'anonymous'}`
  }

  set(
    exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement', 
    suggestions: ExerciseSuggestion[], 
    userId?: string
  ): void {
    const key = this.getCacheKey(exerciseType, userId)
    this.cache.set(key, {
      data: suggestions,
      timestamp: Date.now(),
      exerciseType
    })

    // Nettoyer les anciennes entrées
    this.cleanup()
  }

  get(exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement', userId?: string): ExerciseSuggestion[] | null {
    const key = this.getCacheKey(exerciseType, userId)
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Vérifier si le cache n'est pas expiré
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(exerciseType?: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement', userId?: string): void {
    if (exerciseType && userId) {
      const key = this.getCacheKey(exerciseType, userId)
      this.cache.delete(key)
    } else {
      // Invalider tout le cache
      this.cache.clear()
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }

  // Méthodes utilitaires
  size(): number {
    return this.cache.size
  }

  getStats(): { totalEntries: number, cacheHits: string[], oldestEntry?: number } {
    const keys = Array.from(this.cache.keys())
    const timestamps = Array.from(this.cache.values()).map(entry => entry.timestamp)
    
    return {
      totalEntries: this.cache.size,
      cacheHits: keys,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined
    }
  }
}

// Instance singleton
export const suggestionCache = new SuggestionCache()

// Hook pour utiliser le cache
export const useSuggestionCache = () => {
  return {
    get: suggestionCache.get.bind(suggestionCache),
    set: suggestionCache.set.bind(suggestionCache),
    invalidate: suggestionCache.invalidate.bind(suggestionCache),
    getStats: suggestionCache.getStats.bind(suggestionCache)
  }
}