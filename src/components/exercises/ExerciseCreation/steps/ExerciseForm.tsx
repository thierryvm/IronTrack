'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, AlertCircle } from 'lucide-react'
import { ExerciseType, ExerciseCreationData, DifficultyLevel } from '@/types/exercise'
import { FormField, FormDescription, Input, Select, Textarea, Button } from '@/components/ui/form'
import { createClient } from '@/utils/supabase/client'
import { ExercisePhotoUpload } from '@/components/exercises/ExercisePhotoUpload'
import { SecureAttachment } from '@/utils/fileUpload'

interface EquipmentOption {
  id: number
  name: string
}

interface ExerciseFormProps {
  exerciseType: ExerciseType
  initialData?: ExerciseCreationData
  onComplete: (data: ExerciseCreationData) => void
  onBack: () => void
}

// Groupes musculaires par type d'exercice
const muscleGroupsByType = {
  Musculation: [
    'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 
    'Ischio-jambiers', 'Fessiers', 'Abdominaux', 'Mollets', 'Trapèzes', 'Avant-bras'
  ],
  Cardio: [
    'Cardio', 'Full-body', 'Jambes', 'Bras', 'Core'
  ]
}

const difficultyOptions = [
  { value: 'Débutant', label: 'Débutant' },
  { value: 'Intermédiaire', label: 'Intermédiaire' },  
  { value: 'Avancé', label: 'Avancé' }
]

/**
 * Étape 2: Formulaire de création d'exercice
 * Utilise les composants de formulaire réutilisables avec accessibilité WCAG
 */
export function ExerciseForm({ exerciseType, initialData, onComplete, onBack }: ExerciseFormProps) {
  const [formData, setFormData] = useState<ExerciseCreationData>(() => ({
    name: initialData?.name || '',
    exercise_type: exerciseType,
    muscle_group: initialData?.muscle_group || muscleGroupsByType[exerciseType][0],
    equipment: initialData?.equipment || '',
    difficulty: initialData?.difficulty || 'Débutant',
    instructions: initialData?.instructions || ''
  }))
  
  const [equipment, setEquipment] = useState<EquipmentOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedPhoto, setUploadedPhoto] = useState<SecureAttachment | null>(null)

  // Charger la liste des équipements
  useEffect(() => {
    const loadEquipment = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name')
      
      if (data && !error) {
        setEquipment(data)
        // Sélectionner le premier équipement par défaut si pas déjà défini
        if (!formData.equipment && data.length > 0) {
          setFormData(prev => ({ ...prev, equipment: data[0].name }))
        }
      }
    }
    
    loadEquipment()
  }, [formData.equipment])

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'exercice est obligatoire'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (!formData.equipment) {
      newErrors.equipment = 'L\'équipement est obligatoire'
    }
    
    if (formData.instructions && formData.instructions.length > 500) {
      newErrors.instructions = 'Les instructions ne peuvent pas dépasser 500 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    try {
      // Ajouter l'URL de l'image si uploadée
      const finalData = {
        ...formData,
        image_url: uploadedPhoto?.url
      }
      onComplete(finalData)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mise à jour des champs
  const updateField = (field: keyof ExerciseCreationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const muscleGroups = muscleGroupsByType[exerciseType]
  const equipmentOptions = equipment.map(eq => ({ value: eq.name, label: eq.name }))

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Settings className="w-8 h-8 text-orange-800" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Détails de l'exercice
        </h2>
        <p className="text-gray-600 text-lg">
          Configure les propriétés de ton exercice {exerciseType.toLowerCase()}
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Nom de l'exercice */}
        <FormField>
          <Input
            label="Nom de l'exercice"
            placeholder={exerciseType === 'Musculation' ? 'Ex: Développé couché' : 'Ex: Course sur tapis'}
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
            required
          />
        </FormField>

        {/* Groupe musculaire */}
        <FormField>
          <Select
            label="Groupe musculaire principal"
            value={formData.muscle_group}
            onChange={(e) => updateField('muscle_group', e.target.value)}
            options={muscleGroups.map(group => ({ value: group, label: group }))}
            required
          />
        </FormField>

        {/* Équipement */}
        <FormField>
          <Select
            label="Équipement nécessaire"
            value={formData.equipment}
            onChange={(e) => updateField('equipment', e.target.value)}
            options={equipmentOptions}
            error={errors.equipment}
            placeholder="Sélectionner un équipement"
            required
          />
        </FormField>

        {/* Difficulté */}
        <FormField>
          <Select
            label="Niveau de difficulté"
            value={formData.difficulty}
            onChange={(e) => updateField('difficulty', e.target.value as DifficultyLevel)}
            options={difficultyOptions}
            description="Adapté à quel niveau de pratique ?"
          />
        </FormField>

        {/* Instructions */}
        <FormField>
          <Textarea
            label="Instructions (optionnel)"
            placeholder="Décris comment exécuter correctement cet exercice..."
            value={formData.instructions}
            onChange={(e) => updateField('instructions', e.target.value)}
            error={errors.instructions}
            rows={4}
          />
          <FormDescription>
            {formData.instructions?.length || 0}/500 caractères
          </FormDescription>
        </FormField>

        {/* Upload d'image avec aperçu */}
        <FormField>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Photo de démonstration (optionnel)
            </label>
            
            {/* Aperçu de la photo uploadée */}
            {uploadedPhoto && (
              <div className="relative">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                  <img
                    src={uploadedPhoto.url}
                    alt="Aperçu photo exercice"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
                </div>
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Photo uploadée avec succès</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {uploadedPhoto.originalName} • {Math.round(uploadedPhoto.size / 1024)} KB
                  </p>
                </div>
              </div>
            )}
            
            <ExercisePhotoUpload
              onPhotoUploaded={(attachment) => setUploadedPhoto(attachment)}
              onPhotoRemoved={() => setUploadedPhoto(null)}
              currentPhoto={uploadedPhoto?.url}
              disabled={isLoading}
              maxPhotos={1}
            />
            <FormDescription>
              Ajoute une photo pour illustrer l'exercice (JPG, PNG, HEIC acceptés)
            </FormDescription>
          </div>
        </FormField>

        {/* Boutons d'action */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Retour
          </Button>
          
          <Button
            type="submit"
            loading={isLoading}
            disabled={!formData.name.trim() || !formData.equipment}
          >
            Continuer
          </Button>
        </div>
      </motion.form>

      {/* Info contextuelle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">Bon à savoir</h4>
        </div>
        <p className="text-sm text-blue-700">
          {exerciseType === 'Musculation' 
            ? 'Un exercice de musculation utilise typiquement des poids, répétitions et séries. À l\'étape suivante, tu pourras enregistrer ta première performance.'
            : 'Un exercice cardio se mesure principalement en durée et distance. Tu pourras ensuite ajouter tes métriques spécialisées (SPM, watts, etc.).'
          }
        </p>
      </motion.div>
    </div>
  )
}