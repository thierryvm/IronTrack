import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles, User, Target } from 'lucide-react'
import { SuggestionCard } from '../components/SuggestionCard'
import { useIntelligentSuggestions } from '../hooks/useIntelligentSuggestions'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ExerciseSuggestion } from '@/types/exercise-wizard'

interface SuggestionsListProps {
  exerciseType: 'Musculation' | 'Cardio'
  onSelectSuggestion: (suggestion: ExerciseSuggestion) => void
  onCreateCustom: () => void
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ 
  exerciseType, 
  onSelectSuggestion, 
  onCreateCustom 
}) => {
  const { profile } = useUserProfile()
  const suggestions = useIntelligentSuggestions(exerciseType)

  const getPersonalizedMessage = () => {
    if (!profile) return "Voici quelques suggestions populaires"
    
    // Le profil utilisateur actuel n'a pas goal/experience, on utilise des messages génériques
    return `Suggestions ${exerciseType === 'Musculation' ? 'de force' : 'cardiovasculaires'} pour toi`
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
            <Sparkles className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Suggestions pour toi
        </h2>
        <p className="text-gray-600 text-lg">
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
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onSelect={() => onSelectSuggestion(suggestion)}
            delay={index * 0.1}
          />
        ))}
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
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl
                     hover:border-orange-400 hover:bg-orange-50 transition-all duration-200
                     flex items-center justify-center gap-3 group"
        >
          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-colors">
            <Plus className="w-6 h-6 text-gray-600 group-hover:text-orange-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-800 transition-colors">
              Créer un exercice personnalisé
            </h3>
            <p className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors">
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