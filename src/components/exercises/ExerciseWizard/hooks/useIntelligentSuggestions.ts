import { useMemo, useEffect, useState } from 'react'
import { ExerciseSuggestion, UserPreferences } from '@/types/exercise-wizard'
import { useUserProfile } from '@/hooks/useUserProfile'
import { createClient } from '@/utils/supabase/client'
import { useSuggestionCache } from '@/utils/suggestionCache'

// Réutilisation des suggestions existantes du formulaire
const getBaseSuggestions = (exerciseType: 'Musculation' | 'Cardio'): ExerciseSuggestion[] => {
  const suggestions: ExerciseSuggestion[] = []

  if (exerciseType === 'Musculation') {
    // Pectoraux
    suggestions.push({
      id: 'pompes',
      name: 'Pompes',
      label: 'Pompes classiques',
      type: 'Musculation',
      muscle_group: 'Pectoraux',
      equipment: 'Poids du corps',
      difficulty: 'Débutant',
      values: {
        firstReps: '15',
        sets: 3
      },
      relevanceScore: 90
    })

    suggestions.push({
      id: 'dev-couche',
      name: 'Développé couché',
      label: 'Développé couché',
      type: 'Musculation',
      muscle_group: 'Pectoraux',
      equipment: 'Barre + banc',
      difficulty: 'Intermédiaire',
      values: {
        firstWeight: '50',
        firstReps: '10',
        sets: 3
      },
      relevanceScore: 85
    })

    // Dos
    suggestions.push({
      id: 'tractions',
      name: 'Tractions',
      label: 'Tractions',
      type: 'Musculation',
      muscle_group: 'Dos',
      equipment: 'Barre de traction',
      difficulty: 'Intermédiaire',
      values: {
        firstReps: '8',
        sets: 3
      },
      relevanceScore: 80
    })

    // Jambes
    suggestions.push({
      id: 'squat',
      name: 'Squat',
      label: 'Squat',
      type: 'Musculation',
      muscle_group: 'Jambes',
      equipment: 'Barre libre',
      difficulty: 'Intermédiaire',
      values: {
        firstWeight: '60',
        firstReps: '12',
        sets: 3
      },
      relevanceScore: 85
    })

    suggestions.push({
      id: 'fentes',
      name: 'Fentes',
      label: 'Fentes',
      type: 'Musculation',
      muscle_group: 'Jambes',
      equipment: 'Poids du corps',
      difficulty: 'Débutant',
      values: {
        firstReps: '12',
        sets: 3
      },
      relevanceScore: 75
    })

    // Quadriceps spécifiques
    suggestions.push({
      id: 'leg-extension',
      name: 'Extension de jambes',
      label: 'Extension de jambes',
      type: 'Musculation',
      muscle_group: 'Quadriceps',
      equipment: 'Machine',
      difficulty: 'Débutant',
      values: {
        firstWeight: '30',
        firstReps: '15',
        sets: 3
      },
      relevanceScore: 70
    })

    suggestions.push({
      id: 'squat-avant',
      name: 'Squat avant',
      label: 'Squat avant',
      type: 'Musculation',
      muscle_group: 'Quadriceps',
      equipment: 'Barre libre',
      difficulty: 'Avancé',
      values: {
        firstWeight: '40',
        firstReps: '10',
        sets: 3
      },
      relevanceScore: 75
    })

    // Épaules
    suggestions.push({
      id: 'dev-militaire',
      name: 'Développé militaire',
      label: 'Développé militaire',
      type: 'Musculation',
      muscle_group: 'Épaules',
      equipment: 'Barre libre',
      difficulty: 'Intermédiaire',
      values: {
        firstWeight: '30',
        firstReps: '10',
        sets: 3
      },
      relevanceScore: 70
    })

    // Biceps
    suggestions.push({
      id: 'curl-halteres',
      name: 'Curl haltères',
      label: 'Curl haltères',
      type: 'Musculation',
      muscle_group: 'Biceps',
      equipment: 'Haltères',
      difficulty: 'Débutant',
      values: {
        firstWeight: '8',
        firstReps: '12',
        sets: 3
      },
      relevanceScore: 65
    })

    // Triceps
    suggestions.push({
      id: 'dips',
      name: 'Dips',
      label: 'Dips',
      type: 'Musculation',
      muscle_group: 'Triceps',
      equipment: 'Barre de traction',
      difficulty: 'Intermédiaire',
      values: {
        firstReps: '8',
        sets: 3
      },
      relevanceScore: 70
    })

    // Abdominaux
    suggestions.push({
      id: 'crunchs',
      name: 'Crunchs',
      label: 'Crunchs',
      type: 'Musculation',
      muscle_group: 'Abdominaux',
      equipment: 'Poids du corps',
      difficulty: 'Débutant',
      values: {
        firstReps: '20',
        sets: 3
      },
      relevanceScore: 60
    })

    // Fessiers
    suggestions.push({
      id: 'hip-thrust',
      name: 'Hip Thrust',
      label: 'Hip Thrust',
      type: 'Musculation',
      muscle_group: 'Fessiers',
      equipment: 'Barre libre',
      difficulty: 'Intermédiaire',
      values: {
        firstWeight: '40',
        firstReps: '12',
        sets: 3
      },
      relevanceScore: 75
    })

  } else if (exerciseType === 'Cardio') {
    suggestions.push({
      id: 'course',
      name: 'Course',
      label: 'Course 30 minutes',
      type: 'Cardio',
      muscle_group: 'Jambes',
      equipment: 'Poids du corps',
      difficulty: 'Débutant',
      values: {
        duration: '30',
        speed: '10',
        calories: '300'
      },
      relevanceScore: 85
    })

    suggestions.push({
      id: 'velo',
      name: 'Vélo',
      label: 'Vélo 45 minutes',
      type: 'Cardio',
      muscle_group: 'Jambes',
      equipment: 'Machine',
      difficulty: 'Débutant',
      values: {
        duration: '45',
        speed: '20',
        calories: '400'
      },
      relevanceScore: 80
    })

    suggestions.push({
      id: 'burpees',
      name: 'Burpees',
      label: 'Burpees HIIT',
      type: 'Cardio',
      muscle_group: 'Jambes',
      equipment: 'Poids du corps',
      difficulty: 'Intermédiaire',
      values: {
        firstReps: '20',
        sets: 4,
        duration: '15'
      },
      relevanceScore: 75
    })

    suggestions.push({
      id: 'rameur',
      name: 'Rameur',
      label: 'Rameur 2000m',
      type: 'Cardio',
      muscle_group: 'Dos',
      equipment: 'Machine',
      difficulty: 'Intermédiaire',
      values: {
        distance: '2',
        distanceUnit: 'km',
        duration: '8',
        calories: '150'
      },
      relevanceScore: 70
    })
  }

  return suggestions
}

const adaptSuggestionsToUser = (suggestions: ExerciseSuggestion[], userPreferences?: UserPreferences): ExerciseSuggestion[] => {
  if (!userPreferences) return suggestions

  const levelMultiplier = {
    'Débutant': 0.7,
    'Intermédiaire': 1.0,
    'Avancé': 1.3
  }[userPreferences.experience || 'Débutant']

  const goalBonus = {
    'Prise de masse': (suggestion: ExerciseSuggestion) => suggestion.type === 'Musculation' ? 20 : 0,
    'Perte de poids': (suggestion: ExerciseSuggestion) => suggestion.type === 'Cardio' ? 20 : 0,
    'Performance': (suggestion: ExerciseSuggestion) => suggestion.difficulty === 'Avancé' ? 15 : 0,
    'Maintien': () => 5
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

export const useIntelligentSuggestions = (exerciseType: 'Musculation' | 'Cardio') => {
  const { profile } = useUserProfile()
  const [userExercises, setUserExercises] = useState<{name: string, exercise_type: string}[]>([])
  const [userId, setUserId] = useState<string | undefined>()
  const cache = useSuggestionCache()
  
  // Récupérer les exercices existants de l'utilisateur
  useEffect(() => {
    const fetchUserExercises = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('exercises')
          .select('name, exercise_type')
          .eq('user_id', user.id)
        
        if (data) {
          setUserExercises(data)
        }
      }
    }
    
    fetchUserExercises()
  }, [])
  
  const suggestions = useMemo(() => {
    // Vérifier le cache d'abord
    const cached = cache.get(exerciseType, userId)
    if (cached) {
      return cached
    }

    // Mapper le profil utilisateur vers les préférences (utiliser des valeurs par défaut)
    const userPreferences: UserPreferences | undefined = profile ? {
      goal: 'Prise de masse' as UserPreferences['goal'], // Valeur par défaut
      experience: 'Intermédiaire' as UserPreferences['experience'], // Valeur par défaut
      frequency: 'Modérée' as UserPreferences['frequency'], // Valeur par défaut
      availability: 60, // Valeur par défaut
      weight: 70, // Valeur par défaut
      height: 175, // Valeur par défaut
      age: 25 // Valeur par défaut
    } : undefined

    // Obtenir les suggestions de base
    const baseSuggestions = getBaseSuggestions(exerciseType)
    
    // Adapter selon le profil utilisateur
    const adaptedSuggestions = adaptSuggestionsToUser(baseSuggestions, userPreferences)
    
    // Filtrer les exercices déjà créés et proposer des variations plus avancées
    const filteredSuggestions = adaptedSuggestions.filter(suggestion => {
      // Vérifier si l'exercice existe déjà
      const alreadyExists = userExercises.some(ex => 
        ex.name.toLowerCase() === suggestion.name.toLowerCase() && 
        ex.exercise_type === suggestion.type
      )
      
      if (alreadyExists) {
        return false // Filtrer les exercices déjà créés
      }
      
      return true
    })
    
    // Si peu de suggestions restent, ajouter des variations plus avancées
    const finalSuggestions = [...filteredSuggestions]
    
    if (finalSuggestions.length < 4) {
      // Ajouter des variations plus avancées des exercices existants
      userExercises.forEach(userExercise => {
        if (userExercise.exercise_type === exerciseType) {
          const advancedVariation = createAdvancedVariation(userExercise.name, exerciseType)
          if (advancedVariation && !finalSuggestions.some(s => s.name === advancedVariation.name)) {
            finalSuggestions.push(advancedVariation)
          }
        }
      })
    }
    
    // Trier par score de pertinence et limiter à 6
    const result = finalSuggestions
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 6)
    
    // Mettre en cache le résultat
    cache.set(exerciseType, result, userId)
    
    return result
      
  }, [exerciseType, profile, userExercises, userId, cache])

  return suggestions
}

// Fonction pour créer des variations avancées
function createAdvancedVariation(exerciseName: string, exerciseType: 'Musculation' | 'Cardio'): ExerciseSuggestion | null {
  const name = exerciseName.toLowerCase()
  
  if (exerciseType === 'Musculation') {
    if (name.includes('pompes')) {
      return {
        id: 'pompes-diamond',
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
        id: 'squat-bulgarian',
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
        values: { firstDistance: '3', firstDuration: '15' },
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
        values: { firstDistance: '5', firstDuration: '25' },
        relevanceScore: 85
      }
    }
  }
  
  return null
}