'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Trophy, Star } from 'lucide-react'

interface ExperienceSelectionProps {
  value?: 'Débutant' | 'Intermédiaire' | 'Avancé'
  onChange: (experience: 'Débutant' | 'Intermédiaire' | 'Avancé') => void
}

const experiences = [
  {
    id: 'Débutant' as const,
    title: 'Débutant',
    description: "Je commence tout juste ou j'ai peu d'expérience en musculation",
    details: "Moins de 6 mois d'expérience",
    icon: Dumbbell,
  },
  {
    id: 'Intermédiaire' as const,
    title: 'Intermédiaire',
    description: "J'ai quelques bases et je m'entraîne régulièrement",
    details: "6 mois à 2 ans d'expérience",
    icon: Trophy,
  },
  {
    id: 'Avancé' as const,
    title: 'Avancé',
    description: "J'ai une solide expérience et je maîtrise les techniques",
    details: "Plus de 2 ans d'expérience",
    icon: Star,
  },
]

export function ExperienceSelection({ value, onChange }: ExperienceSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Quel est votre niveau d&apos;expérience ?
        </h2>
        <p className="text-sm text-muted-foreground">
          Cela nous aidera à adapter l&apos;intensité et la complexité de vos entraînements
        </p>
      </div>

      <div className="space-y-3">
        {experiences.map((exp) => {
          const Icon = exp.icon
          const isSelected = value === exp.id

          return (
            <Card
              key={exp.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'border-border'
              }`}
              onClick={() => onChange(exp.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{exp.title}</CardTitle>
                    <CardDescription className="mt-0.5">{exp.description}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">{exp.details}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {value && (
        <div className="text-center bg-primary/5 border border-primary/20 p-3 rounded-lg">
          <p className="text-sm font-medium text-foreground">
            Programme adapté au niveau : <span className="text-primary">{value}</span>
          </p>
        </div>
      )}
    </div>
  )
}
