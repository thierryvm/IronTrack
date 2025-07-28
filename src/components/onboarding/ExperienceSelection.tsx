'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Trophy, Star } from 'lucide-react'

interface ExperienceSelectionProps {
  value?: 'Débutant' | 'Intermédiaire' | 'Avancé'
  onChange: (experience: 'Débutant' | 'Intermédiaire' | 'Avancé') => void
}

export function ExperienceSelection({ value, onChange }: ExperienceSelectionProps) {
  const experiences = [
    {
      id: 'Débutant',
      title: 'Débutant',
      description: 'Je commence tout juste ou j\'ai peu d\'expérience en musculation',
      details: 'Moins de 6 mois d\'expérience',
      icon: Dumbbell,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'Intermédiaire',
      title: 'Intermédiaire',
      description: 'J\'ai quelques bases et je m\'entraîne régulièrement',
      details: '6 mois à 2 ans d\'expérience',
      icon: Trophy,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'Avancé',
      title: 'Avancé',
      description: 'J\'ai une solide expérience et je maîtrise les techniques',
      details: 'Plus de 2 ans d\'expérience',
      icon: Star,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Quel est votre niveau d'expérience ?
        </h2>
        <p className="text-gray-600">
          Cela nous aidera à adapter l'intensité et la complexité de vos entraînements
        </p>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => {
          const Icon = exp.icon
          const isSelected = value === exp.id
          
          return (
            <Card 
              key={exp.id}
              className={`cursor-pointer transition-all duration-200 ${exp.color} ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-300' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onChange(exp.id as 'Débutant' | 'Intermédiaire' | 'Avancé')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exp.title}</CardTitle>
                    <CardDescription className="text-gray-700 mt-1">
                      {exp.description}
                    </CardDescription>
                    <div className="text-sm text-gray-500 mt-1">
                      {exp.details}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {value && (
        <div className="text-center bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">💪</span>
            <p className="text-sm font-medium text-green-800">
              Parfait !
            </p>
          </div>
          <p className="text-sm text-green-700">
            Nous adapterons la difficulté selon votre niveau : <strong>{value}</strong>
          </p>
        </div>
      )}
    </div>
  )
}