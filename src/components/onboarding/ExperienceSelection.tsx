'use client'

import { Dumbbell, Star, Trophy } from'lucide-react'

import { Button } from'@/components/ui/button'

interface ExperienceSelectionProps {
 value?:'Débutant' |'Intermédiaire' |'Avancé'
 onChange: (experience:'Débutant' |'Intermédiaire' |'Avancé') => void
}

const experiences = [
 {
 id:'Débutant' as const,
 title:'Débutant',
 description:"Je commence tout juste ou j'ai peu d'expérience en musculation",
 details:"Moins de 6 mois d'expérience",
 icon: Dumbbell,
 },
 {
 id:'Intermédiaire' as const,
 title:'Intermédiaire',
 description:"J'ai quelques bases et je m'entraîne régulièrement",
 details:"6 mois à 2 ans d'expérience",
 icon: Trophy,
 },
 {
 id:'Avancé' as const,
 title:'Avancé',
 description:"J'ai une solide expérience et je maîtrise les techniques",
 details:"Plus de 2 ans d'expérience",
 icon: Star,
 },
]

export function ExperienceSelection({ value, onChange}: ExperienceSelectionProps) {
 return (
 <div className="space-y-6">
 <div className="space-y-2 text-center">
 <h2 className="text-xl font-semibold text-foreground text-balance">
 Quel est ton niveau d&apos;expérience ?
 </h2>
 <p className="text-sm leading-6 text-safe-muted">
 On ajuste l&apos;intensité, la complexité et la cadence d&apos;apprentissage selon ton vécu réel.
 </p>
 </div>

 <div className="space-y-3" role="group" aria-label="Choix du niveau d’expérience">
 {experiences.map((exp) => {
 const Icon = exp.icon
 const isSelected = value === exp.id

 return (
 <Button
 type="button"
 key={exp.id}
 variant="outline"
 aria-pressed={isSelected}
 onClick={() => onChange(exp.id)}
 className={`h-auto min-h-[120px] justify-start rounded-2xl p-5 text-left transition-all ${
 isSelected
 ? 'border-primary bg-primary/10 shadow-sm'
 : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'
 }`}
 >
 <div className="flex w-full items-start gap-4">
 <div className={`rounded-lg p-2 transition-colors ${
 isSelected
 ? 'bg-primary text-primary-foreground'
 : 'bg-muted text-muted-foreground'
 }`}>
 <Icon className="h-5 w-5" aria-hidden="true" />
 </div>
 <div className="flex-1 space-y-2">
 <p className="text-base font-semibold text-foreground">{exp.title}</p>
 <p className="text-sm leading-6 text-safe-muted">{exp.description}</p>
 <p className="text-xs font-medium uppercase tracking-[0.16em] text-safe-muted">{exp.details}</p>
 </div>
 </div>
 </Button>
 )
 })}
 </div>

 {value && (
 <div className="rounded-2xl border border-primary/20 bg-primary/8 p-3 text-center" role="status" aria-live="polite">
 <p className="text-sm font-medium text-foreground">
 Niveau retenu: <span className="text-primary">{value}</span>
 </p>
 </div>
 )}
 </div>
 )
}
