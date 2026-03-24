'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle} from'@/components/ui/card'
import { Target, TrendingUp, Activity, Zap} from'lucide-react'

interface GoalSelectionProps {
 value?:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance'
 onChange: (goal:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance') => void
}

const goals = [
 {
 id:'Prise de masse' as const,
 title:'Prise de masse',
 description:'Développer ma masse musculaire et gagner en force',
 icon: TrendingUp,
},
 {
 id:'Perte de poids' as const,
 title:'Perte de poids',
 description:'Perdre du poids et améliorer ma composition corporelle',
 icon: Target,
},
 {
 id:'Maintien' as const,
 title:'Maintien',
 description:'Maintenir mon poids actuel et rester en forme',
 icon: Activity,
},
 {
 id:'Performance' as const,
 title:'Performance',
 description:'Améliorer mes performances sportives et ma condition physique',
 icon: Zap,
},
]

export function GoalSelection({ value, onChange}: GoalSelectionProps) {
 return (
 <div className="space-y-6">
 <div className="text-center">
 <h2 className="text-xl font-semibold text-foreground mb-1">
 Quel est votre objectif principal ?
 </h2>
 <p className="text-sm text-muted-foreground">
 Choisissez l&apos;objectif qui vous correspond le mieux pour personnaliser votre programme
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {goals.map((goal) => {
 const Icon = goal.icon
 const isSelected = value === goal.id

 return (
 <Card
 key={goal.id}
 className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
 isSelected
 ?'ring-2 ring-primary border-primary bg-primary/5'
 :'border-border hover:border-border/80'
}`}
 onClick={() => onChange(goal.id)}
 >
 <CardHeader className="pb-2">
 <div className="flex items-center gap-2">
 <div className={`p-2 rounded-lg transition-colors ${
 isSelected
 ?'bg-primary text-primary-foreground'
 :'bg-muted text-muted-foreground'
}`}>
 <Icon className="h-4 w-4" />
 </div>
 <CardTitle className="text-base">{goal.title}</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <CardDescription>{goal.description}</CardDescription>
 </CardContent>
 </Card>
 )
})}
 </div>

 {value && (
 <div className="text-center bg-primary/5 border border-primary/20 p-2 rounded-lg">
 <p className="text-sm font-medium text-foreground">
 Programme optimisé pour : <span className="text-primary">{value}</span>
 </p>
 </div>
 )}
 </div>
 )
}
