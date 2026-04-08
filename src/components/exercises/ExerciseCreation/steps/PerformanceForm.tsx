'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, SkipForward, Target, TimerReset, Trophy } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FormField, STANDARD_INPUT_CLASSES, STANDARD_SELECT_CLASSES, STANDARD_TEXTAREA_CLASSES } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type CardioMetrics, type CyclingMetrics, type RowingMetrics, type RunningMetrics, type StrengthMetrics } from '@/types/performance'
import { type ExerciseCreationData, type ExerciseType } from '@/types/exercise'
import { validateCardioMetrics, validateDuration, validatePositiveFloat, validatePositiveInteger } from '@/utils/inputValidation'

export interface PerformanceSubmission {
  metrics: StrengthMetrics | CardioMetrics
  notes?: string
}

interface PerformanceFormProps {
  exerciseType: ExerciseType
  exerciseData: ExerciseCreationData
  onComplete: (performanceData?: PerformanceSubmission) => Promise<void>
  onBack: () => void
  onSkip: () => Promise<void>
}

function getEquipmentType(equipment: string): 'rowing' | 'running' | 'cycling' | null {
  const normalized = equipment.toLowerCase()

  if (
    normalized.includes('rameur') ||
    normalized.includes('rowing') ||
    normalized.includes('aviron')
  ) {
    return 'rowing'
  }

  if (
    normalized.includes('tapis') ||
    normalized.includes('course') ||
    normalized.includes('running') ||
    normalized.includes('treadmill') ||
    normalized.includes('marche') ||
    normalized.includes('jogging')
  ) {
    return 'running'
  }

  if (
    normalized.includes('vélo') ||
    normalized.includes('bike') ||
    normalized.includes('cycling') ||
    normalized.includes('cyclisme') ||
    normalized.includes('spinning')
  ) {
    return 'cycling'
  }

  return null
}

function parseInteger(value: string) {
  return value === '' ? undefined : Number.parseInt(value, 10)
}

function parseFloatValue(value: string) {
  return value === '' ? undefined : Number.parseFloat(value)
}

export function PerformanceForm({
  exerciseType,
  exerciseData,
  onComplete,
  onBack,
  onSkip,
}: PerformanceFormProps) {
  const [strengthData, setStrengthData] = useState<StrengthMetrics>({
    weight: 0,
    reps: 0,
    sets: 0,
    rest_seconds: 60,
    rpe: undefined,
  })
  const [cardioData, setCardioData] = useState<CardioMetrics>({
    duration_seconds: 0,
    distance: undefined,
    distance_unit: exerciseData.equipment.toLowerCase().includes('rameur') ? 'm' : 'km',
    heart_rate: undefined,
    calories: undefined,
    rowing: undefined,
    running: undefined,
    cycling: undefined,
  })
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const equipmentType = useMemo(() => getEquipmentType(exerciseData.equipment), [exerciseData.equipment])
  const durationMinutes = Math.floor(cardioData.duration_seconds / 60)
  const durationSeconds = cardioData.duration_seconds % 60

  const updateDuration = (minutes: number, seconds: number) => {
    setCardioData((current) => ({
      ...current,
      duration_seconds: Math.max(0, minutes * 60 + seconds),
    }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (exerciseType === 'Musculation') {
      const weightResult = validatePositiveFloat(strengthData.weight, 0.5, 1000)
      const repsResult = validatePositiveInteger(strengthData.reps, 1, 200)
      const setsResult = validatePositiveInteger(strengthData.sets, 1, 50)

      if (!weightResult.isValid) nextErrors.weight = weightResult.error ?? 'Valeur invalide'
      if (!repsResult.isValid) nextErrors.reps = repsResult.error ?? 'Valeur invalide'
      if (!setsResult.isValid) nextErrors.sets = setsResult.error ?? 'Valeur invalide'

      if (strengthData.rest_seconds !== undefined) {
        const restResult = validatePositiveInteger(strengthData.rest_seconds, 5, 600)
        if (!restResult.isValid) nextErrors.rest_seconds = restResult.error ?? 'Valeur invalide'
      }
    } else {
      const durationResult = validateDuration(durationMinutes, durationSeconds)
      if (!durationResult.isValid) {
        nextErrors.duration = durationResult.error ?? 'Durée invalide'
      }

      if (cardioData.distance !== undefined && cardioData.distance !== 0) {
        const distanceResult = validatePositiveFloat(cardioData.distance, 0.1, 1000)
        if (!distanceResult.isValid) nextErrors.distance = distanceResult.error ?? 'Distance invalide'
      }

      if (cardioData.heart_rate !== undefined) {
        const heartRateResult = validatePositiveInteger(cardioData.heart_rate, 60, 220)
        if (!heartRateResult.isValid) {
          nextErrors.heart_rate = heartRateResult.error ?? 'Fréquence cardiaque invalide'
        }
      }

      if (cardioData.calories !== undefined) {
        const caloriesResult = validatePositiveInteger(cardioData.calories, 1, 2000)
        if (!caloriesResult.isValid) nextErrors.calories = caloriesResult.error ?? 'Calories invalides'
      }

      const specializedMetrics =
        equipmentType === 'rowing'
          ? cardioData.rowing
          : equipmentType === 'running'
            ? cardioData.running
            : equipmentType === 'cycling'
              ? cardioData.cycling
              : undefined

      if (equipmentType && specializedMetrics) {
        const specializedResult = validateCardioMetrics(
          equipmentType,
          specializedMetrics as Record<string, unknown>,
        )

        if (!specializedResult.isValid) {
          nextErrors.cardio_metrics = specializedResult.error ?? 'Métriques invalides'
        }
      }
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
      await onComplete({
        metrics: exerciseType === 'Musculation' ? strengthData : cardioData,
        notes: notes.trim() || undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)

    try {
      await onSkip()
    } finally {
      setIsLoading(false)
    }
  }

  const updateRowing = (values: Partial<RowingMetrics>) => {
    setCardioData((current) => ({
      ...current,
      rowing: {
        ...(current.rowing ?? { stroke_rate: 0, watts: 0 }),
        ...values,
      },
    }))
  }

  const updateRunning = (values: Partial<RunningMetrics>) => {
    setCardioData((current) => ({
      ...current,
      running: {
        ...current.running,
        ...values,
      },
    }))
  }

  const updateCycling = (values: Partial<CyclingMetrics>) => {
    setCardioData((current) => ({
      ...current,
      cycling: {
        ...(current.cycling ?? { cadence: 0, resistance: 1 }),
        ...values,
      },
    }))
  }

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden rounded-[32px] border-border/80 bg-card/92 shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
        <CardContent className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,88,12,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_40%)]" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="mb-4">Première perf</Badge>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                Donne-lui un vrai point de départ.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Cette première performance servira de repère pour la progression. Tu peux aussi
                passer cette étape et revenir plus tard.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.08] text-primary">
              <Trophy className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {errors.cardio_metrics ? (
        <Alert variant="destructive" className="rounded-[24px] border-destructive/30 bg-destructive/10 px-5 py-4">
          <Activity className="h-4 w-4" />
          <AlertDescription>{errors.cardio_metrics}</AlertDescription>
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
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{exerciseData.name}</Badge>
              <Badge variant="outline">{exerciseData.equipment}</Badge>
              <Badge variant="outline">{exerciseType}</Badge>
            </div>

            {exerciseType === 'Musculation' ? (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  <FormField label="Poids (kg)" required error={errors.weight}>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={strengthData.weight || ''}
                      placeholder="20"
                      onChange={(event) =>
                        setStrengthData((current) => ({
                          ...current,
                          weight: Number.parseFloat(event.target.value) || 0,
                        }))
                      }
                      className={[STANDARD_INPUT_CLASSES, errors.weight ? 'border-red-500 focus:ring-red-500' : ''].join(' ')}
                    />
                  </FormField>

                  <FormField label="Répétitions" required error={errors.reps}>
                    <Input
                      type="number"
                      min="1"
                      value={strengthData.reps || ''}
                      placeholder="10"
                      onChange={(event) =>
                        setStrengthData((current) => ({
                          ...current,
                          reps: Number.parseInt(event.target.value, 10) || 0,
                        }))
                      }
                      className={[STANDARD_INPUT_CLASSES, errors.reps ? 'border-red-500 focus:ring-red-500' : ''].join(' ')}
                    />
                  </FormField>

                  <FormField label="Séries" required error={errors.sets}>
                    <Input
                      type="number"
                      min="1"
                      value={strengthData.sets || ''}
                      placeholder="3"
                      onChange={(event) =>
                        setStrengthData((current) => ({
                          ...current,
                          sets: Number.parseInt(event.target.value, 10) || 0,
                        }))
                      }
                      className={[STANDARD_INPUT_CLASSES, errors.sets ? 'border-red-500 focus:ring-red-500' : ''].join(' ')}
                    />
                  </FormField>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    label="Repos entre séries (sec)"
                    error={errors.rest_seconds}
                    helpText="Utile pour rejouer le même rythme de travail."
                  >
                    <Input
                      type="number"
                      min="5"
                      value={strengthData.rest_seconds ?? ''}
                      placeholder="60"
                      onChange={(event) =>
                        setStrengthData((current) => ({
                          ...current,
                          rest_seconds: Number.parseInt(event.target.value, 10) || 60,
                        }))
                      }
                      className={[
                        STANDARD_INPUT_CLASSES,
                        errors.rest_seconds ? 'border-red-500 focus:ring-red-500' : '',
                      ].join(' ')}
                    />
                  </FormField>

                  <FormField
                    label="RPE"
                    helpText="Ressenti de l’effort sur 10, optionnel mais très utile pour progresser."
                  >
                    <Select
                      value={strengthData.rpe?.toString() ?? 'undefined'}
                      onValueChange={(value) =>
                        setStrengthData((current) => ({
                          ...current,
                          rpe: value === 'undefined' ? undefined : Number.parseInt(value, 10),
                        }))
                      }
                    >
                      <SelectTrigger className={STANDARD_SELECT_CLASSES}>
                        <SelectValue placeholder="Non défini" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="undefined">Non défini</SelectItem>
                        {Array.from({ length: 10 }, (_, index) => (
                          <SelectItem key={index + 1} value={(index + 1).toString()}>
                            {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField label="Durée" required error={errors.duration}>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        min="0"
                        value={durationMinutes || ''}
                        placeholder="Min"
                        onChange={(event) =>
                          updateDuration(Number.parseInt(event.target.value, 10) || 0, durationSeconds)
                        }
                        className={[
                          STANDARD_INPUT_CLASSES,
                          errors.duration ? 'border-red-500 focus:ring-red-500' : '',
                        ].join(' ')}
                      />
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={durationSeconds || ''}
                        placeholder="Sec"
                        onChange={(event) =>
                          updateDuration(durationMinutes, Number.parseInt(event.target.value, 10) || 0)
                        }
                        className={[
                          STANDARD_INPUT_CLASSES,
                          errors.duration ? 'border-red-500 focus:ring-red-500' : '',
                        ].join(' ')}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Distance"
                    error={errors.distance}
                    helpText="Optionnelle si tu suis surtout le temps ou l’intensité."
                  >
                    <div className="grid grid-cols-[1fr_120px] gap-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={cardioData.distance ?? ''}
                        placeholder={cardioData.distance_unit === 'm' ? '500' : '5'}
                        onChange={(event) =>
                          setCardioData((current) => ({
                            ...current,
                            distance: parseFloatValue(event.target.value),
                          }))
                        }
                        className={[
                          STANDARD_INPUT_CLASSES,
                          errors.distance ? 'border-red-500 focus:ring-red-500' : '',
                        ].join(' ')}
                      />
                      <Select
                        value={cardioData.distance_unit}
                        onValueChange={(value) =>
                          setCardioData((current) => ({
                            ...current,
                            distance_unit: value as CardioMetrics['distance_unit'],
                          }))
                        }
                      >
                        <SelectTrigger className={STANDARD_SELECT_CLASSES}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">km</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="miles">miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormField>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField label="Fréquence cardiaque (BPM)" error={errors.heart_rate}>
                    <Input
                      type="number"
                      min="60"
                      max="220"
                      value={cardioData.heart_rate ?? ''}
                      placeholder="145"
                      onChange={(event) =>
                        setCardioData((current) => ({
                          ...current,
                          heart_rate: parseInteger(event.target.value),
                        }))
                      }
                      className={[
                        STANDARD_INPUT_CLASSES,
                        errors.heart_rate ? 'border-red-500 focus:ring-red-500' : '',
                      ].join(' ')}
                    />
                  </FormField>

                  <FormField label="Calories brûlées" error={errors.calories}>
                    <Input
                      type="number"
                      min="0"
                      value={cardioData.calories ?? ''}
                      placeholder="320"
                      onChange={(event) =>
                        setCardioData((current) => ({
                          ...current,
                          calories: parseInteger(event.target.value),
                        }))
                      }
                      className={[
                        STANDARD_INPUT_CLASSES,
                        errors.calories ? 'border-red-500 focus:ring-red-500' : '',
                      ].join(' ')}
                    />
                  </FormField>
                </div>

                {equipmentType === 'rowing' ? (
                  <Card className="rounded-[24px] border-primary/12 bg-primary/[0.05] shadow-none">
                    <CardContent className="space-y-5 p-5">
                      <div>
                        <h3 className="font-semibold text-foreground">Métriques rameur</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Cadence et puissance donnent un très bon repère de qualité d&apos;effort.
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <FormField label="Cadence (SPM)">
                          <Input
                            type="number"
                            min="16"
                            max="36"
                            value={cardioData.rowing?.stroke_rate ?? ''}
                            placeholder="24"
                            onChange={(event) =>
                              updateRowing({ stroke_rate: parseInteger(event.target.value) })
                            }
                            className={STANDARD_INPUT_CLASSES}
                          />
                        </FormField>

                        <FormField label="Puissance (watts)">
                          <Input
                            type="number"
                            min="50"
                            max="500"
                            value={cardioData.rowing?.watts ?? ''}
                            placeholder="150"
                            onChange={(event) => updateRowing({ watts: parseInteger(event.target.value) })}
                            className={STANDARD_INPUT_CLASSES}
                          />
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {equipmentType === 'running' ? (
                  <Card className="rounded-[24px] border-primary/12 bg-primary/[0.05] shadow-none">
                    <CardContent className="space-y-5 p-5">
                      <div>
                        <h3 className="font-semibold text-foreground">Métriques course</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Très utile pour différencier un footing d’un travail sur tapis plus technique.
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <FormField label="Vitesse (km/h)">
                          <Input
                            type="number"
                            min="1"
                            max="25"
                            step="0.1"
                            value={cardioData.running?.speed ?? ''}
                            placeholder="9.5"
                            onChange={(event) => updateRunning({ speed: parseFloatValue(event.target.value) })}
                            className={STANDARD_INPUT_CLASSES}
                          />
                        </FormField>

                        <FormField label="Inclinaison (%)">
                          <Input
                            type="number"
                            min="0"
                            max="15"
                            step="0.5"
                            value={cardioData.running?.incline ?? ''}
                            placeholder="2"
                            onChange={(event) =>
                              updateRunning({ incline: parseFloatValue(event.target.value) })
                            }
                            className={STANDARD_INPUT_CLASSES}
                          />
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {equipmentType === 'cycling' ? (
                  <Card className="rounded-[24px] border-primary/12 bg-primary/[0.05] shadow-none">
                    <CardContent className="space-y-5 p-5">
                      <div>
                        <h3 className="font-semibold text-foreground">Métriques vélo</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Cadence et résistance suffisent déjà pour un suivi cardio très propre.
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <FormField label="Cadence (RPM)">
                          <Input
                            type="number"
                            min="50"
                            max="120"
                            value={cardioData.cycling?.cadence ?? ''}
                            placeholder="85"
                            onChange={(event) =>
                              updateCycling({ cadence: parseInteger(event.target.value) })
                            }
                            className={STANDARD_INPUT_CLASSES}
                          />
                        </FormField>

                        <div className="space-y-2">
                          <Label>Résistance</Label>
                          <Select
                            value={(cardioData.cycling?.resistance ?? 1).toString()}
                            onValueChange={(value) =>
                              updateCycling({ resistance: Number.parseInt(value, 10) })
                            }
                          >
                            <SelectTrigger className={STANDARD_SELECT_CLASSES}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 20 }, (_, index) => (
                                <SelectItem key={index + 1} value={(index + 1).toString()}>
                                  Niveau {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            )}

            <FormField
              label="Notes"
              helpText="Ressenti, réglage machine, douleur à surveiller, contexte de séance…"
            >
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Ajoute un contexte utile pour relire cette première performance plus tard."
                className={STANDARD_TEXTAREA_CLASSES}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-card/84">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.08] text-primary">
                <TimerReset className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Tu peux aussi passer</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Si tu veux juste créer la fiche maintenant, on garde le chemin court et tu
                  enregistreras la première perf ensuite.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionButton type="button" tone="secondary" onClick={onBack} disabled={isLoading}>
                Retour
              </ActionButton>
              <ActionButton type="button" tone="secondary" onClick={handleSkip} disabled={isLoading}>
                <SkipForward className="h-4 w-4" />
                Passer
              </ActionButton>
              <ActionButton type="submit" tone="primary" disabled={isLoading}>
                <Target className="h-4 w-4" />
                Enregistrer l&apos;exercice
              </ActionButton>
            </div>
          </CardContent>
        </Card>
      </motion.form>
    </section>
  )
}
