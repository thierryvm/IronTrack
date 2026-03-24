'use client'

import { useState} from'react'
import { Card, CardContent, CardHeader, CardTitle} from'@/components/ui/card'
import { User, Scale, Ruler, Calendar} from'lucide-react'

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

 // Valider et envoyer les données si tous les champs sont remplis
 const newHeight = field ==='height' ? parseFloat(inputValue) : parseFloat(height)
 const newWeight = field ==='weight' ? parseFloat(inputValue) : parseFloat(weight)
 const newAge = field ==='age' ? parseInt(inputValue) : parseInt(age)
 const newInitialWeight = field ==='initial_weight' ? parseFloat(inputValue) : parseFloat(initialWeight)

 if (!isNaN(newHeight) && !isNaN(newWeight) && !isNaN(newAge) && !isNaN(newInitialWeight)) {
 onChange({
 height: newHeight,
 weight: newWeight,
 age: newAge,
 initial_weight: newInitialWeight
})
}
}

 const isComplete = height && weight && age && initialWeight &&
 !isNaN(parseFloat(height)) && !isNaN(parseFloat(weight)) && 
 !isNaN(parseInt(age)) && !isNaN(parseFloat(initialWeight))

 return (
 <div className="space-y-6">
 <div className="text-center">
 <h2 className="text-xl font-semibold text-foreground mb-2">
 Informations physiques
 </h2>
 <p className="text-gray-600">
 Ces informations nous aideront à personnaliser vos programmes et suivre votre progression
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="p-4">
 <CardHeader className="pb-2">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-blue-50 text-secondary">
 <Ruler className="h-5 w-5" />
 </div>
 <CardTitle className="text-lg">Taille</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="flex items-center gap-2">
 <input
 type="number"
 step="0.1"
 min="100"
 max="250"
 value={height}
 onChange={(e) => handleInputChange('height', e.target.value)}
 className="flex-1 px-2 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
 placeholder="170"
 />
 <span className="text-gray-600 font-medium">cm</span>
 </div>
 </CardContent>
 </Card>

 <Card className="p-4">
 <CardHeader className="pb-2">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-green-50 text-green-600">
 <Scale className="h-5 w-5" />
 </div>
 <CardTitle className="text-lg">Poids actuel</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="flex items-center gap-2">
 <input
 type="number"
 step="0.1"
 min="30"
 max="200"
 value={weight}
 onChange={(e) => handleInputChange('weight', e.target.value)}
 className="flex-1 px-2 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
 placeholder="70"
 />
 <span className="text-gray-600 font-medium">kg</span>
 </div>
 </CardContent>
 </Card>

 <Card className="p-4">
 <CardHeader className="pb-2">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
 <Calendar className="h-5 w-5" />
 </div>
 <CardTitle className="text-lg">Âge</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="flex items-center gap-2">
 <input
 type="number"
 min="13"
 max="100"
 value={age}
 onChange={(e) => handleInputChange('age', e.target.value)}
 className="flex-1 px-2 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
 placeholder="25"
 />
 <span className="text-gray-600 font-medium">ans</span>
 </div>
 </CardContent>
 </Card>

 <Card className="p-4">
 <CardHeader className="pb-2">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-orange-50 text-orange-800">
 <User className="h-5 w-5" />
 </div>
 <CardTitle className="text-lg">Poids initial</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <input
 type="number"
 step="0.1"
 min="30"
 max="200"
 value={initialWeight}
 onChange={(e) => handleInputChange('initial_weight', e.target.value)}
 className="flex-1 px-2 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
 placeholder="75"
 />
 <span className="text-gray-600 font-medium">kg</span>
 </div>
 <p className="text-xs text-gray-600">
 Votre poids au début de votre parcours fitness
 </p>
 </div>
 </CardContent>
 </Card>
 </div>

 {isComplete && (
 <div className="text-center bg-green-50 p-4 rounded-lg border border-green-200">
 <div className="flex items-center justify-center gap-2 mb-2">
 <span className="text-xl">📊</span>
 <p className="text-sm font-medium text-green-800">
 Informations enregistrées !
 </p>
 </div>
 <p className="text-sm text-green-700">
 Nous utiliserons ces données pour calculer votre IMC et suivre votre progression
 </p>
 </div>
 )}
 </div>
 )
}