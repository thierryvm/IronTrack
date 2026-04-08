'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Dumbbell, Heart, Sparkles } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { type ExerciseType } from '@/types/exercise'

interface TypeSelectionProps {
  selectedType?: ExerciseType
  onNext: (type: ExerciseType) => void
}

interface TypeCardProps {
  title: string
  description: string
  detail: string
  icon: typeof Dumbbell
  isActive: boolean
  onSelect: () => void
}

function TypeCard({
  title,
  description,
  detail,
  icon: Icon,
  isActive,
  onSelect,
}: TypeCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={onSelect}
      className={[
        'group w-full rounded-[28px] border text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isActive
          ? 'border-primary/35 bg-primary/[0.08] shadow-[0_18px_48px_rgba(234,88,12,0.18)]'
          : 'border-border bg-card/88 hover:border-primary/20 hover:bg-accent/40',
      ].join(' ')}
    >
      <div className="flex min-h-[156px] items-center gap-5 p-6">
        <div
          className={[
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border',
            isActive
              ? 'border-primary/30 bg-primary text-primary-foreground'
              : 'border-border bg-background text-primary',
          ].join(' ')}
        >
          <Icon className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">{title}</h3>
            {isActive ? <Badge>Choisi</Badge> : null}
          </div>
          <p className="mb-2 text-sm leading-6 text-muted-foreground">{description}</p>
          <p className="text-sm font-medium text-foreground/84">{detail}</p>
        </div>

        <div
          className={[
            'hidden h-11 w-11 items-center justify-center rounded-full border md:flex',
            isActive
              ? 'border-primary/30 bg-primary/12 text-primary'
              : 'border-border bg-background text-muted-foreground group-hover:text-foreground',
          ].join(' ')}
        >
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </motion.button>
  )
}

export function TypeSelection({ selectedType, onNext }: TypeSelectionProps) {
  return (
    <section className="space-y-6">
      <Card className="overflow-hidden rounded-[32px] border-border/80 bg-card/92 shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
        <CardContent className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,88,12,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
          </div>

          <div className="relative">
            <Badge className="mb-4">Création guidée</Badge>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              On commence par le bon type d&apos;exercice.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              La suite du formulaire s&apos;adaptera automatiquement au type choisi pour éviter
              les champs inutiles et garder un flux clair.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <TypeCard
          title="Musculation"
          description="Pour les exercices de force, hypertrophie et volume avec poids, répétitions et séries."
          detail="Exemples : développé couché, squat, curl marteau."
          icon={Dumbbell}
          isActive={selectedType === 'Musculation'}
          onSelect={() => onNext('Musculation')}
        />

        <TypeCard
          title="Cardio"
          description="Pour les efforts d’endurance mesurés avec durée, distance et métriques spécifiques selon l’équipement."
          detail="Exemples : course, tapis, rameur, vélo."
          icon={Heart}
          isActive={selectedType === 'Cardio'}
          onSelect={() => onNext('Cardio')}
        />
      </div>

      <Card className="rounded-[28px] border-border/80 bg-card/86">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.08] text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Bon réflexe</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Choisis le type qui correspond à la logique de suivi. On pourra ensuite enregistrer
                une première performance propre à ce format.
              </p>
            </div>
          </div>

          {selectedType ? (
            <ActionButton tone="secondary" onClick={() => onNext(selectedType)} className="sm:min-w-[180px]">
              Continuer avec {selectedType}
            </ActionButton>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
