'use client'

import React, { useMemo, useState } from 'react'
import { ArrowLeft, Clock3, Trophy } from 'lucide-react'

import { AdaptiveMetricsForm } from '@/components/exercises/AdaptiveMetricsForm'
import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ExerciseType } from '@/types/exercise'
import { CardioMetrics, StrengthMetrics } from '@/types/performance'
import { getFieldHelpText, getFieldVisibility } from '@/utils/exerciseFieldLogic'

interface ExerciseInfo {
  id: number
  name: string
  type: ExerciseType
  equipment: string
}

interface PerformanceAddFormProps {
  exercise: ExerciseInfo
  onComplete: (performanceData: StrengthMetrics | CardioMetrics, notes?: string) => Promise<void>
  onBack: () => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-safe-error">{message}</p>
}

export function PerformanceAddForm({
  exercise,
  onComplete,
  onBack,
}: PerformanceAddFormProps) {
  const [strengthData, setStrengthData] = useState<StrengthMetrics>({
    weight: 0,
    reps: 0,
    sets: 0,
    rest_seconds: 60,
    rpe: undefined,
  })
  const [cardioData, setCardioData] = useState<CardioMetrics>({
    duration_seconds: 0,
    distance: 0,
    distance_unit: 'km',
    heart_rate: undefined,
    calories: undefined,
    rowing: undefined,
    running: undefined,
    cycling: undefined,
  })
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fieldVisibility = useMemo(
    () => getFieldVisibility(exercise.type, exercise.name, exercise.equipment),
    [exercise.equipment, exercise.name, exercise.type],
  )

  const getDurationMinutes = () => Math.floor(cardioData.duration_seconds / 60)
  const getDurationSeconds = () => cardioData.duration_seconds % 60

  const updateDuration = (minutes: number, seconds: number) => {
    const totalSeconds = minutes * 60 + seconds
    setCardioData((prev) => ({
      ...prev,
      duration_seconds: totalSeconds,
    }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (exercise.type === 'Musculation') {
      if (!strengthData.weight || strengthData.weight <= 0 || strengthData.weight > 1000) {
        nextErrors.weight = 'Le poids doit être compris entre 0,5 et 1000 kg.'
      }
      if (!strengthData.reps || strengthData.reps <= 0 || strengthData.reps > 500) {
        nextErrors.reps = 'Les répétitions doivent être comprises entre 1 et 500.'
      }
      if (!strengthData.sets || strengthData.sets <= 0 || strengthData.sets > 100) {
        nextErrors.sets = 'Les séries doivent être comprises entre 1 et 100.'
      }
      if (strengthData.rpe !== undefined && (strengthData.rpe < 1 || strengthData.rpe > 10)) {
        nextErrors.rpe = 'Le RPE doit être compris entre 1 et 10.'
      }
    } else {
      if (cardioData.duration_seconds <= 0 || cardioData.duration_seconds > 43200) {
        nextErrors.duration = 'La durée doit être comprise entre 1 seconde et 12 heures.'
      }
      if (cardioData.distance !== undefined && (cardioData.distance < 0 || cardioData.distance > 1000)) {
        nextErrors.distance = 'La distance doit rester entre 0 et 1000 km.'
      }
      if (
        cardioData.heart_rate !== undefined &&
        (cardioData.heart_rate < 40 || cardioData.heart_rate > 250)
      ) {
        nextErrors.heartRate = 'La fréquence cardiaque doit rester entre 40 et 250 BPM.'
      }
    }

    if (notes.length > 2000) {
      nextErrors.notes = 'Les notes ne peuvent pas dépasser 2000 caractères.'
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
      const sanitizedData =
        exercise.type === 'Musculation'
          ? {
              ...strengthData,
              weight: Math.round((strengthData.weight || 0) * 100) / 100,
              reps: Math.max(0, Math.floor(strengthData.reps || 0)),
              sets: Math.max(0, Math.floor(strengthData.sets || 0)),
              rest_seconds: Math.max(0, Math.floor(strengthData.rest_seconds || 60)),
              rpe:
                strengthData.rpe !== undefined
                  ? Math.max(1, Math.min(10, Math.floor(strengthData.rpe)))
                  : undefined,
            }
          : {
              ...cardioData,
              duration_seconds: Math.max(1, Math.floor(cardioData.duration_seconds || 0)),
              distance:
                cardioData.distance !== undefined
                  ? Math.max(0, Math.round(cardioData.distance * 100) / 100)
                  : undefined,
              heart_rate:
                cardioData.heart_rate !== undefined
                  ? Math.max(40, Math.min(250, Math.floor(cardioData.heart_rate)))
                  : undefined,
              calories:
                cardioData.calories !== undefined ? Math.max(0, Math.floor(cardioData.calories)) : undefined,
            }

      await onComplete(sanitizedData, notes.trim().slice(0, 2000) || undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card className="rounded-[26px] border-border bg-card/88 p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                {exercise.type}
              </Badge>
              <Badge variant="outline" className="border-border bg-background/65 text-safe-muted">
                {exercise.equipment || 'Équipement libre'}
              </Badge>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Nouvelle performance
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Entre uniquement les données utiles. On garde une saisie rapide, lisible et orientée progression.
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-border/70 bg-background/50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
              Exercice
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">{exercise.name}</p>
          </div>
        </div>
      </Card>

      <Card className="rounded-[26px] border-border bg-card/88 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-foreground">Mesures principales</h3>
        </div>

        {exercise.type === 'Musculation' ? (
          <div className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="20"
                  value={strengthData.weight || ''}
                  onChange={(e) =>
                    setStrengthData((prev) => ({
                      ...prev,
                      weight: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={errors.weight ? 'border-destructive' : ''}
                />
                <FieldError message={errors.weight} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reps">Répétitions *</Label>
                <Input
                  id="reps"
                  type="number"
                  min="1"
                  placeholder="10"
                  value={strengthData.reps || ''}
                  onChange={(e) =>
                    setStrengthData((prev) => ({
                      ...prev,
                      reps: Number.parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className={errors.reps ? 'border-destructive' : ''}
                />
                <FieldError message={errors.reps} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sets">Séries *</Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  placeholder="3"
                  value={strengthData.sets || ''}
                  onChange={(e) =>
                    setStrengthData((prev) => ({
                      ...prev,
                      sets: Number.parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className={errors.sets ? 'border-destructive' : ''}
                />
                <FieldError message={errors.sets} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rest-seconds">Repos entre séries</Label>
                <Input
                  id="rest-seconds"
                  type="number"
                  min="0"
                  placeholder="60"
                  value={strengthData.rest_seconds || ''}
                  onChange={(e) =>
                    setStrengthData((prev) => ({
                      ...prev,
                      rest_seconds: Number.parseInt(e.target.value, 10) || 60,
                    }))
                  }
                />
                <p className="text-xs text-safe-muted">
                  Garde un repère simple de récupération entre les séries.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rpe">RPE</Label>
                <Select
                  value={strengthData.rpe?.toString() || 'undefined'}
                  onValueChange={(value: string) =>
                    setStrengthData((prev) => ({
                      ...prev,
                      rpe: value === 'undefined' ? undefined : Number.parseInt(value, 10),
                    }))
                  }
                >
                  <SelectTrigger id="rpe" className={errors.rpe ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Non défini" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undefined">Non défini</SelectItem>
                    {Array.from({ length: 10 }, (_, index) => {
                      const value = index + 1
                      return (
                        <SelectItem key={value} value={String(value)}>
                          {value}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-safe-muted">
                  6-7 = marge confortable, 8-9 = proche de la limite, 10 = maximum.
                </p>
                <FieldError message={errors.rpe} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration-minutes">Durée *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="duration-minutes"
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={getDurationMinutes() || ''}
                    onChange={(e) =>
                      updateDuration(Number.parseInt(e.target.value, 10) || 0, getDurationSeconds())
                    }
                    className={errors.duration ? 'border-destructive' : ''}
                  />
                  <Input
                    id="duration-seconds"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Sec"
                    value={getDurationSeconds() || ''}
                    onChange={(e) =>
                      updateDuration(getDurationMinutes(), Number.parseInt(e.target.value, 10) || 0)
                    }
                    className={errors.duration ? 'border-destructive' : ''}
                  />
                </div>
                <FieldError message={errors.duration} />
              </div>

              {fieldVisibility.distance ? (
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance</Label>
                  <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-3">
                    <Input
                      id="distance"
                      type="number"
                      min="0"
                      step="0.1"
                      value={cardioData.distance || ''}
                      onChange={(e) =>
                        setCardioData((prev) => ({
                          ...prev,
                          distance: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                      className={errors.distance ? 'border-destructive' : ''}
                    />
                    <Select
                      value={cardioData.distance_unit}
                      onValueChange={(value: string) =>
                        setCardioData((prev) => ({
                          ...prev,
                          distance_unit: value as 'km' | 'm' | 'miles',
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">km</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="miles">mi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-safe-muted">
                    {getFieldHelpText('distance', exercise.type, exercise.name)}
                  </p>
                  <FieldError message={errors.distance} />
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {fieldVisibility.heartRate ? (
                <div className="space-y-2">
                  <Label htmlFor="heart-rate">Fréquence cardiaque</Label>
                  <Input
                    id="heart-rate"
                    type="number"
                    min="60"
                    max="200"
                    placeholder="140"
                    value={cardioData.heart_rate || ''}
                    onChange={(e) =>
                      setCardioData((prev) => ({
                        ...prev,
                        heart_rate: Number.parseInt(e.target.value, 10) || undefined,
                      }))
                    }
                    className={errors.heartRate ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-safe-muted">
                    {getFieldHelpText('heartRate', exercise.type, exercise.name)}
                  </p>
                  <FieldError message={errors.heartRate} />
                </div>
              ) : null}

              {fieldVisibility.calories ? (
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    placeholder="300"
                    value={cardioData.calories || ''}
                    onChange={(e) =>
                      setCardioData((prev) => ({
                        ...prev,
                        calories: Number.parseInt(e.target.value, 10) || undefined,
                      }))
                    }
                  />
                  <p className="text-xs text-safe-muted">
                    {getFieldHelpText('calories', exercise.type, exercise.name)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Card>

      <Card className="rounded-[26px] border-border bg-card/88 p-5 shadow-card">
        <AdaptiveMetricsForm
          exerciseType={exercise.type}
          equipment={exercise.equipment || ''}
          exerciseName={exercise.name}
          cardioData={cardioData}
          strengthData={strengthData}
          setCardioData={setCardioData}
          setStrengthData={setStrengthData}
        />
      </Card>

      <Card className="rounded-[26px] border-border bg-card/88 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-foreground">Notes de séance</h3>
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Ressenti, ajustements, points à retenir..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={errors.notes ? 'border-destructive' : ''}
          />
          <p className="text-xs text-safe-muted">
            Garde une trace utile pour la prochaine séance, sans te noyer dans le détail.
          </p>
          <FieldError message={errors.notes} />
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <ActionButton type="button" tone="secondary" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Retour</span>
        </ActionButton>

        <ActionButton type="submit" tone="primary" disabled={isLoading} className="gap-2">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          <span>{isLoading ? 'Enregistrement...' : 'Enregistrer la performance'}</span>
        </ActionButton>
      </div>
    </form>
  )
}
