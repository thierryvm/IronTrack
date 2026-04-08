'use client'

import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Sparkles, X } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  DIFFICULTY_VALUE_MAPPING,
  type Exercise,
  type ExerciseCreationData,
  type ExerciseType,
} from '@/types/exercise'
import { type Performance } from '@/types/performance'

import { ExerciseForm } from './steps/ExerciseForm'
import { PerformanceForm, type PerformanceSubmission } from './steps/PerformanceForm'
import { TypeSelection } from './steps/TypeSelection'

interface ExerciseCreationWizardProps {
  onClose?: () => void
  onComplete?: (data: { exercise: Exercise; performance?: Performance }) => Promise<void>
  className?: string
}

interface WizardState {
  currentStep: number
  exerciseType?: ExerciseType
  exerciseData?: ExerciseCreationData
  isComplete: boolean
}

const stepMeta = [
  {
    title: "Type d'exercice",
    description: 'On choisit le format de suivi pour adapter le reste du flow.',
  },
  {
    title: "Fiche de l'exercice",
    description: 'Nom, groupe musculaire, équipement, difficulté et visuel.',
  },
  {
    title: 'Première performance',
    description: 'Un point de départ propre, ou un simple skip si tu veux aller vite.',
  },
]

function sanitizeErrorMessage(message: string) {
  return message.replace(/\s+/g, ' ').trim()
}

export function ExerciseCreationWizard({
  onClose,
  onComplete,
  className = '',
}: ExerciseCreationWizardProps) {
  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    isComplete: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const activeStep = stepMeta[state.currentStep]
  const canGoBack = state.currentStep > 0 && !isLoading

  const closeWizard = useCallback(() => {
    onClose?.()
  }, [onClose])

  const nextStep = useCallback((payload: Partial<WizardState>) => {
    setState((current) => ({
      ...current,
      ...payload,
      currentStep: current.currentStep + 1,
    }))
    setError(null)
  }, [])

  const previousStep = useCallback(() => {
    setState((current) => ({
      ...current,
      currentStep: Math.max(0, current.currentStep - 1),
    }))
    setError(null)
  }, [])

  const handleTypeSelection = useCallback(
    (exerciseType: ExerciseType) => {
      nextStep({ exerciseType })
    },
    [nextStep],
  )

  const handleExerciseForm = useCallback(
    (exerciseData: ExerciseCreationData) => {
      nextStep({ exerciseData })
    },
    [nextStep],
  )

  const handlePerformanceForm = useCallback(
    async (performanceData?: PerformanceSubmission) => {
      if (!state.exerciseType || !state.exerciseData) {
        setError('Le flux de création est incomplet. Reprends depuis la première étape.')
        return
      }

      setIsLoading(true)

      try {
        const exercise: Exercise = {
          ...state.exerciseData,
          difficulty: DIFFICULTY_VALUE_MAPPING[state.exerciseData.difficulty ?? 'Débutant'],
          is_template: false,
          is_public: false,
          created_at: new Date(),
          updated_at: new Date(),
        }

        const performance = performanceData
          ? {
              exercise_id: 0,
              user_id: '',
              performed_at: new Date(),
              metrics: performanceData.metrics,
              notes: performanceData.notes,
              created_at: new Date(),
              updated_at: new Date(),
            }
          : undefined

        if (onComplete) {
          await onComplete({ exercise, performance })
        }

        setState((current) => ({ ...current, isComplete: true }))
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? sanitizeErrorMessage(caughtError.message)
            : "Une erreur inattendue a interrompu la création de l'exercice."

        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [onComplete, state.exerciseData, state.exerciseType],
  )

  const stepContent = useMemo(() => {
    switch (state.currentStep) {
      case 0:
        return <TypeSelection selectedType={state.exerciseType} onNext={handleTypeSelection} />
      case 1:
        return (
          <ExerciseForm
            exerciseType={state.exerciseType!}
            initialData={state.exerciseData}
            onComplete={handleExerciseForm}
            onBack={previousStep}
          />
        )
      case 2:
        return (
          <PerformanceForm
            exerciseType={state.exerciseType!}
            exerciseData={state.exerciseData!}
            onComplete={handlePerformanceForm}
            onBack={previousStep}
            onSkip={() => handlePerformanceForm(undefined)}
          />
        )
      default:
        return null
    }
  }, [
    handleExerciseForm,
    handlePerformanceForm,
    handleTypeSelection,
    previousStep,
    state.currentStep,
    state.exerciseData,
    state.exerciseType,
  ])

  return (
    <main className={cn('min-h-screen bg-background pb-16', className)}>
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Card className="overflow-hidden rounded-[34px] border-border/80 bg-card/94 shadow-[0_34px_120px_rgba(15,23,42,0.18)]">
          <CardContent className="relative p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,88,12,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.1),transparent_38%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            </div>

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-4">
                  <Badge>Nouvel exercice</Badge>
                  <div>
                    <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                      Construis une fiche d&apos;exercice propre, claire et prête au suivi.
                    </h1>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                      Le flow reste volontairement simple: on choisit le bon type, on décrit
                      l&apos;exercice, puis on ajoute éventuellement une première performance.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={canGoBack ? previousStep : closeWizard}
                    disabled={isLoading}
                    aria-label={canGoBack ? 'Revenir à l’étape précédente' : 'Annuler la création'}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={closeWizard}
                    disabled={isLoading}
                    aria-label="Fermer la création d’exercice"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-8 grid gap-3 lg:grid-cols-3">
                {stepMeta.map((step, index) => {
                  const isActive = state.currentStep === index
                  const isDone = state.currentStep > index || state.isComplete

                  return (
                    <div
                      key={step.title}
                      className={cn(
                        'rounded-[24px] border p-4 transition-colors',
                        isActive
                          ? 'border-primary/30 bg-primary/[0.08]'
                          : 'border-border/80 bg-background/70',
                      )}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold',
                            isDone
                              ? 'border-primary/30 bg-primary text-primary-foreground'
                              : isActive
                                ? 'border-primary/30 bg-primary/12 text-primary'
                                : 'border-border bg-card text-muted-foreground',
                          )}
                        >
                          {isDone ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{step.title}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-background/62 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.08] text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activeStep.title}</p>
                    <p className="text-sm text-muted-foreground">{activeStep.description}</p>
                  </div>
                </div>

                {state.exerciseType ? <Badge variant="outline">{state.exerciseType}</Badge> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Alert
            variant="destructive"
            className="mt-6 rounded-[24px] border-destructive/30 bg-destructive/10 px-5 py-4"
          >
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/68 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md rounded-[28px] border-border/80 bg-card/96 shadow-[0_28px_100px_rgba(15,23,42,0.24)]">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.08] text-primary">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Création en cours…</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  On enregistre la fiche et la performance sans casser le reste.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  )
}
