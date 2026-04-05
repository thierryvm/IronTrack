'use client'

import { useState} from'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Timer, Trophy, UserRound } from'lucide-react'

import { Button} from'@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle} from'@/components/ui/card'
import { Progress} from'@/components/ui/progress'

import { ExperienceSelection} from'./ExperienceSelection'
import { FrequencySelection} from'./FrequencySelection'
import { GoalSelection} from'./GoalSelection'
import { PhysicalInfoSelection} from'./PhysicalInfoSelection'

export interface OnboardingData {
 goal:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance'
 experience:'Débutant' |'Intermédiaire' |'Avancé'
 frequency:'Faible' |'Modérée' |'Élevée'
 availability: number
 height: number
 weight: number
 age: number
 initial_weight: number
}

interface OnboardingFlowProps {
 onComplete: (data: OnboardingData) => void | Promise<void>
 initialData?: Partial<OnboardingData>
 isSubmitting?: boolean
}

const stepConfig = [
 { title:'Objectif', description:'Définis la priorité qui guidera tes séances.', icon: Trophy },
 { title:'Niveau', description:'On calibre la difficulté selon ton expérience.', icon: CheckCircle2 },
 { title:'Rythme', description:'On adapte le volume à ton agenda réel.', icon: Timer },
 { title:'Profil physique', description:'On prépare tes repères de progression.', icon: UserRound },
]

export function OnboardingFlow({ onComplete, initialData = {}, isSubmitting = false}: OnboardingFlowProps) {
 const [currentStep, setCurrentStep] = useState(1)
 const [formData, setFormData] = useState<Partial<OnboardingData>>(initialData)

 const totalSteps = stepConfig.length
 const progress = (currentStep / totalSteps) * 100
 const currentStepConfig = stepConfig[currentStep - 1]

 const isStepComplete = (step: number) => {
 switch (step) {
 case 1:
 return formData.goal !== undefined
 case 2:
 return formData.experience !== undefined
 case 3:
 return formData.frequency !== undefined && formData.availability !== undefined
 case 4:
 return formData.height !== undefined && formData.weight !== undefined && formData.age !== undefined && formData.initial_weight !== undefined
 default:
 return false
 }
 }

 const handleNext = async () => {
 if (currentStep < totalSteps) {
 setCurrentStep(currentStep + 1)
 return
 }

 await onComplete(formData as OnboardingData)
 }

 const handlePrevious = () => {
 if (currentStep > 1) {
 setCurrentStep(currentStep - 1)
 }
 }

 const updateFormData = (data: Partial<OnboardingData>) => {
 setFormData((prev) => ({ ...prev, ...data }))
 }

 const summaryItems = [
 { label:'Objectif', value: formData.goal },
 { label:'Niveau', value: formData.experience },
 { label:'Rythme', value: formData.frequency },
 { label:'Durée cible', value: formData.availability ? `${formData.availability} min` : undefined },
 ]

 return (
 <div className="w-full">
 <Card className="border-border shadow-lg">
 <CardHeader className="space-y-5 pb-4">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
 <div className="space-y-2">
 <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
 {currentStepConfig.title}
 </div>
 <CardTitle className="text-2xl font-black text-foreground text-balance sm:text-3xl">
 Bienvenue sur IronTrack
 </CardTitle>
 <p className="max-w-2xl text-sm leading-6 text-safe-muted sm:text-base">
 {currentStepConfig.description}
 </p>
 </div>

 <div className="rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm">
 <p className="font-semibold text-foreground">Étape {currentStep} sur {totalSteps}</p>
 <p className="mt-1 text-safe-muted">{Math.round(progress)}% du profil complété</p>
 </div>
 </div>

 <div className="grid gap-2 sm:grid-cols-4">
 {stepConfig.map((step, index) => {
 const Icon = step.icon
 const isActive = currentStep === index + 1
 const isDone = currentStep > index + 1

 return (
 <div
 key={step.title}
 className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
 isActive
 ? 'border-primary bg-primary/10'
 : isDone
 ? 'border-success/30 bg-success/10'
 : 'border-border bg-muted/25'
 }`}
 >
 <Icon className={`mb-2 h-4 w-4 ${isActive ? 'text-primary' : isDone ? 'text-success' : 'text-safe-muted'}`} aria-hidden="true" />
 <p className="text-sm font-semibold text-foreground">{step.title}</p>
 </div>
 )
 })}
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="font-medium text-safe-muted">Étape {currentStep} sur {totalSteps}</span>
 <span className="font-semibold text-primary">{Math.round(progress)}% complété</span>
 </div>
 <Progress value={progress} className="mt-2" />
 </div>
 </CardHeader>

 <CardContent className="space-y-8">
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
 initial_weight: formData.initial_weight,
 }}
 onChange={(physicalInfo) => updateFormData(physicalInfo)}
 />
 )}

 <div className="rounded-2xl border border-border bg-muted/25 p-4">
 <p className="text-sm font-semibold text-foreground">Résumé du profil</p>
 <div className="mt-3 grid gap-2 sm:grid-cols-2">
 {summaryItems.map((item) => (
 <div key={item.label} className="rounded-xl border border-border bg-card px-3 py-2">
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-safe-muted">{item.label}</p>
 <p className="mt-1 text-sm font-medium text-foreground">{item.value ||'À compléter'}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
 <Button
 variant="outline"
 onClick={handlePrevious}
 disabled={currentStep === 1 || isSubmitting}
 className="gap-2"
 fullWidth
 >
 <ArrowLeft className="h-4 w-4" />
 Précédent
 </Button>

 <div className="flex flex-col items-stretch gap-2 sm:items-end">
 {!isStepComplete(currentStep) && (
 <span className="text-sm text-safe-muted sm:text-right">
 Complète cette étape pour débloquer la suivante.
 </span>
 )}
 <Button
 onClick={handleNext}
 disabled={!isStepComplete(currentStep) || isSubmitting}
 className="gap-2"
 fullWidth
 >
 {isSubmitting ? (
 <>Création du profil…</>
 ) : currentStep === totalSteps ? (
 <>Créer ma première séance</>
 ) : (
 <>Suivant <ArrowRight className="h-4 w-4" /></>
 )}
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 )
}
