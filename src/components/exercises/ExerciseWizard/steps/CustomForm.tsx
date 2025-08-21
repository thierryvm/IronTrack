import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, ArrowLeft, ArrowRight, Target, Save } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { CustomExercise, EquipmentItem, FormFieldProps } from '@/types/exercise-wizard'
import { ExercisePhotoUpload } from '@/components/exercises/ExercisePhotoUpload'
import { ExerciseDuplicateModal } from '@/components/exercises/ExerciseDuplicateModal'
import { SecureAttachment } from '@/utils/fileUpload'
import { detectExerciseDuplicates, DuplicateDetectionResult, ExerciseDuplicate } from '@/utils/exerciseDuplicateDetection'

// Réutilisation des constantes existantes (tous les groupes musculaires)
const muscleGroups = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Quadriceps', 'Abdominaux', 'Fessiers',
  'Avant-bras', 'Mollets', 'Trapèzes', 'Obliques', 'Ischio-jambiers', 'Cardio', 'Full-body'
]

import { difficulties, DifficultyString } from '@/utils/difficultyMapping'

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required, 
  options 
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 transition-colors"
      >
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 transition-colors"
      />
    )}
  </div>
)

interface CustomFormProps {
  exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement'
  onComplete: (exercise: CustomExercise) => void
  onBack: () => void
  onCancel?: () => void
  onCompleteWithoutPerformance?: (exerciseData: CustomExercise) => Promise<void>
  initialData?: Partial<CustomExercise>
  isEditMode?: boolean
}

export const CustomForm: React.FC<CustomFormProps> = ({ 
  exerciseType, 
  onComplete, 
  onBack,
  onCancel,
  onCompleteWithoutPerformance,
  initialData,
  isEditMode = false
}) => {
  const [formData, setFormData] = useState<CustomExercise>(() => {
    const defaultData: CustomExercise = {
      name: '',
      exercise_type: exerciseType,
      muscle_group: muscleGroups[0],
      equipment_id: 0,
      difficulty: difficulties[0] as DifficultyString,
      description: '',
      sets: 3
    }
    
    if (initialData) {
      return {
        ...defaultData,
        ...initialData,
        exercise_type: exerciseType // S'assurer que le type correspond
      }
    }
    
    return defaultData
  })

  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [, setExercisePhoto] = useState<SecureAttachment | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(initialData?.image_url)
  const [duplicateResult, setDuplicateResult] = useState<DuplicateDetectionResult | null>(null)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<CustomExercise | null>(null)

  useEffect(() => {
    const fetchEquipment = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, description')
        .order('name')

      if (!error && data) {
        setEquipmentList(data)
        // Ne pas réinitialiser si initialData est fourni
        if (data.length > 0 && !initialData) {
          setFormData(prev => ({ ...prev, equipment_id: data[0].id }))
        }
      }
    }
    fetchEquipment()
  }, [initialData])

  const handlePhotoUploaded = (attachment: SecureAttachment) => {
    setExercisePhoto(attachment)
    setCurrentPhotoUrl(attachment.url)
    setFormData(prev => ({ ...prev, image_url: attachment.url }))
  }

  const handlePhotoRemoved = () => {
    setExercisePhoto(null)
    setCurrentPhotoUrl(undefined)
    setFormData(prev => ({ ...prev, image_url: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    // Validation minimale - champs requis seulement
    const validateMinimalFields = () => {
      const errors: string[] = []
      
      if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères')
      }
      
      if (!formData.exercise_type) {
        errors.push('Le type d\'exercice est requis')
      }
      
      if (!formData.muscle_group) {
        errors.push('Le groupe musculaire est requis')
      }
      
      if (!formData.difficulty) {
        errors.push('La difficulté est requise')
      }
      
      if (formData.equipment_id === 0) {
        errors.push('Veuillez sélectionner un équipement')
      }
      
      return errors
    }

    // Validation optionnelle - qualité des champs remplis
    const validateOptionalFields = () => {
      const warnings: string[] = []
      
      if (formData.description && formData.description.length > 200) {
        warnings.push('La description est recommandée à moins de 200 caractères')
      }
      
      if (formData.instructions && formData.instructions.length > 500) {
        warnings.push('Les instructions dépassent 500 caractères (limite recommandée)')
      }
      
      return warnings
    }

    const validationErrors = validateMinimalFields()
    const validationWarnings = validateOptionalFields()

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    // Afficher les avertissements mais ne pas bloquer
    if (validationWarnings.length > 0) {
      console.warn('⚠️ Avertissements de validation:', validationWarnings)
      // On continue malgré les avertissements
    }

    try {
      // Détection des doublons (seulement en mode création, pas édition)
      if (!isEditMode) {
        const duplicates = await detectExerciseDuplicates(
          formData.name,
          formData.exercise_type,
          formData.muscle_group
        );

        if (duplicates.isDuplicate) {
          setDuplicateResult(duplicates);
          setPendingFormData(formData);
          setShowDuplicateModal(true);
          setLoading(false);
          return;
        }
      }

      onComplete(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleUseExisting = (exercise: ExerciseDuplicate) => {
    setShowDuplicateModal(false);
    // Rediriger vers l'exercice existant (logique à implémenter selon le contexte)
    console.log('Utiliser exercice existant:', exercise);
  };

  const handleRename = (newName: string) => {
    setFormData(prev => ({ ...prev, name: newName }));
    setShowDuplicateModal(false);
    setDuplicateResult(null);
    setPendingFormData(null);
  };

  const handleCreateAnyway = () => {
    if (pendingFormData) {
      onComplete(pendingFormData);
    }
    setShowDuplicateModal(false);
    setDuplicateResult(null);
    setPendingFormData(null);
  };

  const handleCloseDuplicateModal = () => {
    setShowDuplicateModal(false);
    setDuplicateResult(null);
    setPendingFormData(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800 border-green-300'
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Avancé': return 'bg-red-100 text-red-800 border-red-300'
      case 'Expert': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'Élite': return 'bg-black text-white border-black'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
    }
  }

  // Calcul du score de complétion du profil d'exercice
  const getCompletionScore = () => {
    let score = 60 // Base pour champs requis
    if (formData.description && formData.description.length > 0) score += 20
    if (formData.instructions && formData.instructions.length > 0) score += 15
    if (formData.image_url) score += 5
    return Math.min(score, 100)
  }

  const completionScore = getCompletionScore()
  const getCompletionColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 60) return 'text-orange-800 dark:text-orange-300'
    return 'text-red-600'
  }

  return (
    <div className="wizard-step max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Settings className="w-8 h-8 text-orange-800 dark:text-orange-300" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Personnalise ton exercice
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
          Crée un exercice {exerciseType.toLowerCase()} adapté à tes besoins
        </p>
        
        {/* Indicateur de complétion */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-full border">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <span className={`text-sm font-medium ${getCompletionColor(completionScore)}`}>
            Profil exercice: {completionScore}% complet
          </span>
          {completionScore >= 95 && <span className="text-green-500">✨</span>}
        </div>
      </motion.div>

      {/* Affichage des erreurs */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200"
        >
          <h4 className="font-semibold text-red-800 mb-2">Erreurs de validation :</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            label="Nom de l'exercice"
            type="text"
            value={formData.name}
            onChange={(value) => setFormData({...formData, name: value as string})}
            placeholder="Ex: Développé couché incliné"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FormField
            label="Groupe musculaire"
            type="select"
            value={formData.muscle_group}
            onChange={(value) => setFormData({...formData, muscle_group: value as string})}
            options={muscleGroups.map(group => ({ value: group, label: group }))}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FormField
            label="Équipement"
            type="select"
            value={formData.equipment_id}
            onChange={(value) => setFormData({...formData, equipment_id: Number(value)})}
            options={[
              { value: 0, label: 'Sélectionner un équipement' },
              ...equipmentList.map(eq => ({ value: eq.id, label: eq.name }))
            ]}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Difficulté <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {difficulties.map(difficulty => (
              <button
                key={difficulty}
                type="button"
                onClick={() => setFormData({...formData, difficulty: difficulty as DifficultyString})}
                className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                  formData.difficulty === difficulty
                    ? getDifficultyColor(difficulty)
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </motion.div>

        {exerciseType === 'Musculation' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-2">Valeurs recommandées par défaut</h4>
              
              {/* Première ligne: Poids et Répétitions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Poids recommandé (kg)"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(value) => setFormData({...formData, weight: Number(value)})}
                  placeholder="Ex: 20"
                />
                <FormField
                  label="Répétitions recommandées"
                  type="number"
                  value={formData.reps || ''}
                  onChange={(value) => setFormData({...formData, reps: Number(value)})}
                  placeholder="Ex: 10"
                />
              </div>

              {/* Deuxième ligne: Séries et Repos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Nombre de séries"
                  type="number"
                  value={formData.sets || 3}
                  onChange={(value) => setFormData({...formData, sets: Number(value)})}
                  placeholder="3"
                />
                <FormField
                  label="Temps de repos (min)"
                  type="number"
                  value={formData.rest_time || ''}
                  onChange={(value) => setFormData({...formData, rest_time: Number(value)})}
                  placeholder="Ex: 2"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  Ces valeurs seront suggérées par défaut aux utilisateurs lors de leurs séances.
                </p>
              </div>
            </motion.div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <FormField
            label="Description (optionnel)"
            type="text"
            value={formData.description || ''}
            onChange={(value) => setFormData({...formData, description: value as string})}
            placeholder="Décris brièvement l'exercice..."
          />
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Une courte description aidera à identifier rapidement l'exercice
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Instructions détaillées (optionnel)
            </label>
            <textarea
              value={formData.instructions || ''}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              placeholder="Décris la technique d'exécution, les points clés, les muscles sollicités..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-600 transition-colors resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Ces instructions aideront les utilisateurs à bien exécuter l'exercice</span>
              <span>{(formData.instructions || '').length}/500</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ExercisePhotoUpload
            onPhotoUploaded={handlePhotoUploaded}
            onPhotoRemoved={handlePhotoRemoved}
            currentPhoto={currentPhotoUrl}
            disabled={loading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 pt-6"
        >
          <button
            type="button"
            onClick={onCancel || onBack}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {onCancel ? 'Annuler' : 'Retour'}
          </button>
          {isEditMode && onCompleteWithoutPerformance ? (
            <>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true)
                  try {
                    console.log('📝 Données du formulaire avant sauvegarde:', formData)
                    console.log('📝 Description:', formData.description)
                    console.log('📝 Equipment ID:', formData.equipment_id)
                    await onCompleteWithoutPerformance(formData)
                  } catch (error) {
                    console.error('Erreur:', error)
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Valider les modifications'}
                <Save className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 dark:bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Validation...' : 'Continuer'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 dark:bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Validation...' : 'Continuer'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </motion.div>
      </form>

      {/* Conseils adaptatifs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">💡 Conseil</h4>
        </div>
        
        {completionScore < 80 ? (
          <div className="space-y-2 text-sm text-blue-700">
            <p className="font-medium">🚀 Pour créer un exercice plus complet :</p>
            <ul className="space-y-1 ml-4">
              {!formData.description && (
                <li>• Ajoute une <strong>description</strong> pour faciliter l'identification</li>
              )}
              {!formData.instructions && (
                <li>• Décris la <strong>technique d'exécution</strong> pour aider les utilisateurs</li>
              )}
              {!formData.image_url && (
                <li>• Une <strong>photo</strong> claire améliore la compréhension du mouvement</li>
              )}
            </ul>
            <p className="text-xs italic mt-2">
              Tu pourras aussi compléter ces informations plus tard en modifiant l'exercice !
            </p>
          </div>
        ) : (
          <p className="text-sm text-blue-700">
            ✨ Excellent ! Ton exercice est bien détaillé. Les utilisateurs auront toutes les informations 
            nécessaires pour bien l'exécuter.
          </p>
        )}
      </motion.div>

      {/* Modal de détection des doublons */}
      {duplicateResult && (
        <ExerciseDuplicateModal
          isOpen={showDuplicateModal}
          onClose={handleCloseDuplicateModal}
          duplicateResult={duplicateResult}
          proposedName={formData.name}
          onUseExisting={handleUseExisting}
          onRename={handleRename}
          onCreateAnyway={handleCreateAnyway}
        />
      )}
    </div>
  )
}