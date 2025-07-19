import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, ArrowLeft, ArrowRight, Target, Save } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { CustomExercise, EquipmentItem, FormFieldProps } from '@/types/exercise-wizard'
import { validateForm } from '@/utils/security'

// Réutilisation des constantes existantes (tous les groupes musculaires)
const muscleGroups = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Quadriceps', 'Abdominaux', 'Fessiers',
  'Avant-bras', 'Mollets', 'Trapèzes', 'Obliques', 'Ischio-jambiers', 'Cardio', 'Full-body'
]

const difficulties = ['Débutant', 'Intermédiaire', 'Avancé']

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
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      />
    )}
  </div>
)

interface CustomFormProps {
  exerciseType: 'Musculation' | 'Cardio'
  onComplete: (exercise: CustomExercise) => void
  onBack: () => void
  onCancel?: () => void
  onCompleteWithoutPerformance?: (exerciseData: CustomExercise) => Promise<void>
  initialData?: CustomExercise
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
    if (initialData) {
      return {
        ...initialData,
        exercise_type: exerciseType // S'assurer que le type correspond
      }
    }
    return {
      name: '',
      exercise_type: exerciseType,
      muscle_group: muscleGroups[0],
      equipment_id: 0,
      difficulty: difficulties[0] as 'Débutant' | 'Intermédiaire' | 'Avancé',
      description: '',
      sets: 3
    }
  })

  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    // Validation côté client
    const validationResult = validateForm({
      name: formData.name,
      exercise_type: formData.exercise_type,
      muscle_group: formData.muscle_group,
      difficulty: formData.difficulty
    }, {
      name: { type: 'text', required: true, minLength: 1, maxLength: 100 },
      exercise_type: { type: 'text', required: true },
      muscle_group: { type: 'text', required: true },
      difficulty: { type: 'text', required: true }
    })

    if (!validationResult.isValid) {
      setErrors(validationResult.errors.map(err => err.message))
      setLoading(false)
      return
    }

    // Validation spécifique
    if (formData.name.length < 2) {
      setErrors(['Le nom doit contenir au moins 2 caractères'])
      setLoading(false)
      return
    }

    if (formData.equipment_id === 0) {
      setErrors(['Veuillez sélectionner un équipement'])
      setLoading(false)
      return
    }

    try {
      onComplete(formData)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800 border-green-300'
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Avancé': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
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
            <Settings className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Personnalise ton exercice
        </h2>
        <p className="text-gray-600 text-lg">
          Crée un exercice {exerciseType.toLowerCase()} adapté à tes besoins
        </p>
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
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Difficulté <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map(difficulty => (
              <button
                key={difficulty}
                type="button"
                onClick={() => setFormData({...formData, difficulty: difficulty as 'Débutant' | 'Intermédiaire' | 'Avancé'})}
                className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                  formData.difficulty === difficulty
                    ? getDifficultyColor(difficulty)
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </motion.div>

        {exerciseType === 'Musculation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FormField
              label="Nombre de séries"
              type="number"
              value={formData.sets || 3}
              onChange={(value) => setFormData({...formData, sets: Number(value)})}
              placeholder="3"
            />
          </motion.div>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 pt-6"
        >
          <button
            type="button"
            onClick={onCancel || onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
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
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Validation...' : 'Continuer'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Validation...' : 'Continuer'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </motion.div>
      </form>

      {/* Conseils */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">💡 Conseil</h4>
        </div>
        <p className="text-sm text-blue-700">
          Choisis un nom descriptif pour ton exercice. La difficulté et le groupe musculaire 
          nous aideront à te proposer des suggestions personnalisées plus tard.
        </p>
      </motion.div>
    </div>
  )
}