import { useMemo, useEffect, useState } from 'react'
import { ExerciseSuggestion, UserPreferences } from '@/types/exercise-wizard'
import { useUserProfile } from '@/hooks/useUserProfile'
import { createClient } from '@/utils/supabase/client'
import { useSuggestionCache } from '@/utils/suggestionCache'

// SUGGESTIONS BASEES SUR LES TEMPLATES DE LA BASE DE DONNEES
const getTemplateBasedSuggestions = async (
  exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement'
): Promise<ExerciseSuggestion[]> => {
  const supabase = createClient()
  
  // Utiliser la fonction RPC pour récupérer templates + exercices persos
  const { data: searchResults, error } = await supabase.rpc('search_exercises_and_templates', {
    search_term: '',
    exercise_type_filter: exerciseType,
    limit_count: 12 // Plus de résultats pour avoir du choix
  })
  
  if (error) {
    console.error('Erreur récupération templates:', error)
    return getFallbackSuggestions(exerciseType) // Fallback en cas d'erreur
  }
  
  // Convertir les résultats en ExerciseSuggestion
  return (searchResults || []).map((result: any) => ({
    id: `${result.source_type}-${result.id}`,
    name: result.name,
    label: result.name,
    type: result.exercise_type as any,
    muscle_group: result.muscle_group,
    equipment: result.equipment_name || 'Machine',
    difficulty: mapDifficultyFromNumber(result.difficulty),
    description: result.description,
    values: generateDefaultValues(result.exercise_type, result.name),
    relevanceScore: result.popularity_score + (result.is_user_created ? 100 : 0), // Prioriser exercices persos
    isTemplate: result.source_type === 'template',
    templateId: result.source_type === 'template' ? result.id : undefined
  }))
}

// Mapper difficulté numérique vers string
const mapDifficultyFromNumber = (difficulty: number): 'Débutant' | 'Intermédiaire' | 'Avancé' => {
  if (difficulty <= 2) return 'Débutant'
  if (difficulty <= 3) return 'Intermédiaire'
  return 'Avancé'
}

// Générer valeurs par défaut selon le type d'exercice
const generateDefaultValues = (exerciseType: string, exerciseName: string) => {
  const name = exerciseName.toLowerCase()
  
  if (exerciseType === 'Musculation') {
    // Valeurs par défaut pour musculation
    if (name.includes('pompes') || name.includes('push')) {
      return { firstReps: '12', sets: 3 }
    }
    if (name.includes('développé') || name.includes('dev') || name.includes('press')) {
      return { firstWeight: '20', firstReps: '10', sets: 3 }
    }
    if (name.includes('squat') || name.includes('leg')) {
      return { firstWeight: '30', firstReps: '12', sets: 3 }
    }
    if (name.includes('curl') || name.includes('extension')) {
      return { firstWeight: '10', firstReps: '12', sets: 3 }
    }
    return { firstWeight: '15', firstReps: '10', sets: 3 } // Défaut musculation
    
  } else if (exerciseType === 'Cardio') {
    if (name.includes('course') || name.includes('run')) {
      return { duration: '30', distance: '5', distanceUnit: 'km', calories: '300' }
    }
    if (name.includes('vélo') || name.includes('bike')) {
      return { duration: '45', distance: '15', distanceUnit: 'km', calories: '400' }
    }
    if (name.includes('rameur') || name.includes('row')) {
      return { duration: '20', distance: '3', distanceUnit: 'km', calories: '200' }
    }
    return { duration: '30', calories: '250' } // Défaut cardio
    
  } else if (exerciseType === 'Fitness') {
    if (name.includes('burpees') || name.includes('hiit')) {
      return { firstReps: '15', sets: 4, duration: '30' }
    }
    if (name.includes('planche') || name.includes('plank')) {
      return { duration: '60', sets: 3 }
    }
    return { firstReps: '12', sets: 3, duration: '45' } // Défaut fitness
    
  } else if (exerciseType === 'Étirement') {
    return { duration: '30', sets: 2 } // Défaut étirement
    
  } else if (exerciseType === 'Échauffement') {
    if (name.includes('marche') || name.includes('walk')) {
      return { duration: '5', minutes: '5' }
    }
    return { duration: '30', sets: 2 } // Défaut échauffement
  }
  
  return {} // Défaut général
}

// Fallback suggestions si la base de données n'est pas accessible
const getFallbackSuggestions = (exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement'): ExerciseSuggestion[] => {
  // Suggestions de base limitées pour fallback uniquement
  if (exerciseType === 'Musculation') {
    return [
      {
        id: 'pompes-fallback',
        name: 'Pompes',
        label: 'Pompes classiques',
        type: 'Musculation',
        muscle_group: 'Pectoraux',
        equipment: 'Poids du corps',
        difficulty: 'Débutant',
        values: { firstReps: '12', sets: 3 },
        relevanceScore: 80
      },
      {
        id: 'squat-fallback',
        name: 'Squat',
        label: 'Squat au poids du corps',
        type: 'Musculation',
        muscle_group: 'Jambes',
        equipment: 'Poids du corps',
        difficulty: 'Débutant',
        values: { firstReps: '15', sets: 3 },
        relevanceScore: 75
      }
    ]
  } else if (exerciseType === 'Cardio') {
    return [
      {
        id: 'course-fallback',
        name: 'Course',
        label: 'Course légère',
        type: 'Cardio',
        muscle_group: 'Cardio',
        equipment: 'Poids du corps',
        difficulty: 'Débutant',
        values: { duration: '20', calories: '200' },
        relevanceScore: 80
      }
    ]
  } else if (exerciseType === 'Fitness') {
    return [
      {
        id: 'burpees-fallback',
        name: 'Burpees',
        label: 'Burpees complets',
        type: 'Fitness',
        muscle_group: 'Corps entier',
        equipment: 'Poids du corps',
        difficulty: 'Intermédiaire',
        values: { firstReps: '10', sets: 3 },
        relevanceScore: 80
      }
    ]
  } else if (exerciseType === 'Étirement') {
    return [
      {
        id: 'etirement-global-fallback',
        name: 'Étirements globaux',
        label: 'Séance d\'étirements',
        type: 'Étirement',
        muscle_group: 'Corps entier',
        equipment: 'Tapis',
        difficulty: 'Débutant',
        values: { duration: '15', sets: 1 },
        relevanceScore: 80
      }
    ]
  } else if (exerciseType === 'Échauffement') {
    return [
      {
        id: 'echauffement-global-fallback',
        name: 'Échauffement global',
        label: 'Échauffement complet',
        type: 'Échauffement',
        muscle_group: 'Corps entier',
        equipment: 'Poids du corps',
        difficulty: 'Débutant',
        values: { duration: '10', sets: 1 },
        relevanceScore: 80
      }
    ]
  }

  return [] // Aucune suggestion par défaut
}

const adaptSuggestionsToUser = (suggestions: ExerciseSuggestion[], userPreferences?: UserPreferences): ExerciseSuggestion[] => {
  if (!userPreferences) return suggestions

  const levelMultiplier = {
    'Débutant': 0.7,
    'Intermédiaire': 1.0,
    'Avancé': 1.3,
    'Expert': 1.6,
    'Élite': 2.0
  }[userPreferences.experience || 'Débutant'] || 0.7

  const goalBonus = {
    'Prise de masse': (suggestion: ExerciseSuggestion) => suggestion.type === 'Musculation' ? 20 : 0,
    'Perte de poids': (suggestion: ExerciseSuggestion) => 
      suggestion.type === 'Cardio' || suggestion.type === 'Fitness' ? 20 : 0,
    'Performance': (suggestion: ExerciseSuggestion) => 
      suggestion.difficulty === 'Avancé' || suggestion.type === 'Fitness' ? 15 : 0,
    'Maintien': (suggestion: ExerciseSuggestion) => 
      suggestion.type === 'Étirement' ? 10 : 5
  }[userPreferences.goal || 'Maintien']

  return suggestions.map(suggestion => {
    const adaptedSuggestion = { ...suggestion }
    
    // Adapter les valeurs selon le niveau
    if (suggestion.values.firstWeight) {
      adaptedSuggestion.values.firstWeight = Math.round(
        Number(suggestion.values.firstWeight) * levelMultiplier
      ).toString()
    }
    
    if (suggestion.values.firstReps) {
      adaptedSuggestion.values.firstReps = Math.round(
        Number(suggestion.values.firstReps) * levelMultiplier
      ).toString()
    }

    if (suggestion.values.duration) {
      adaptedSuggestion.values.duration = Math.round(
        Number(suggestion.values.duration) * levelMultiplier
      ).toString()
    }

    if (suggestion.values.calories) {
      adaptedSuggestion.values.calories = Math.round(
        Number(suggestion.values.calories) * levelMultiplier
      ).toString()
    }

    // Adapter la difficulté selon le niveau utilisateur
    if (userPreferences.experience === 'Débutant' && suggestion.difficulty === 'Avancé') {
      adaptedSuggestion.difficulty = 'Intermédiaire'
    } else if (userPreferences.experience === 'Avancé' && suggestion.difficulty === 'Débutant') {
      adaptedSuggestion.difficulty = 'Intermédiaire'
    }

    // Calculer le score de pertinence
    const baseScore = suggestion.relevanceScore || 50
    const goalScore = goalBonus(suggestion)
    const levelBonus = userPreferences.experience === suggestion.difficulty ? 10 : 0
    
    adaptedSuggestion.relevanceScore = baseScore + goalScore + levelBonus

    return adaptedSuggestion
  })
}

export const useIntelligentSuggestions = (exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement') => {
  const { profile } = useUserProfile()
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | undefined>()
  const cache = useSuggestionCache()
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
      }
      
      // Vérifier le cache d'abord
      const cached = cache.get(exerciseType, user?.id)
      if (cached) {
        setSuggestions(cached)
        setLoading(false)
        return
      }

      try {
        // Récupérer suggestions basées sur les templates
        const templateSuggestions = await getTemplateBasedSuggestions(exerciseType)
        
        // Mapper le profil utilisateur vers les préférences
        const userPreferences: UserPreferences | undefined = profile ? {
          goal: 'Prise de masse' as UserPreferences['goal'],
          experience: 'Intermédiaire' as UserPreferences['experience'],
          frequency: 'Modérée' as UserPreferences['frequency'],
          availability: 60,
          weight: 70,
          height: 175,
          age: 25
        } : undefined

        // Adapter selon le profil utilisateur
        const adaptedSuggestions = adaptSuggestionsToUser(templateSuggestions, userPreferences)
        
        // Trier par score de pertinence et limiter à 8
        const finalSuggestions = adaptedSuggestions
          .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
          .slice(0, 8)
        
        // Mettre en cache le résultat
        cache.set(exerciseType, finalSuggestions, user?.id)
        
        setSuggestions(finalSuggestions)
      } catch (error) {
        console.error('Erreur récupération suggestions:', error)
        // Utiliser fallback en cas d'erreur
        const fallbackSuggestions = getFallbackSuggestions(exerciseType)
        setSuggestions(fallbackSuggestions)
      }
      
      setLoading(false)
    }
    
    fetchSuggestions()
  }, [exerciseType, profile, cache])

  return { suggestions, loading }
}

// Fonction pour créer des variations avancées
function createAdvancedVariation(exerciseName: string, exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement'): ExerciseSuggestion | null {
  const name = exerciseName.toLowerCase()
  
  if (exerciseType === 'Musculation') {
    if (name.includes('pompes')) {
      return {
        id: 'pompes-diamant-advanced',
        name: 'Pompes diamant',
        label: 'Pompes diamant (avancé)',
        type: 'Musculation',
        muscle_group: 'Pectoraux',
        equipment: 'Poids du corps',
        difficulty: 'Avancé',
        values: { firstReps: '12', sets: 3 },
        relevanceScore: 85
      }
    }
    if (name.includes('développé') || name.includes('dev')) {
      return {
        id: 'dev-incline',
        name: 'Développé incliné',
        label: 'Développé incliné (progression)',
        type: 'Musculation',
        muscle_group: 'Pectoraux',
        equipment: 'Haltères + banc',
        difficulty: 'Avancé',
        values: { firstWeight: '20', firstReps: '8', sets: 4 },
        relevanceScore: 85
      }
    }
    if (name.includes('squat')) {
      return {
        id: 'squat-bulgare-advanced',
        name: 'Squat bulgare',
        label: 'Squat bulgare (progression)',
        type: 'Musculation',
        muscle_group: 'Jambes',
        equipment: 'Haltères',
        difficulty: 'Avancé',
        values: { firstWeight: '15', firstReps: '10', sets: 3 },
        relevanceScore: 85
      }
    }
  } else if (exerciseType === 'Cardio') {
    if (name.includes('rameur')) {
      return {
        id: 'rameur-interval',
        name: 'Rameur intervalles',
        label: 'Rameur par intervalles (progression)',
        type: 'Cardio',
        muscle_group: 'Dos',
        equipment: 'Machine',
        difficulty: 'Avancé',
        values: { distance: '3', duration: '15' },
        relevanceScore: 85
      }
    }
    if (name.includes('course')) {
      return {
        id: 'course-fractionne',
        name: 'Course fractionnée',
        label: 'Course fractionnée (progression)',
        type: 'Cardio',
        muscle_group: 'Jambes',
        equipment: 'Aucun',
        difficulty: 'Avancé',
        values: { distance: '5', duration: '25' },
        relevanceScore: 85
      }
    }

  } else if (exerciseType === 'Fitness') {
    if (name.includes('burpees')) {
      return {
        id: 'burpees-box-jump',
        name: 'Burpees + Box Jump',
        label: 'Burpees avec saut sur box (progression)',
        type: 'Fitness',
        muscle_group: 'Corps entier',
        equipment: 'Box de saut',
        difficulty: 'Avancé',
        values: { firstReps: '12', sets: 4 },
        relevanceScore: 85
      }
    }
    if (name.includes('jump') || name.includes('squat')) {
      return {
        id: 'pistol-squats',
        name: 'Pistol Squats',
        label: 'Squats sur une jambe (progression)',
        type: 'Fitness',
        muscle_group: 'Jambes',
        equipment: 'Poids du corps',
        difficulty: 'Avancé',
        values: { firstReps: '8', sets: 3 },
        relevanceScore: 85
      }
    }

  } else if (exerciseType === 'Étirement') {
    if (name.includes('étirement') || name.includes('mobilité')) {
      return {
        id: 'sequence-yoga',
        name: 'Séquence yoga flow',
        label: 'Séquence de mobilité dynamique (progression)',
        type: 'Étirement',
        muscle_group: 'Corps entier',
        equipment: 'Tapis',
        difficulty: 'Intermédiaire',
        values: { duration: '20', sets: 1 },
        relevanceScore: 85
      }
    }
    if (name.includes('dos') || name.includes('colonne')) {
      return {
        id: 'mobilite-thoracique',
        name: 'Mobilité thoracique avancée',
        label: 'Mobilité thoracique avec rotation (progression)',
        type: 'Étirement',
        muscle_group: 'Dos',
        equipment: 'Bâton/Élastique',
        difficulty: 'Intermédiaire',
        values: { firstReps: '15', sets: 2 },
        relevanceScore: 85
      }
    }
  }
  
  return null
}