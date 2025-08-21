'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Calendar, Clock, Zap } from 'lucide-react'

interface FrequencySelectionProps {
  frequencyValue?: 'Faible' | 'Modérée' | 'Élevée'
  availabilityValue?: number
  onChange: (frequency: 'Faible' | 'Modérée' | 'Élevée', availability: number) => void
}

export function FrequencySelection({ frequencyValue, availabilityValue, onChange }: FrequencySelectionProps) {
  const frequencies = [
    {
      id: 'Faible',
      title: 'Faible',
      description: 'J\'ai peu de temps mais je veux rester actif',
      details: '1-2 séances par semaine',
      icon: Clock,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'Modérée',
      title: 'Modérée',
      description: 'Je peux m\'entraîner régulièrement',
      details: '3-4 séances par semaine',
      icon: Calendar,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'Élevée',
      title: 'Élevée',
      description: 'J\'ai beaucoup de temps à consacrer au sport',
      details: '5+ séances par semaine',
      icon: Zap,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ]

  const handleFrequencyChange = (newFrequency: 'Faible' | 'Modérée' | 'Élevée') => {
    const currentAvailability = availabilityValue || 60
    onChange(newFrequency, currentAvailability)
  }

  const handleAvailabilityChange = (newAvailability: number[]) => {
    const currentFrequency = frequencyValue || 'Modérée'
    onChange(currentFrequency, newAvailability[0])
  }

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
    }
    return `${minutes}min`
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          À quelle fréquence souhaitez-vous vous entraîner ?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Nous personnaliserons votre programme selon votre disponibilité
        </p>
      </div>

      <div className="space-y-4">
        {frequencies.map((freq) => {
          const Icon = freq.icon
          const isSelected = frequencyValue === freq.id
          
          return (
            <Card 
              key={freq.id}
              className={`cursor-pointer transition-all duration-200 ${freq.color} ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-300' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleFrequencyChange(freq.id as 'Faible' | 'Modérée' | 'Élevée')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{freq.title}</CardTitle>
                    <CardDescription className="text-gray-700 dark:text-gray-300 mt-1">
                      {freq.description}
                    </CardDescription>
                    <Badge variant="outline" className="mt-2">
                      {freq.details}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Combien de temps par séance ?
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Durée moyenne souhaitée pour chaque entraînement
          </p>
        </div>

        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Durée par séance</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatTime(availabilityValue || 60)}
                </span>
              </div>
              
              <Slider
                value={[availabilityValue || 60]}
                onValueChange={handleAvailabilityChange}
                max={120}
                min={30}
                step={15}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>30min</span>
                <span>45min</span>
                <span>1h</span>
                <span>1h15</span>
                <span>1h30</span>
                <span>2h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {frequencyValue && availabilityValue && (
        <div className="text-center bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <p className="text-sm font-medium text-purple-800">
              Configuration parfaite !
            </p>
          </div>
          <p className="text-sm text-purple-700">
            Fréquence <strong>{frequencyValue.toLowerCase()}</strong> avec des séances de <strong>{formatTime(availabilityValue)}</strong>
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Votre programme sera optimisé selon ces paramètres
          </p>
        </div>
      )}
    </div>
  )
}