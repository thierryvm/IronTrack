'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { GoalSelection } from './GoalSelection'
import { ExperienceSelection } from './ExperienceSelection'
import { FrequencySelection } from './FrequencySelection'
import { PhysicalInfoSelection } from './PhysicalInfoSelection'

export interface OnboardingData {
  goal: 'Prise de masse' | 'Perte de poids' | 'Maintien' | 'Performance'
  experience: 'Débutant' | 'Intermédiaire' | 'Avancé'
  frequency: 'Faible' | 'Modérée' | 'Élevée'
  availability: number
  height: number
  weight: number
  age: number
  initial_weight: number
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
  initialData?: Partial<OnboardingData>
}

export function OnboardingFlow({ onComplete, initialData = {} }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<OnboardingData>>(initialData)

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return formData.goal !== undefined
      case 2: return formData.experience !== undefined
      case 3: return formData.frequency !== undefined && formData.availability !== undefined
      case 4: return formData.height !== undefined && formData.weight !== undefined && formData.age !== undefined && formData.initial_weight !== undefined
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData as OnboardingData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Bienvenue sur IronTrack !
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
              Personnalisons votre expérience en 4 étapes
            </CardDescription>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Étape {currentStep} sur {totalSteps}
            </div>
            <div className="text-sm text-blue-600 font-semibold">
              {Math.round(progress)}% complété
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <GoalSelection 
              value={formData.goal} 
              onChange={(goal) => updateFormData({ goal })}
            />
          )}
          
          {currentStep === 2 && (
            <ExperienceSelection 
              value={formData.experience} 
              onChange={(experience) => updateFormData({ experience })}
            />
          )}
          
          {currentStep === 3 && (
            <FrequencySelection 
              frequencyValue={formData.frequency} 
              availabilityValue={formData.availability}
              onChange={(frequency, availability) => updateFormData({ frequency, availability })}
            />
          )}
          
          {currentStep === 4 && (
            <PhysicalInfoSelection 
              value={{
                height: formData.height,
                weight: formData.weight,
                age: formData.age,
                initial_weight: formData.initial_weight
              }}
              onChange={(physicalInfo) => updateFormData(physicalInfo)}
            />
          )}
          
          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3"
            >
              <ArrowLeft className="h-6 w-6" />
              Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              {!isStepComplete(currentStep) && (
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  Veuillez faire votre choix pour continuer
                </span>
              )}
              <Button
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {currentStep === totalSteps ? (
                  <>
                    <span>Terminer</span>
                    <span className="text-lg">🚀</span>
                  </>
                ) : (
                  <>
                    <span>Suivant</span>
                    <ArrowRight className="h-6 w-6" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}