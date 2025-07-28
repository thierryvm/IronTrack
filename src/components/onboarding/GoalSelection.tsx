'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, TrendingUp, Activity, Zap } from 'lucide-react'

interface GoalSelectionProps {
  value?: 'Prise de masse' | 'Perte de poids' | 'Maintien' | 'Performance'
  onChange: (goal: 'Prise de masse' | 'Perte de poids' | 'Maintien' | 'Performance') => void
}

export function GoalSelection({ value, onChange }: GoalSelectionProps) {
  const goals = [
    {
      id: 'Prise de masse',
      title: 'Prise de masse',
      description: 'Développer ma masse musculaire et gagner en force',
      icon: TrendingUp,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'Perte de poids',
      title: 'Perte de poids',
      description: 'Perdre du poids et améliorer ma composition corporelle',
      icon: Target,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'Maintien',
      title: 'Maintien',
      description: 'Maintenir mon poids actuel et rester en forme',
      icon: Activity,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      id: 'Performance',
      title: 'Performance',
      description: 'Améliorer mes performances sportives et ma condition physique',
      icon: Zap,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Quel est votre objectif principal ?
        </h2>
        <p className="text-gray-600">
          Choisissez l'objectif qui vous correspond le mieux pour personnaliser votre programme
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const Icon = goal.icon
          const isSelected = value === goal.id
          
          return (
            <Card 
              key={goal.id}
              className={`cursor-pointer transition-all duration-200 ${goal.color} ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-300' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onChange(goal.id as 'Prise de masse' | 'Perte de poids' | 'Maintien' | 'Performance')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-700">
                  {goal.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {value && (
        <div className="text-center bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium text-blue-800">
              Excellent choix !
            </p>
          </div>
          <p className="text-sm text-blue-700">
            Nous personnaliserons votre programme pour : <strong>{value}</strong>
          </p>
        </div>
      )}
    </div>
  )
}