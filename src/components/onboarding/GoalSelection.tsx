'use client'

import { Activity, Target, TrendingUp, Zap } from'lucide-react'

import { Button } from'@/components/ui/button'

interface GoalSelectionProps {
 value?:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance'
 onChange: (goal:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance') => void
}

const goals = [
 {
 id:'Prise de masse' as const,
 title:'Prise de masse',
 description:'Développer ma masse musculaire et gagner en force',
 icon: TrendingUp,
 },
 {
 id:'Perte de poids' as const,
 title:'Perte de poids',
 description:'Perdre du poids et améliorer ma composition corporelle',
 icon: Target,
 },
 {
 id:'Maintien' as const,
 title:'Maintien',
 description:'Maintenir mon poids actuel et rester en forme',
 icon: Activity,
 },
 {
 id:'Performance' as const,
 title:'Performance',
 description:'Améliorer mes performances sportives et ma condition physique',
 icon: Zap,
 },
]

export function GoalSelection({ value, onChange}: GoalSelectionProps) {
 return (
 <div className="space-y-6">
 <div className="space-y-2 text-center">
 <h2 className="text-xl font-semibold text-foreground text-balance">
 Quel est ton objectif principal ?
 </h2>
 <p className="text-sm leading-6 text-safe-muted">
 Choisis la priorité la plus importante pour personnaliser ton programme dès la première semaine.
 </p>
 </div>

 <div className="grid grid-cols-1 gap-3 md:grid-cols-2" role="group" aria-label="Choix de l’objectif principal">
 {goals.map((goal) => {
 const Icon = goal.icon
 const isSelected = value === goal.id

 return (
 <Button
 type="button"
 key={goal.id}
 variant="outline"
 aria-pressed={isSelected}
 onClick={() => onChange(goal.id)}
 className={`h-auto min-h-[124px] justify-start rounded-2xl p-5 text-left transition-all ${
 isSelected
 ? 'border-primary bg-primary/10 shadow-sm'
 : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'
 }`}
 >
 <div className="flex w-full items-start gap-3">
 <div className={`rounded-lg p-2 transition-colors ${
 isSelected
 ? 'bg-primary text-primary-foreground'
 : 'bg-muted text-muted-foreground'
 }`}>
 <Icon className="h-4 w-4" aria-hidden="true" />
 </div>
 <div className="space-y-2">
 <p className="text-base font-semibold text-foreground">{goal.title}</p>
 <p className="text-sm leading-6 text-safe-muted">{goal.description}</p>
 </div>
 </div>
 </Button>
 )
 })}
 </div>

 {value && (
 <div className="rounded-2xl border border-primary/20 bg-primary/8 p-3 text-center" role="status" aria-live="polite">
 <p className="text-sm font-medium text-foreground">
 Programme prioritaire: <span className="text-primary">{value}</span>
 </p>
 </div>
 )}
 </div>
 )
}
