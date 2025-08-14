'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Dumbbell, Target, AlertCircle, CheckCircle, Activity } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { ExercisePhotoUpload } from '@/components/exercises/ExercisePhotoUpload'
import { SecureAttachment } from '@/utils/fileUpload'
import { mapDifficultyFromNumber, mapDifficultyToNumber, difficulties, type DifficultyString } from '@/utils/difficultyMapping'
import { FormField2025 } from '@/components/ui/FormField2025'
import { Input2025 } from '@/components/ui/Input2025'
import { Button2025 } from '@/components/ui/Button2025'
import { Textarea2025 } from '@/components/ui/Textarea2025'
import { AdaptiveMetricsForm } from '@/components/exercises/AdaptiveMetricsForm'
import { validateExerciseClientSide, validateExerciseUpdateData, type ExerciseUpdateData } from '@/utils/exerciseValidation'

interface ExerciseEditForm2025Props {
  exerciseId: string
}

interface ExerciseData {
  name: string
  exercise_type: 'Musculation' | 'Cardio'
  muscle_group: string
  equipment_id: number
  difficulty: DifficultyString
  description?: string
  image_url?: string
  notes?: string // Notes from latest performance (read-only)
}

const muscleGroups = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 
  'Abdominaux', 'Cardio', 'Corps entier', 'Avant-bras', 'Mollets', 'Fessiers'
]

const difficultyColors: Record<DifficultyString, string> = {
  'Débutant': 'bg-green-100 text-green-700 border-green-200',
  'Intermédiaire': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Avancé': 'bg-red-100 text-red-700 border-red-200',
  'Expert': 'bg-purple-100 text-purple-700 border-purple-200',
  'Élite': 'bg-black text-white border-black'
}

export const ExerciseEditForm2025: React.FC<ExerciseEditForm2025Props> = ({ exerciseId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [equipmentOptions, setEquipmentOptions] = useState<{id: number, name: string}[]>([])
  const [exercisePhoto, setExercisePhoto] = useState<SecureAttachment | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(undefined)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // États pour métriques adaptatives (structure simplifiée pour l'UI)
  const [cardioData, setCardioData] = useState({
    distance: 0,
    duration_seconds: 0,
    heart_rate: 0,
    distance_unit: 'km' as const,
    // Métriques spécialisées
    stroke_rate: 0,  // rameur
    watts: 0,        // rameur
    incline: 0,      // tapis
    cadence: 0,      // vélo
    resistance: 1    // vélo
  })
  
  const [strengthData, setStrengthData] = useState({
    weight: 0,
    reps: 0,
    sets: 1,
    rpe: 5,
    rest_seconds: 60
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Récupérer l'exercice
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', exerciseId)
          .single()

        if (exerciseError) {
          console.error('Erreur base de données:', exerciseError)
          if (exerciseError.code === 'PGRST116' || exerciseError.message?.includes('No rows')) {
            // Exercice non trouvé (404)
            toast.error(`Exercice ${exerciseId} non trouvé`)
            router.push('/exercises')
            return
          }
          throw exerciseError
        }

        // Récupérer les notes de la dernière performance
        const { data: latestPerformanceData } = await supabase
          .from('performance_logs')
          .select('notes')
          .eq('exercise_id', exerciseId)
          .order('performed_at', { ascending: false })
          .limit(1)
        
        const latestPerformance = latestPerformanceData?.[0] || null

        // Récupérer les équipements
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name')
          .order('name')

        if (equipmentError) throw equipmentError

        // Format des données
        const formattedExercise: ExerciseData = {
          name: exerciseData.name || '',
          exercise_type: exerciseData.exercise_type || 'Musculation',
          muscle_group: exerciseData.muscle_group || '',
          equipment_id: exerciseData.equipment_id || 1,
          difficulty: typeof exerciseData.difficulty === 'number' 
            ? mapDifficultyFromNumber(exerciseData.difficulty)
            : (exerciseData.difficulty as DifficultyString) || 'Débutant',
          description: exerciseData.description || '',
          image_url: exerciseData.image_url,
          notes: latestPerformance?.notes || ''
        }

        setExercise(formattedExercise)
        setEquipmentOptions(equipmentData || [])
        setCurrentPhotoUrl(exerciseData.image_url)

      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        toast.error('Erreur lors du chargement de l\'exercice')
        router.push('/exercises')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [exerciseId, router])

  const validateForm = (): boolean => {
    if (!exercise) return false

    // Utiliser notre nouvelle validation sécurisée
    const validationResult = validateExerciseClientSide({
      name: exercise.name,
      exercise_type: exercise.exercise_type,
      muscle_group: exercise.muscle_group,
      equipment_id: exercise.equipment_id,
      difficulty: mapDifficultyToNumber(exercise.difficulty),
      description: exercise.description
    })

    setErrors(validationResult.errors)
    return validationResult.isValid
  }

  const handleSave = async () => {
    if (!exercise || !validateForm()) return

    setSaving(true)
    
    try {
      const supabase = createClient()

      // Préparer données avec validation sécurisée côté serveur
      const candidateData: ExerciseUpdateData = {
        name: exercise.name,
        exercise_type: exercise.exercise_type,
        muscle_group: exercise.muscle_group,
        equipment_id: exercise.equipment_id,
        difficulty: mapDifficultyToNumber(exercise.difficulty),
        description: exercise.description || null,
        image_url: exercisePhoto?.url || currentPhotoUrl || null
      }

      // Validation sécurisée complète côté serveur
      const serverValidation = validateExerciseUpdateData(candidateData)
      
      if (!serverValidation.isValid) {
        // Afficher erreurs serveur
        const errorMessages = serverValidation.errors.join(', ')
        toast.error(`Erreurs de validation: ${errorMessages}`)
        return
      }

      // Utiliser données validées (type-safe)
      const updateData = {
        ...serverValidation.data,
        updated_at: new Date().toISOString()
      }

      // Mettre à jour l'exercice avec données sécurisées
      const { error } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', exerciseId)

      if (error) throw error

      toast.success('Exercice mis à jour avec succès')
      router.push('/exercises')

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/exercises')
  }

  const handlePhotoUploaded = (attachment: SecureAttachment) => {
    setExercisePhoto(attachment)
    setCurrentPhotoUrl(attachment.url)
  }

  const handlePhotoRemoved = () => {
    setExercisePhoto(null)
    setCurrentPhotoUrl(undefined)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exercice introuvable</h2>
          <p className="text-gray-600 mb-4">L'exercice demandé n'existe pas ou a été supprimé.</p>
          <Button2025 onClick={() => router.push('/exercises')}>
            Retour aux exercices
          </Button2025>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button2025
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button2025>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Modifier l'exercice
                </h1>
                <p className="text-sm text-gray-500">{exercise.name}</p>
              </div>
            </div>
            
            {/* Header épuré : seulement le titre, les actions sont en bas */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Form Content */}
          <div className="p-6 space-y-6">
            
            {/* Photo Upload Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-800" />
                Photo de l'exercice
              </h3>
              <ExercisePhotoUpload
                currentPhoto={currentPhotoUrl}
                onPhotoUploaded={handlePhotoUploaded}
                onPhotoRemoved={handlePhotoRemoved}
                disabled={saving}
              />
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-orange-800" />
                Informations de base
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField2025
                  label="Nom de l'exercice"
                  required
                  error={errors.name}
                >
                  <Input2025
                    value={exercise.name}
                    onChange={(e) => setExercise({...exercise, name: e.target.value})}
                    placeholder="Ex: Développé couché"
                    isError={!!errors.name}
                  />
                </FormField2025>

                <FormField2025 label="Type d'exercice">
                  <div className="flex gap-3">
                    {(['Musculation', 'Cardio'] as const).map((type) => (
                      <label
                        key={type}
                        className={`
                          flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all
                          ${exercise.exercise_type === type
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          checked={exercise.exercise_type === type}
                          onChange={() => setExercise({...exercise, exercise_type: type})}
                        />
                        <div className="text-center">
                          <div className="font-medium">{type}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </FormField2025>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField2025
                  label="Groupe musculaire"
                  required
                  error={errors.muscle_group}
                >
                  <select
                    value={exercise.muscle_group}
                    onChange={(e) => setExercise({...exercise, muscle_group: e.target.value})}
                    className={`
                      w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors
                      ${errors.muscle_group ? 'border-red-300' : 'border-gray-300'}
                    `}
                  >
                    <option value="">Sélectionner un groupe</option>
                    {muscleGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </FormField2025>

                <FormField2025 label="Équipement">
                  <select
                    value={exercise.equipment_id}
                    onChange={(e) => setExercise({...exercise, equipment_id: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    {equipmentOptions.map((equipment) => (
                      <option key={equipment.id} value={equipment.id}>
                        {equipment.name}
                      </option>
                    ))}
                  </select>
                </FormField2025>
              </div>

              <FormField2025 label="Niveau de difficulté">
                <div className="flex gap-3">
                  {difficulties.map((level) => (
                    <label
                      key={level}
                      className={`
                        flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${exercise.difficulty === level
                          ? difficultyColors[level]
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={exercise.difficulty === level}
                        onChange={() => setExercise({...exercise, difficulty: level as DifficultyString})}
                      />
                      <div className="text-center font-medium">{level}</div>
                    </label>
                  ))}
                </div>
              </FormField2025>

              <FormField2025
                label="Description"
                helpText="Instructions d'exécution, conseils techniques, muscles ciblés..."
              >
                <Textarea2025
                  value={exercise.description || ''}
                  onChange={(e) => setExercise({...exercise, description: e.target.value})}
                  placeholder="Décrivez l'exercice, la technique d'exécution, les muscles travaillés..."
                  autoResize
                  rows={4}
                />
              </FormField2025>

              {/* Notes de performance (lecture seule) */}
              {exercise.notes && (
                <FormField2025
                  label="Notes de la dernière performance"
                  helpText="Ces notes proviennent de votre dernière session. Pour les modifier, éditez la performance directement."
                >
                  <Textarea2025
                    value={exercise.notes}
                    readOnly
                    variant="filled"
                    className="bg-gray-50 text-gray-600 cursor-not-allowed"
                    rows={3}
                  />
                </FormField2025>
              )}

              {/* Section Métriques Spécifiques - Nouveau */}
              {exercise && equipmentOptions.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-800" />
                    Métriques spécifiques à l'exercice
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Configurez les métriques par défaut pour ce type d'exercice. Ces valeurs serviront de base pour les nouvelles performances.
                  </p>
                  <AdaptiveMetricsForm
                    exerciseType={exercise.exercise_type}
                    equipment={equipmentOptions.find(eq => eq.id === exercise.equipment_id)?.name || 'Machine'}
                    exerciseName={exercise.name}
                    cardioData={cardioData}
                    strengthData={strengthData}
                    setCardioData={setCardioData}
                    setStrengthData={setStrengthData}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Alignement correct à droite */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sm:items-center sm:pr-2">
              <Button2025
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                fullWidth
                className="sm:w-auto order-2 sm:order-1"
              >
                Annuler
              </Button2025>
              <Button2025
                onClick={handleSave}
                loading={saving}
                icon={!saving ? <CheckCircle className="h-4 w-4" /> : undefined}
                fullWidth
                className="sm:w-auto order-1 sm:order-2"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button2025>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}