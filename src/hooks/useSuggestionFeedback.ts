import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ExerciseSuggestion } from '@/types/exercise-wizard'
import { useAnalytics } from './useAnalytics'

type FeedbackType = 'helpful' | 'not_helpful'

interface FeedbackState {
  [suggestionId: string]: FeedbackType | null
}

export const useSuggestionFeedback = () => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({})
  const [loading, setLoading] = useState<string | null>(null)
  const { trackSuggestionFeedback } = useAnalytics()

  const submitFeedback = async (
    suggestion: ExerciseSuggestion,
    feedbackType: FeedbackType
  ) => {
    try {
      setLoading(suggestion.id)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Vérifier si un feedback existe déjà
      const { data: existingFeedback } = await supabase
        .from('suggestion_feedback')
        .select('id, feedback_type')
        .eq('user_id', user.id)
        .eq('suggestion_id', suggestion.id)
        .maybeSingle()

      if (existingFeedback) {
        // Mettre à jour le feedback existant
        await supabase
          .from('suggestion_feedback')
          .update({ feedback_type: feedbackType })
          .eq('id', existingFeedback.id)
      } else {
        // Créer un nouveau feedback
        await supabase
          .from('suggestion_feedback')
          .insert({
            user_id: user.id,
            suggestion_id: suggestion.id,
            suggestion_name: suggestion.name,
            feedback_type: feedbackType,
            exercise_type: suggestion.type
          })
      }

      // Mettre à jour l'état local
      setFeedbackState(prev => ({
        ...prev,
        [suggestion.id]: feedbackType
      }))

      // Tracker l'événement
      trackSuggestionFeedback(suggestion.id, suggestion.name, feedbackType)

    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error)
    } finally {
      setLoading(null)
    }
  }

  const getFeedback = (suggestionId: string): FeedbackType | null => {
    return feedbackState[suggestionId] || null
  }

  const isLoading = (suggestionId: string): boolean => {
    return loading === suggestionId
  }

  return {
    submitFeedback,
    getFeedback,
    isLoading
  }
}