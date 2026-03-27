import React, { useState, useRef, useEffect} from'react'
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Volume2, VolumeX} from'lucide-react'

interface Step {
 name: string
 duration: number // en secondes
 color?: string
 soundUrl?: string
}

interface SessionTimerProps {
 steps: Step[]
 autoStart?: boolean
 onComplete?: () => void
}

export default function SessionTimerSimple({ steps, autoStart = false, onComplete}: SessionTimerProps) {
 const [currentStep, setCurrentStep] = useState(0)
 const [timeLeft, setTimeLeft] = useState(steps[0]?.duration || 0)
 const [isRunning, setIsRunning] = useState(autoStart)
 const [isMuted, setIsMuted] = useState(false)
 const [showNotification, setShowNotification] = useState(false)
 const intervalRef = useRef<NodeJS.Timeout | null>(null)
 const audioRef = useRef<HTMLAudioElement | null>(null)
 const hasPlayedEndSound = useRef(false)

 useEffect(() => {
 setTimeLeft(steps[currentStep]?.duration || 0)
 setShowNotification(false)
 hasPlayedEndSound.current = false
}, [currentStep, steps])

 useEffect(() => {
 // Utilise l'URL du son de l'étape courante, ou notification par défaut
 const url = steps[currentStep]?.soundUrl ||'/notification.mp3'
 const isSupported = url && typeof url ==='string' && url.trim() !=='' &&
 (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg'))
 
 if (!isSupported) {
 audioRef.current = null
 return
}

 // Créer l'audio seulement quand nécessaire, avec gestion d'erreur
 try {
 const audio = new Audio()
 audio.preload ='none' // Ne pas précharger automatiquement
 audio.src = url
 audio.loop = false
 audio.volume = 0.5
 
 // Gestion d'erreur silencieuse
 audio.addEventListener('error', () => {
 console.warn(`Audio file not available: ${url}`)
 audioRef.current = null
})
 
 audioRef.current = audio
} catch (error) {
 console.warn(`Failed to create audio: ${error}`)
 audioRef.current = null
}
}, [currentStep, steps])

 useEffect(() => {
 if (!audioRef.current) return
 if (isMuted) return
 // À la fin de l'étape
 if (timeLeft === 0 && !hasPlayedEndSound.current) {
 try {
 audioRef.current.currentTime = 0
 audioRef.current.play().catch(() => {})
 hasPlayedEndSound.current = true
} catch {}
}
 // Toutes les 30s (mais pas à la fin)
 else if (timeLeft > 0 && timeLeft !== steps[currentStep]?.duration && timeLeft % 30 === 0) {
 try {
 audioRef.current.currentTime = 0
 audioRef.current.play().catch(() => {})
} catch {}
}
}, [timeLeft, isMuted, currentStep, steps])

 useEffect(() => {
 if (isRunning && timeLeft > 0) {
 intervalRef.current = setInterval(() => {
 setTimeLeft((prev) => Math.max(prev - 1, 0))
}, 1000)
} else {
 if (intervalRef.current) {
 clearInterval(intervalRef.current)
}
}
 return () => {
 if (intervalRef.current) {
 clearInterval(intervalRef.current)
}
}
}, [isRunning, timeLeft])

 // Gère la transition de fin d'étape
 useEffect(() => {
 if (timeLeft === 0 && isRunning) {
 setIsRunning(false)
 setShowNotification(true)
 hasPlayedEndSound.current = false
 if (currentStep < steps.length - 1) {
 setTimeout(() => {
 setCurrentStep((s) => s + 1)
 setTimeLeft(steps[currentStep + 1]?.duration || 0)
 setShowNotification(false)
 setIsRunning(true)
}, 1500)
} else {
 setTimeout(() => {
 setShowNotification(false)
 if (onComplete) onComplete()
}, 2000)
}
}
}, [timeLeft, isRunning, currentStep, steps, onComplete])

 const handlePlayPause = () => {
 setIsRunning(!isRunning)
}

 const handleReset = () => {
 setIsRunning(false)
 setCurrentStep(0)
 setTimeLeft(steps[0]?.duration || 0)
 setShowNotification(false)
}

 const handleNext = () => {
 if (currentStep < steps.length - 1) {
 setCurrentStep(currentStep + 1)
 setIsRunning(false)
}
}

 const handlePrevious = () => {
 if (currentStep > 0) {
 setCurrentStep(currentStep - 1)
 setIsRunning(false)
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

 const progressPercent = steps[currentStep] ? 
 ((steps[currentStep].duration - timeLeft) / steps[currentStep].duration) * 100 : 0

 const currentStepInfo = steps[currentStep]
 if (!currentStepInfo) return null

 return (
 <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl" data-timer="v2">
 {/* Barre de progression fine */}
 <div className="h-0.5 bg-border w-full">
 <div
 className="h-full bg-primary transition-all duration-1000 ease-in-out"
 style={{ width: `${progressPercent}%` }}
 />
 </div>

 <div className="pt-10 px-2 sm:px-6 pb-2 sm:pb-6">
 {/* Informations de l'étape courante */}
 <div className="text-center mb-4 sm:mb-6">
 <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 text-foreground px-2">{currentStepInfo.name}</h3>
 <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-widest mb-2 sm:mb-4">
 Étape {currentStep + 1} / {steps.length}
 </p>

 <div className="text-5xl sm:text-7xl font-bold tabular-nums tracking-tight text-foreground mb-2 sm:mb-4">
 {formatTime(timeLeft)}
 </div>

 {showNotification && (
 <div className="bg-success/15 text-success border border-success/30 px-3 sm:px-4 py-2 rounded-lg mb-2 sm:mb-4 text-sm sm:text-base font-medium">
 {currentStep === steps.length - 1 ? 'Session terminée !' : 'Étape suivante...'}
 </div>
 )}
 </div>

 {/* Contrôles */}
 <div className="grid grid-cols-5 gap-2 sm:flex sm:justify-center sm:items-center sm:gap-4 mb-4 sm:mb-6">
 <button
 onClick={handlePrevious}
 disabled={currentStep === 0}
 className="bg-secondary hover:bg-secondary-hover text-secondary-foreground disabled:opacity-30 disabled:cursor-not-allowed p-2 sm:p-3 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
 aria-label="Étape précédente"
 >
 <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
 </button>

 <button
 onClick={handlePlayPause}
 className="bg-primary hover:bg-primary-hover text-primary-foreground p-3 sm:p-4 rounded-full transition-colors shadow-lg flex items-center justify-center col-span-1 min-h-[44px] min-w-[44px]"
 aria-label={isRunning ? 'Pause' : 'Démarrer'}
 >
 {isRunning ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6" />}
 </button>

 <button
 onClick={handleNext}
 disabled={currentStep === steps.length - 1}
 className="bg-secondary hover:bg-secondary-hover text-secondary-foreground disabled:opacity-30 disabled:cursor-not-allowed p-2 sm:p-3 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
 aria-label="Étape suivante"
 >
 <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
 </button>

 <button
 onClick={handleReset}
 className="bg-secondary hover:bg-secondary-hover text-secondary-foreground p-2 sm:p-3 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
 aria-label="Réinitialiser"
 >
 <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
 </button>

 <button
 onClick={() => setIsMuted(!isMuted)}
 className={`p-2 sm:p-3 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] ${
 isMuted
 ? 'bg-destructive hover:bg-destructive-hover text-destructive-foreground'
 : 'bg-secondary hover:bg-secondary-hover text-secondary-foreground'
 }`}
 aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
 >
 {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
 </button>
 </div>

 {/* Liste des étapes */}
 <div>
 <div className="sm:hidden mb-2">
 <details className="group">
 <summary className="flex justify-between items-center p-2 bg-secondary/50 rounded-lg cursor-pointer list-none">
 <span className="font-medium text-muted-foreground text-sm">Toutes les étapes</span>
 <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
 </summary>
 <div className="mt-2 space-y-1.5">
 {steps.map((step, index) => (
 <div
 key={index}
 className={`flex justify-between items-center p-2 rounded-lg transition-colors text-sm ${
 index === currentStep
 ? 'bg-primary/10 border border-primary/30'
 : index < currentStep
 ? 'bg-success/10 border border-success/20'
 : 'bg-secondary/40 border border-border'
 }`}
 >
 <span className={`font-medium truncate pr-2 ${index === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step.name}</span>
 <span className="text-xs text-muted-foreground whitespace-nowrap">
 {formatTime(step.duration)}
 </span>
 </div>
 ))}
 </div>
 </details>
 </div>

 <div className="hidden sm:block space-y-1.5">
 {steps.map((step, index) => (
 <div
 key={index}
 className={`flex justify-between items-center px-3 py-2 rounded-lg transition-colors ${
 index === currentStep
 ? 'bg-primary/10 border border-primary/30'
 : index < currentStep
 ? 'bg-success/10 border border-success/20'
 : 'bg-secondary/40 border border-border'
 }`}
 >
 <span className={`font-medium text-sm ${index === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step.name}</span>
 <span className="text-sm text-muted-foreground">
 {formatTime(step.duration)}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )
}