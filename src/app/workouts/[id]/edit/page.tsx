"use client"
import { useEffect, useState} from'react'
import { useRouter, useParams} from'next/navigation'
import { motion} from'framer-motion'
import { Calendar, Save, ArrowLeft, AlertTriangle} from'lucide-react'
import { createClient} from'@/utils/supabase/client'
import Mascot from'@/components/ui/Mascot'
import { Button} from'@/components/ui/button'
import { Input} from'@/components/ui/input'
import { Label} from'@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from'@/components/ui/select'
import { Textarea} from'@/components/ui/textarea'

export default function EditWorkoutPage() {
 const router = useRouter()
 const params = useParams()
 const id = params.id

 const [name, setName] = useState('')
 const [date, setDate] = useState('')
 const [notes, setNotes] = useState('')
 const [duration, setDuration] = useState<number |''>('')
 const [status, setStatus] = useState<'Planifié' |'Réalisé' |'Annulé'>('Planifié');
 const [loading, setLoading] = useState(false)
 const [errorMsg, setErrorMsg] = useState<string | null>(null)
 const [mascotMsg, setMascotMsg] = useState<string | null>(null)
 const [mascotType, setMascotType] = useState<'motivation' |'success' |'warning' |'info'>('motivation')
 const [showMascot, setShowMascot] = useState(false)
 const [startTime, setStartTime] = useState('');
 const [type, setType] = useState<'Musculation' |'Cardio' |'Étirement' |'Repos' |'Cours collectif' |'Gainage' |'Natation' |'Crossfit' |'Yoga' |'Pilates'>('Musculation');

 // Charger les vraies données depuis Supabase
 useEffect(() => {
 const fetchWorkout = async () => {
 const supabase = createClient();
 const { data} = await supabase
 .from('workouts')
 .select('*')
 .eq('id', id)
 .single();
 if (data) {
 setName(data.name ||'')
 setDate(data.scheduled_date ? data.scheduled_date :'')
 setNotes(data.notes ||'')
 setDuration(data.duration ??'')
 setStatus(data.status ||'Planifié')
 setStartTime(data.start_time ||'')
 setType(data.type ||'Musculation')
}
};
 if (id) fetchWorkout();
}, [id]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setErrorMsg(null)
 if (!name.trim()) {
 setErrorMsg("Pas de nom, pas de muscles ! Donne un nom à ta séance.")
 setMascotMsg("Thierry, même Rocky n'a jamais oublié de nommer ses séances !")
 setMascotType('warning')
 setShowMascot(true)
 return
}
 if (!date) {
 setErrorMsg("Sans date, ta séance va se perdre dans l'espace-temps...")
 setMascotMsg("Thierry, même Marty McFly note ses dates d'entraînement !")
 setMascotType('warning')
 setShowMascot(true)
 return
}
 // Vérification de la durée seulement si ce n'est pas un jour de repos
 if (type !=='Repos' && Number(duration) <= 0) {
 setErrorMsg("La durée doit être supérieure à 0 min. Même Hulk ne fait pas des séances de 0 minute !")
 setMascotMsg("Thierry, Hulk casse tout, mais il fait au moins 1 minute !")
 setMascotType('warning')
 setShowMascot(true)
 return
}
 setLoading(true)
 const supabase = createClient()
 await supabase
 .from('workouts')
 .update({
 name,
 type,
 scheduled_date: date,
 start_time: startTime,
 notes,
 duration: (type ==='Repos' || duration ==='') ? null : Number(duration),
 status
})
 .eq('id', id)
 setLoading(false)
 setMascotMsg("Modification enregistrée, Thierry ! IronBuddy valide la perf !")
 setMascotType('success')
 setShowMascot(true)
 router.push('/workouts')
}

 const handleDelete = async () => {
 if (!confirm('Es-tu sûr de vouloir supprimer cette séance ?')) return;
 setLoading(true);
 const supabase = createClient();
 await supabase
 .from('workouts')
 .delete()
 .eq('id', id);
 setLoading(false);
 router.push('/workouts');
}

 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4">
 <motion.form
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 onSubmit={handleSubmit}
 className="bg-card border border-border rounded-xl shadow-lg p-8 w-full max-w-lg space-y-6"
 >
 <button
 type="button"
 onClick={() => router.back()}
 className="flex items-center space-x-2 text-orange-800 hover:text-orange-900 dark:text-orange-200 font-semibold mb-4"
 >
 <ArrowLeft className="h-5 w-5" />
 <span>Retour</span>
 </button>
 <div className="flex items-center space-x-2 mb-6">
 <Calendar className="h-8 w-8 text-orange-800" />
 <h1 className="text-2xl font-bold text-foreground">Modifier la séance</h1>
 </div>
 {errorMsg && (
 <motion.div
 initial={{ x: -10}}
 animate={{ x: [0, -10, 10, -10, 10, 0]}}
 transition={{ duration: 0.5}}
 className="flex items-center justify-center bg-red-200 text-red-800 px-4 py-2 rounded-lg mb-4 text-lg font-bold shadow-lg border-2 border-red-400"
 style={{ zIndex: 10}}
 >
 <AlertTriangle className="mr-2 h-6 w-6 text-red-600 animate-bounce" />
 {errorMsg}
 </motion.div>
 )}
 <div>
 <Label htmlFor="workout-name" className="block font-medium mb-2">Nom de la séance</Label>
 <Input 
 id="workout-name"
 type="text" 
 value={name} 
 onChange={e => setName(e.target.value)} 
 className="focus:ring-2 focus:ring-primary" 
 />
 </div>
 <div>
 <Label htmlFor="workout-date" className="block font-medium mb-2">Date</Label>
 <Input 
 id="workout-date"
 type="date" 
 value={date} 
 onChange={e => setDate(e.target.value)} 
 className="focus:ring-2 focus:ring-primary" 
 />
 </div>
 <div>
 <Label htmlFor="workout-type" className="font-medium mb-2">Type de séance</Label>
 <Select
 value={type}
 onValueChange={(value) => {
 const newType = value as'Musculation' |'Cardio' |'Étirement' |'Repos' |'Cours collectif' |'Gainage' |'Natation' |'Crossfit' |'Yoga' |'Pilates';
 setType(newType);
 if (newType ==='Repos') {
 setDuration('');
}
}}
 >
 <SelectTrigger id="workout-type" className="focus:ring-2 focus:ring-primary">
 <SelectValue placeholder="Sélectionner le type de séance" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Musculation">💪 Musculation</SelectItem>
 <SelectItem value="Cardio">❤️ Cardio</SelectItem>
 <SelectItem value="Étirement">🧘 Étirement</SelectItem>
 <SelectItem value="Cours collectif">👥 Cours collectif</SelectItem>
 <SelectItem value="Gainage">🎯 Gainage</SelectItem>
 <SelectItem value="Natation">🏊 Natation</SelectItem>
 <SelectItem value="Crossfit">⚡ Crossfit</SelectItem>
 <SelectItem value="Yoga">🕉️ Yoga</SelectItem>
 <SelectItem value="Pilates">🤸 Pilates</SelectItem>
 <SelectItem value="Repos">😴 Jour de repos</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="workout-time" className="block font-medium mb-2">Heure prévue</Label>
 <Input
 id="workout-time"
 type="time"
 value={startTime}
 onChange={e => setStartTime(e.target.value)}
 className="focus:ring-2 focus:ring-primary"
 placeholder="Ex: 18:00"
 />
 </div>
 <div>
 <Label htmlFor="workout-duration" className="block font-medium mb-2">
 Durée (minutes) {type ==='Repos' && <span className="text-sm text-gray-600">(optionnel pour les jours de repos)</span>}
 </Label>
 <Input
 id="workout-duration"
 type="number"
 min={0}
 value={duration}
 onChange={e => setDuration(e.target.value ==='' ?'' : Math.max(0, Number(e.target.value)))}
 className="focus:ring-2 focus:ring-primary"
 placeholder={type ==='Repos' ?'Durée libre pour les jours de repos' :'Ex: 30'}
 disabled={type ==='Repos'}
 />
 </div>
 <div>
 <Label htmlFor="workout-status" className="block font-medium mb-2">Statut de la séance</Label>
 <Select value={status} onValueChange={(value) => setStatus(value as'Planifié' |'Réalisé' |'Annulé')}>
 <SelectTrigger id="workout-status" className="focus:ring-2 focus:ring-primary">
 <SelectValue placeholder="Sélectionner le statut" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Planifié">Planifiée</SelectItem>
 <SelectItem value="Réalisé">Réalisée</SelectItem>
 <SelectItem value="Annulé">Annulée</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="workout-notes" className="block font-medium mb-2">Notes</Label>
 <Textarea 
 id="workout-notes"
 value={notes} 
 onChange={e => setNotes(e.target.value)} 
 className="focus:ring-2 focus:ring-primary" 
 rows={3} 
 />
 </div>
 <Button
 type="submit"
 disabled={loading}
 className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2"
 aria-label="Enregistrer les modifications de la séance"
 >
 <Save className="h-4 w-4 mr-2" />
 <span>{loading ?'Enregistrement...' :'Enregistrer'}</span>
 </Button>
 <Button
 type="button"
 variant="destructive"
 onClick={handleDelete}
 disabled={loading}
 className="w-full mt-2 font-semibold py-2"
 >
 <span>🗑️ Supprimer la séance</span>
 </Button>
 </motion.form>
 <Mascot message={mascotMsg || undefined} type={mascotType} show={showMascot} onClose={() => setShowMascot(false)} />
 </div>
 )
} 