'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Settings, AlertCircle } from 'lucide-react'
import { ExerciseType, ExerciseCreationData, DifficultyLevel } from '@/types/exercise'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, STANDARD_INPUT_CLASSES, STANDARD_SELECT_CLASSES, STANDARD_TEXTAREA_CLASSES } from '@/components/ui/form-field'
import { createClient } from '@/utils/supabase/client'
import { ExercisePhotoUpload } from '@/components/exercises/ExercisePhotoUpload'
import { SecureAttachment } from '@/utils/fileUpload'

interface EquipmentOption {
  id: number
  name: string
}

interface MuscleGroupOption {
  id: number
  name: string
}

interface ExerciseFormProps {
  exerciseType: ExerciseType
  initialData?: ExerciseCreationData
  onComplete: (data: ExerciseCreationData) => void
  onBack: () => void
}

// Les groupes musculaires seront chargés depuis la base de données
// Pas de catégories artificielles, seulement les vrais groupes anatomiques

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
    muscle_group: initialData?.muscle_group || '',
    equipment: initialData?.equipment || '',
    difficulty: initialData?.difficulty || 'Débutant',
    instructions: initialData?.instructions || ''
  }))
  
  const [equipment, setEquipment] = useState<EquipmentOption[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroupOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedPhoto, setUploadedPhoto] = useState<SecureAttachment | null>(null)

  // Charger les équipements et groupes musculaires depuis la base de données
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      
      // Charger les équipements
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name')
      
      if (equipmentData && !equipmentError) {
        setEquipment(equipmentData)
        // Sélectionner "Aucun" par défaut
        if (!formData.equipment) {
          setFormData(prev => ({ ...prev, equipment: 'Aucun' }))
        }
      } else {
        console.error('Erreur chargement équipements:', equipmentError)
      }
      
      // Charger les groupes musculaires
      const { data: muscleGroupData, error: muscleGroupError } = await supabase
        .from('muscle_groups')
        .select('id, name')
        .order('name')
      
      if (muscleGroupData && !muscleGroupError) {
        setMuscleGroups(muscleGroupData)
        // Sélectionner "Jambes" par défaut pour Cardio, sinon le premier groupe
        if (!formData.muscle_group) {
          const defaultGroup = exerciseType === 'Cardio' 
            ? muscleGroupData.find(g => g.name === 'Jambes') || muscleGroupData[0]
            : muscleGroupData[0]
          
          if (defaultGroup) {
            setFormData(prev => ({ ...prev, muscle_group: defaultGroup.name }))
          }
        }
      } else {
        console.error('Erreur chargement groupes musculaires:', muscleGroupError)
      }
    }
    
    loadData()
  }, [exerciseType]) // Dépendre uniquement du type d'exercice

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validation nom
    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom de l\'exercice est obligatoire'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    // Validation groupe musculaire
    if (!formData.muscle_group?.trim()) {
      newErrors.muscle_group = 'Le groupe musculaire est obligatoire'
    }
    
    // Validation équipement
    if (!formData.equipment?.trim()) {
      newErrors.equipment = 'L\'équipement est obligatoire'
    }
    
    // Validation instructions (optionnel)
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
            <Settings className="w-8 h-8 text-orange-800 dark:text-orange-300" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Détails de l'exercice
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
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
        <FormField
          label="Nom de l'exercice"
          required
          error={errors.name}
          helpText="Donne un nom unique à ton exercice pour le retrouver facilement"
        >
          <Input
            id="exercise-name"
            placeholder={exerciseType === 'Musculation' ? 'Ex: Développé couché' : 'Ex: Course sur tapis'}
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={`${STANDARD_INPUT_CLASSES} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
        </FormField>

        {/* Groupe musculaire */}
        <FormField
          label="Groupe musculaire principal"
          required
          error={errors.muscle_group}
        >
          <Select
            value={formData.muscle_group}
            onValueChange={(value) => updateField('muscle_group', value)}
          >
            <SelectTrigger 
              className={`${STANDARD_SELECT_CLASSES} ${errors.muscle_group ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            >
              <SelectValue placeholder="Sélectionner un groupe musculaire" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map(group => (
                <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Équipement */}
        <FormField
          label="Équipement nécessaire"
          required
          error={errors.equipment}
        >
          <Select
            value={formData.equipment}
            onValueChange={(value) => updateField('equipment', value)}
          >
            <SelectTrigger className={`${STANDARD_SELECT_CLASSES} ${errors.equipment ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
              <SelectValue placeholder="Sélectionner un équipement" />
            </SelectTrigger>
            <SelectContent>
              {equipmentOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Difficulté */}
        <FormField
          label="Niveau de difficulté"
          helpText="Adapté à quel niveau de pratique ?"
        >
          <Select
            value={formData.difficulty}
            onValueChange={(value) => updateField('difficulty', value as DifficultyLevel)}
          >
            <SelectTrigger className={STANDARD_SELECT_CLASSES}>
              <SelectValue placeholder="Sélectionner un niveau" />
            </SelectTrigger>
            <SelectContent>
              {difficultyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Instructions */}
        <FormField
          label="Instructions (optionnel)"
          error={errors.instructions}
          helpText="Comment exécuter l'exercice en sécurité"
        >
          <Textarea
            placeholder="Décris comment exécuter correctement cet exercice..."
            value={formData.instructions}
            onChange={(e) => updateField('instructions', e.target.value)}
            className={`${STANDARD_TEXTAREA_CLASSES} ${errors.instructions ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            rows={4}
          />
          <div className="flex justify-end mt-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {formData.instructions?.length || 0}/500 caractères
            </span>
          </div>
        </FormField>

        {/* Upload d'image avec aperçu */}
        <FormField
          label="Photo de démonstration (optionnel)"
          helpText="Ajoute une photo pour illustrer l'exercice (JPG, PNG, HEIC acceptés)"
        >
          
          {/* Aperçu de la photo uploadée */}
          {uploadedPhoto && (
            <div className="relative">
              <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-green-200 dark:border-green-800">
                <Image
                  src={uploadedPhoto.url}
                  alt="Aperçu photo exercice"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 384px"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
              </div>
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <div className="w-4 h-4 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-full"></div>
                  </div>
                  <span>Photo uploadée avec succès</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
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