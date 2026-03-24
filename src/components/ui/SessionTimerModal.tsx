'use client'

import React, { useState} from'react'
import { X, Play, Plus, Trash2, Edit3, Clock} from'lucide-react'
import { Button} from'@/components/ui/button'
import SessionTimerSimple from'@/components/ui/SessionTimerSimple'

interface Step {
 name: string
 duration: number
}

interface UserSound {
 id: string
 name: string
 file_url: string
 created_at: string
}

interface SessionTimerModalProps {
 steps: Step[]
 userSounds: UserSound[]
 sessionSounds: (string | null)[]
 onClose: () => void
 onStepsChange: (steps: Step[]) => void
 onSoundsChange: (sounds: (string | null)[]) => void
}

export default function SessionTimerModal({
 steps,
 sessionSounds,
 onClose,
 onStepsChange,
 onSoundsChange
}: SessionTimerModalProps) {
 const [isRunning, setIsRunning] = useState(false)
 const [editingStep, setEditingStep] = useState<number | null>(null)
 const [editForm, setEditForm] = useState({ name:'', duration: 0, unit:'sec' as'sec' |'min'})

 const handleStartTimer = () => {
 setIsRunning(true)
}

 const handleTimerComplete = () => {
 setIsRunning(false)
}

 const handleAddStep = () => {
 const newStep = { name:'Nouvel exercice', duration: 60}
 onStepsChange([...steps, newStep])
 onSoundsChange([...sessionSounds, null])
}

 const handleEditStep = (index: number) => {
 setEditingStep(index)
 const duration = steps[index].duration
 setEditForm({
 name: steps[index].name,
 duration: duration,
 unit: duration >= 60 ?'min' :'sec'
})
}

 const handleSaveEdit = () => {
 if (editingStep !== null) {
 const newSteps = [...steps]
 newSteps[editingStep] = { name: editForm.name, duration: editForm.duration}
 onStepsChange(newSteps)
 setEditingStep(null)
}
}

 const handleDeleteStep = (index: number) => {
 if (steps.length > 1) {
 const newSteps = steps.filter((_, i) => i !== index)
 const newSounds = sessionSounds.filter((_, i) => i !== index)
 onStepsChange(newSteps)
 onSoundsChange(newSounds)
}
}

 const formatTime = (seconds: number) => {
 const mins = Math.floor(seconds / 60)
 const secs = seconds % 60
 if (mins >= 60) {
 const hours = Math.floor(mins / 60)
 const remainingMins = mins % 60
 if (remainingMins === 0 && secs === 0) {
 return `${hours}h`
} else if (secs === 0) {
 return `${hours}h ${remainingMins}min`
}
 return `${hours}h ${remainingMins}min ${secs}s`
}
 if (secs === 0) {
 return `${mins}min`
}
 return `${mins}min ${secs}s`
}

 const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0)

 if (isRunning) {
 return (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
 <div className="w-full max-w-lg mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative rounded-2xl !bg-slate-100">
 <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-2 rounded-t-2xl" style={{ background:'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.8))', backdropFilter:'blur(8px)'}}>
 <h3 className="text-lg font-bold text-white">Session en cours</h3>
 <div className="flex gap-2">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => setIsRunning(false)}
 className="bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-400/30 font-semibold backdrop-blur"
 >
 Arrêter
 </Button>
 <Button
 variant="secondary"
 size="sm"
 onClick={onClose}
 className="bg-slate-500/20 text-muted-foreground hover:bg-slate-500/30 border border-slate-400/30 backdrop-blur"
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 </div>
 
 <SessionTimerSimple
 steps={steps.map((step, index) => ({
 ...step,
 soundUrl: sessionSounds[index] || undefined
}))}
 autoStart={true}
 onComplete={handleTimerComplete}
 />
 </div>
 </div>
 )
}

 return (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
 <div className="bg-card rounded-xl p-2 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
 <div className="flex-1 min-w-0">
 <h3 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
 <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
 <span className="truncate">Timer de session</span>
 </h3>
 <p className="text-xs sm:text-sm text-gray-600 mt-1">
 <span className="sm:hidden">
 {formatTime(totalDuration)} • {steps.length} étapes
 </span>
 <span className="hidden sm:inline">
 Durée totale: {formatTime(totalDuration)} • {steps.length} étapes
 </span>
 </p>
 </div>
 <Button
 variant="secondary"
 size="sm"
 onClick={onClose}
 className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 border border-orange-200 flex-shrink-0 ml-2"
 >
 <X className="h-4 w-4" />
 </Button>
 </div>

 <div className="space-y-4 mb-6">
 {steps.map((step, index) => (
 <div key={index} className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg border border-border">
 {editingStep === index ? (
 <div className="flex-1 flex gap-2">
 <input
 type="text"
 value={editForm.name}
 onChange={(e) => setEditForm({ ...editForm, name: e.target.value})}
 className="flex-1 px-2 py-2 border border-border rounded-lg bg-card text-foreground placeholder-gray-500"
 placeholder="Nom de l'exercice"
 />
 <div className="flex items-center gap-2">
 <input
 type="number"
 value={editForm.unit ==='min' ? Math.floor(editForm.duration / 60) : editForm.duration}
 onChange={(e) => {
 const value = parseInt(e.target.value) || 0
 const newDuration = editForm.unit ==='min' ? value * 60 : value
 setEditForm({ ...editForm, duration: newDuration})
}}
 className="w-20 px-2 py-2 border border-border rounded-lg bg-card text-foreground placeholder-gray-500 text-center font-medium"
 placeholder={editForm.unit ==='min' ?'5' :'300'}
 min="1"
 max={editForm.unit ==='min' ? 60 : 3600}
 />
 <select
 value={editForm.unit}
 onChange={(e) => {
 const newUnit = e.target.value as'sec' |'min'
 setEditForm({ ...editForm, unit: newUnit})
}}
 className="px-2 py-2 pr-8 border border-border rounded-lg bg-card text-foreground text-sm font-medium appearance-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
 style={{
 backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e")`,
 backgroundRepeat:'no-repeat',
 backgroundPosition:'right 8px center',
 backgroundSize:'16px'
}}
 >
 <option value="sec">secondes</option>
 <option value="min">minutes</option>
 </select>
 </div>
 <Button 
 size="sm" 
 onClick={handleSaveEdit}
 className="bg-green-600 hover:bg-green-700 text-white"
 >
 Sauver
 </Button>
 <Button 
 size="sm" 
 variant="secondary" 
 onClick={() => setEditingStep(null)}
 className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 border border-border"
 >
 Annuler
 </Button>
 </div>
 ) : (
 <>
 <div className="flex-1">
 <h4 className="font-semibold text-foreground">{step.name}</h4>
 <p className="text-sm text-gray-700">
 Étape {index + 1} • {formatTime(step.duration)}
 </p>
 </div>
 <div className="flex gap-1">
 <Button
 size="sm"
 variant="secondary"
 onClick={() => handleEditStep(index)}
 className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 border border-blue-200"
 >
 <Edit3 className="h-4 w-4" />
 </Button>
 {steps.length > 1 && (
 <Button
 size="sm"
 variant="destructive"
 onClick={() => handleDeleteStep(index)}
 className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 border border-red-200"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 )}
 </div>
 </>
 )}
 </div>
 ))}
 </div>

 <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
 <Button
 className="flex-1 bg-primary hover:bg-primary-hover dark:bg-orange-700 text-white font-semibold"
 onClick={handleStartTimer}
 >
 <Play className="h-4 w-4 mr-2" />
 <span className="sm:hidden">Démarrer ({steps.length})</span>
 <span className="hidden sm:inline">Démarrer la session ({steps.length} étapes)</span>
 </Button>
 <Button
 variant="secondary"
 onClick={handleAddStep}
 className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 border border-green-200 sm:w-auto"
 >
 <Plus className="h-4 w-4 mr-0 sm:mr-2" />
 <span className="hidden sm:inline">Ajouter étape</span>
 <span className="sm:hidden">Ajouter</span>
 </Button>
 </div>
 </div>
 </div>
 )
}