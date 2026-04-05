'use client'

import { Calendar, Clock, Zap } from'lucide-react'

import { Badge} from'@/components/ui/badge'
import { Button } from'@/components/ui/button'
import { Card, CardContent } from'@/components/ui/card'
import { Slider} from'@/components/ui/slider'

interface FrequencySelectionProps {
 frequencyValue?:'Faible' |'Modérée' |'Élevée'
 availabilityValue?: number
 onChange: (frequency:'Faible' |'Modérée' |'Élevée', availability: number) => void
}

const frequencies = [
 {
 id:'Faible' as const,
 title:'Faible',
 description:"J'ai peu de temps mais je veux rester actif",
 details:'1-2 séances par semaine',
 icon: Clock,
 },
 {
 id:'Modérée' as const,
 title:'Modérée',
 description:"Je peux m'entraîner régulièrement",
 details:'3-4 séances par semaine',
 icon: Calendar,
 },
 {
 id:'Élevée' as const,
 title:'Élevée',
 description:"J'ai beaucoup de temps à consacrer au sport",
 details:'5+ séances par semaine',
 icon: Zap,
 },
]

export function FrequencySelection({ frequencyValue, availabilityValue, onChange}: FrequencySelectionProps) {
 const handleFrequencyChange = (newFrequency:'Faible' |'Modérée' |'Élevée') => {
 onChange(newFrequency, availabilityValue || 60)
 }

 const handleAvailabilityChange = (newAvailability: number[]) => {
 onChange(frequencyValue ||'Modérée', newAvailability[0])
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
 <div className="space-y-2 text-center">
 <h2 className="text-xl font-semibold text-foreground text-balance">
 À quel rythme veux-tu t&apos;entraîner ?
 </h2>
 <p className="text-sm leading-6 text-safe-muted">
 On ajuste le volume du programme pour qu&apos;il reste réaliste dans ton agenda.
 </p>
 </div>

 <div className="space-y-3" role="group" aria-label="Choix de la fréquence d’entraînement">
 {frequencies.map((freq) => {
 const Icon = freq.icon
 const isSelected = frequencyValue === freq.id

 return (
 <Button
 type="button"
 key={freq.id}
 variant="outline"
 aria-pressed={isSelected}
 onClick={() => handleFrequencyChange(freq.id)}
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
 <p className="text-base font-semibold text-foreground">{freq.title}</p>
 <p className="text-sm leading-6 text-safe-muted">{freq.description}</p>
 <Badge variant="secondary" className="text-xs">{freq.details}</Badge>
 </div>
 </div>
 </Button>
 )
 })}
 </div>

 <div className="space-y-4">
 <div className="text-center">
 <h3 className="text-base font-semibold text-foreground mb-1">
 Combien de temps par séance ?
 </h3>
 <p className="text-sm leading-6 text-safe-muted">
 Durée moyenne souhaitée pour chaque entraînement.
 </p>
 </div>

 <Card className="bg-muted/50">
 <CardContent className="pt-6">
 <div className="space-y-4">
 <div className="flex justify-between items-center">
 <span className="text-sm text-safe-muted">Durée par séance</span>
 <span className="text-lg font-semibold text-primary">
 {formatTime(availabilityValue || 60)}
 </span>
 </div>

 <Slider
 aria-label="Durée moyenne par séance"
 value={[availabilityValue || 60]}
 onValueChange={handleAvailabilityChange}
 max={120}
 min={30}
 step={15}
 className="w-full"
 />

 <div className="flex justify-between text-xs text-safe-muted">
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
 <div className="rounded-2xl border border-primary/20 bg-primary/8 p-3 text-center" role="status" aria-live="polite">
 <p className="text-sm font-medium text-foreground">
 Fréquence <span className="text-primary font-semibold">{frequencyValue.toLowerCase()}</span> · Séances de <span className="text-primary font-semibold">{formatTime(availabilityValue)}</span>
 </p>
 </div>
 )}
 </div>
 )
}
