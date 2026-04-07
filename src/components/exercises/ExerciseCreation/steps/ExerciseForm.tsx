'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Camera, Settings2 } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FormField, STANDARD_INPUT_CLASSES, STANDARD_SELECT_CLASSES, STANDARD_TEXTAREA_CLASSES } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ExercisePhotoUpload } from '@/components/exercises/ExercisePhotoUpload'
import { type DifficultyLevel, type ExerciseCreationData, type ExerciseType } from '@/types/exercise'
import { type SecureAttachment } from '@/utils/fileUpload'
import { createClient } from '@/utils/supabase/client'

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

const difficultyOptions: Array<{ value: DifficultyLevel; label: string }> = [
  { value: 'Débutant', label: 'Débutant' },
  { value: 'Intermédiaire', label: 'Intermédiaire' },
  { value: 'Avancé', label: 'Avancé' },
]

export function ExerciseForm({
  exerciseType,
  initialData,
  onComplete,
  onBack,
}: ExerciseFormProps) {
  const [formData, setFormData] = useState<ExerciseCreationData>({
    name: initialData?.name ?? '',
    exercise_type: exerciseType,
    muscle_group: initialData?.muscle_group ?? '',
    equipment: initialData?.equipment ?? '',
    difficulty: initialData?.difficulty ?? 'Débutant',
    instructions: initialData?.instructions ?? '',
    image_url: initialData?.image_url,
  })
  const [equipment, setEquipment] = useState<EquipmentOption[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroupOption[]>([])
  const [uploadedPhoto, setUploadedPhoto] = useState<SecureAttachment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadOptions = async () => {
      const supabase = createClient()
      setLoadError(null)

      const [{ data: equipmentData, error: equipmentError }, { data: muscleGroupData, error: muscleGroupError }] =
        await Promise.all([
          supabase.from('equipment').select('id, name').order('name'),
          supabase.from('muscle_groups').select('id, name').order('name'),
        ])

      if (equipmentError || muscleGroupError) {
        setLoadError("Impossible de charger toutes les options du formulaire pour le moment.")
        return
      }

      const nextEquipment = equipmentData ?? []
      const nextMuscleGroups = muscleGroupData ?? []

      setEquipment(nextEquipment)
      setMuscleGroups(nextMuscleGroups)

      setFormData((current) => {
        const defaultEquipment =
          current.equipment ||
          nextEquipment.find((item) => item.name === 'Aucun')?.name ||
          nextEquipment[0]?.name ||
          ''

        const defaultMuscleGroup =
          current.muscle_group ||
          (exerciseType === 'Cardio'
            ? nextMuscleGroups.find((item) => item.name === 'Jambes')?.name
            : nextMuscleGroups[0]?.name) ||
          nextMuscleGroups[0]?.name ||
          ''

        return {
          ...current,
          equipment: defaultEquipment,
          muscle_group: defaultMuscleGroup,
        }
      })
    }

    void loadOptions()
  }, [exerciseType])

  const updateField = (field: keyof ExerciseCreationData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      nextErrors.name = "Le nom de l'exercice est obligatoire."
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Le nom doit contenir au moins 2 caractères.'
    }

    if (!formData.muscle_group.trim()) {
      nextErrors.muscle_group = 'Choisis un groupe musculaire principal.'
    }

    if (!formData.equipment.trim()) {
      nextErrors.equipment = 'Choisis un équipement.'
    }

    if ((formData.instructions?.length ?? 0) > 500) {
      nextErrors.instructions = 'Les instructions ne peuvent pas dépasser 500 caractères.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      onComplete({
        ...formData,
        image_url: uploadedPhoto?.url ?? formData.image_url,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden rounded-[32px] border-border/80 bg-card/92 shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
        <CardContent className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,88,12,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_40%)]" />
          </div>

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="mb-4">{exerciseType}</Badge>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                On pose maintenant les bases de l&apos;exercice.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Nom, groupe musculaire, équipement, niveau et visuel éventuel: tout ce qu&apos;il faut
                pour une fiche claire, maintenable et agréable à retrouver.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.08] text-primary">
              <Settings2 className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {loadError ? (
        <Alert variant="destructive" className="rounded-[24px] border-destructive/30 bg-destructive/10 px-5 py-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <Card className="rounded-[32px] border-border/80 bg-card/90">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                label="Nom de l'exercice"
                required
                error={errors.name}
                helpText="Un nom simple et reconnaissable dans ta bibliothèque."
              >
                <Input
                  id="exercise-name"
                  value={formData.name}
                  placeholder={
                    exerciseType === 'Musculation' ? 'Ex: Développé couché haltères' : 'Ex: Course sur tapis'
                  }
                  onChange={(event) => updateField('name', event.target.value)}
                  className={[STANDARD_INPUT_CLASSES, errors.name ? 'border-red-500 focus:ring-red-500' : ''].join(' ')}
                />
              </FormField>

              <FormField
                label="Niveau conseillé"
                helpText="Un repère clair pour filtrer et relire plus vite."
              >
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => updateField('difficulty', value as DifficultyLevel)}
                >
                  <SelectTrigger className={STANDARD_SELECT_CLASSES}>
                    <SelectValue placeholder="Choisir un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                    className={[
                      STANDARD_SELECT_CLASSES,
                      errors.muscle_group ? 'border-red-500 focus:ring-red-500' : '',
                    ].join(' ')}
                  >
                    <SelectValue placeholder="Choisir un groupe musculaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group.id} value={group.name}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Équipement" required error={errors.equipment}>
                <Select
                  value={formData.equipment}
                  onValueChange={(value) => updateField('equipment', value)}
                >
                  <SelectTrigger
                    className={[
                      STANDARD_SELECT_CLASSES,
                      errors.equipment ? 'border-red-500 focus:ring-red-500' : '',
                    ].join(' ')}
                  >
                    <SelectValue placeholder="Choisir un équipement" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField
              label="Instructions"
              error={errors.instructions}
              helpText="Optionnel, mais utile pour standardiser le geste ou rappeler un réglage."
            >
              <Textarea
                value={formData.instructions ?? ''}
                placeholder="Décris l’exécution, les points d’attention ou les réglages utiles."
                rows={5}
                onChange={(event) => updateField('instructions', event.target.value)}
                className={[
                  STANDARD_TEXTAREA_CLASSES,
                  errors.instructions ? 'border-red-500 focus:ring-red-500' : '',
                ].join(' ')}
              />
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {(formData.instructions?.length ?? 0)}/500
                </span>
              </div>
            </FormField>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/80 bg-card/88">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.08] text-primary">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Photo de référence</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Optionnelle, mais très pratique pour reconnaître l&apos;exercice d&apos;un coup d&apos;œil.
                </p>
              </div>
            </div>

            <ExercisePhotoUpload
              onPhotoUploaded={(attachment) => setUploadedPhoto(attachment)}
              onPhotoRemoved={() => setUploadedPhoto(null)}
              currentPhoto={uploadedPhoto?.url ?? formData.image_url}
              disabled={isLoading}
              maxPhotos={1}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-card/84">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-base font-semibold text-foreground">Étape suivante</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Une fois la fiche créée, on te propose d&apos;enregistrer immédiatement une première performance.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionButton type="button" tone="secondary" onClick={onBack} disabled={isLoading}>
                Retour
              </ActionButton>
              <ActionButton type="submit" tone="primary" disabled={isLoading}>
                Continuer vers la performance
              </ActionButton>
            </div>
          </CardContent>
        </Card>
      </motion.form>
    </section>
  )
}
