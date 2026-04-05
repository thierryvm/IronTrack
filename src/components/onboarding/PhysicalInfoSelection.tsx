'use client'

import { useState} from'react'
import { Calendar, Ruler, Scale, User } from'lucide-react'

import { Card, CardContent, CardHeader, CardTitle} from'@/components/ui/card'
import { Input } from'@/components/ui/input'
import { Label } from'@/components/ui/label'

interface PhysicalInfoSelectionProps {
 value?: {
 height?: number
 weight?: number
 age?: number
 initial_weight?: number
 }
 onChange: (info: {
 height: number
 weight: number
 age: number
 initial_weight: number
 }) => void
}

export function PhysicalInfoSelection({ value, onChange}: PhysicalInfoSelectionProps) {
 const [height, setHeight] = useState<string>(value?.height?.toString() ||'')
 const [weight, setWeight] = useState<string>(value?.weight?.toString() ||'')
 const [age, setAge] = useState<string>(value?.age?.toString() ||'')
 const [initialWeight, setInitialWeight] = useState<string>(value?.initial_weight?.toString() ||'')

 const handleInputChange = (field: string, inputValue: string) => {
 switch (field) {
 case'height':
 setHeight(inputValue)
 break
 case'weight':
 setWeight(inputValue)
 break
 case'age':
 setAge(inputValue)
 break
 case'initial_weight':
 setInitialWeight(inputValue)
 break
 }

 const newHeight = field ==='height' ? parseFloat(inputValue) : parseFloat(height)
 const newWeight = field ==='weight' ? parseFloat(inputValue) : parseFloat(weight)
 const newAge = field ==='age' ? parseInt(inputValue) : parseInt(age)
 const newInitialWeight = field ==='initial_weight' ? parseFloat(inputValue) : parseFloat(initialWeight)

 if (!isNaN(newHeight) && !isNaN(newWeight) && !isNaN(newAge) && !isNaN(newInitialWeight)) {
 onChange({
 height: newHeight,
 weight: newWeight,
 age: newAge,
 initial_weight: newInitialWeight,
 })
 }
 }

 const isComplete = Boolean(
 height &&
 weight &&
 age &&
 initialWeight &&
 !isNaN(parseFloat(height)) &&
 !isNaN(parseFloat(weight)) &&
 !isNaN(parseInt(age)) &&
 !isNaN(parseFloat(initialWeight))
 )

 const fields = [
 {
 key:'height',
 label:'Taille',
 helper:'Indique ta taille actuelle en centimètres.',
 unit:'cm',
 icon: Ruler,
 inputMode:'decimal' as const,
 value: height,
 placeholder:'170…',
 min:'100',
 max:'250',
 step:'0.1',
 color:'text-primary',
 onChangeValue: (inputValue: string) => handleInputChange('height', inputValue),
 },
 {
 key:'weight',
 label:'Poids actuel',
 helper:'Repère de départ pour personnaliser tes objectifs.',
 unit:'kg',
 icon: Scale,
 inputMode:'decimal' as const,
 value: weight,
 placeholder:'70…',
 min:'30',
 max:'200',
 step:'0.1',
 color:'text-safe-success',
 onChangeValue: (inputValue: string) => handleInputChange('weight', inputValue),
 },
 {
 key:'age',
 label:'Âge',
 helper:'Utilisé pour calibrer les recommandations.',
 unit:'ans',
 icon: Calendar,
 inputMode:'numeric' as const,
 value: age,
 placeholder:'25…',
 min:'13',
 max:'100',
 color:'text-safe-info',
 onChangeValue: (inputValue: string) => handleInputChange('age', inputValue),
 },
 {
 key:'initial_weight',
 label:'Poids initial',
 helper:'Poids au début de ton parcours fitness.',
 unit:'kg',
 icon: User,
 inputMode:'decimal' as const,
 value: initialWeight,
 placeholder:'75…',
 min:'30',
 max:'200',
 step:'0.1',
 color:'text-primary',
 onChangeValue: (inputValue: string) => handleInputChange('initial_weight', inputValue),
 },
 ]

 return (
 <div className="space-y-6">
 <div className="space-y-2 text-center">
 <h2 className="text-xl font-semibold text-foreground text-balance">
 Informations physiques
 </h2>
 <p className="text-sm leading-6 text-safe-muted">
 Ces données servent à personnaliser les recommandations et à créer un vrai point de départ pour ton suivi.
 </p>
 </div>

 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
 {fields.map((field) => {
 const Icon = field.icon

 return (
 <Card key={field.key} className="border-border">
 <CardHeader className="pb-2">
 <div className="flex items-center gap-3">
 <div className={`rounded-xl border border-border bg-muted/35 p-2 ${field.color}`}>
 <Icon className="h-5 w-5" aria-hidden="true" />
 </div>
 <div>
 <CardTitle className="text-lg">{field.label}</CardTitle>
 <p className="text-sm text-safe-muted">{field.helper}</p>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="space-y-2">
 <Label htmlFor={field.key}>{field.label}</Label>
 <div className="flex items-center gap-2">
 <Input
 id={field.key}
 name={field.key}
 type="number"
 inputMode={field.inputMode}
 autoComplete="off"
 min={field.min}
 max={field.max}
 step={field.step}
 value={field.value}
 onChange={(event) => field.onChangeValue(event.target.value)}
 placeholder={field.placeholder}
 className="h-12"
 />
 <span className="min-w-10 text-sm font-semibold text-safe-muted">{field.unit}</span>
 </div>
 </div>
 </CardContent>
 </Card>
 )
 })}
 </div>

 {isComplete && (
 <div className="rounded-2xl border border-success/25 bg-success/10 p-4 text-center" role="status" aria-live="polite">
 <p className="text-sm font-medium text-foreground">
 Informations physiques prêtes.
 </p>
 <p className="mt-1 text-sm text-safe-muted">
 Ces repères serviront à personnaliser tes recommandations et à suivre ta progression dans le temps.
 </p>
 </div>
 )}
 </div>
 )
}
