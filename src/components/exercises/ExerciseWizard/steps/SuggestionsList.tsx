import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles, User, Target } from 'lucide-react'
import { SuggestionCard } from '../components/SuggestionCard'
import { useIntelligentSuggestions } from '../hooks/useIntelligentSuggestions'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ExerciseSuggestion } from '@/types/exercise-wizard'

interface SuggestionsListProps {
  exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement'
  onSelectSuggestion: (suggestion: ExerciseSuggestion) => void
  onCreateCustom: () => void
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ 
  exerciseType, 
  onSelectSuggestion, 
  onCreateCustom 
}) => {
  const { profile } = useUserProfile()
  const { suggestions, loading } = useIntelligentSuggestions(exerciseType)

  const getPersonalizedMessage = () => {
    if (!profile) return "Voici quelques suggestions populaires"
    
    // Le profil utilisateur actuel n'a pas goal/experience, on utilise des messages génériques
    const typeMessages = {
      'Musculation': 'de force',
      'Cardio': 'cardiovasculaires', 
      'Fitness': 'de fitness fonctionnel',
      'Étirement': 'de mobilité',
      'Échauffement': 'de préparation'
    }
    return `Suggestions ${typeMessages[exerciseType]} pour toi`
  }

  return (
    <div className="wizard-step max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Sparkles className="w-8 h-8 text-orange-800 dark:text-orange-300" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Suggestions pour toi
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          {getPersonalizedMessage()}
        </p>
      </motion.div>

      {/* Indication de personnalisation */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-6 p-3 bg-green-50 rounded-lg border border-green-200"
        >
          <User className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Suggestions personnalisées selon ton profil
          </span>
          <div className="ml-auto flex items-center gap-2 text-xs text-green-600">
            <span>Connecté en tant que {profile.pseudo || profile.full_name || 'Utilisateur'}</span>
          </div>
        </motion.div>
      )}
      
      <div className="grid gap-4 mb-8">
        {loading ? (
          // Skeleton loading
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onSelect={() => onSelectSuggestion(suggestion)}
              delay={index * 0.1}
            />
          ))
        ) : (
          // Aucune suggestion trouvée
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <Target className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucune suggestion disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Nous n'avons pas trouvé de suggestions pour ce type d'exercice.
            </p>
            <button
              onClick={onCreateCustom}
              className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Créer un exercice personnalisé
            </button>
          </motion.div>
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-t pt-6"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateCustom}
          className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl
                     hover:border-orange-400 hover:bg-orange-50 dark:bg-orange-900/20 transition-all duration-200
                     flex items-center justify-center gap-3 group"
        >
          <div className="p-2 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 rounded-lg group-hover:bg-orange-100 transition-colors">
            <Plus className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-orange-800 dark:text-orange-300" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-800 dark:text-orange-300 transition-colors">
              Créer un exercice personnalisé
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-orange-800 dark:text-orange-300 transition-colors">
              Aucune suggestion ne te convient ? Crée ton propre exercice
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Conseils */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">💡 Conseil</h4>
        </div>
        <p className="text-sm text-blue-700">
          Les suggestions sont adaptées à ton niveau et tes objectifs. 
          Commence par les exercices <strong>recommandés</strong> pour des résultats optimaux.
        </p>
      </motion.div>
    </div>
  )
}