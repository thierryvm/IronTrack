import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react'

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

export default function SessionTimerSimple({ steps, autoStart = false, onComplete }: SessionTimerProps) {
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
    const url = steps[currentStep]?.soundUrl || '/notification.mp3'
    const isSupported = url && typeof url === 'string' && url.trim() !== '' &&
      (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg'))
    if (!isSupported) {
      audioRef.current = null
      return
    }
    audioRef.current = new Audio(url)
    audioRef.current.loop = false
    audioRef.current.volume = 0.5
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
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-2xl p-6 text-white shadow-xl border border-slate-700">
      {/* Barre de progression */}
      <div className="w-full bg-slate-700 rounded-full h-3 mb-6">
        <div
          className="bg-orange-500 h-3 rounded-full transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Informations de l'étape courante */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 text-slate-100">{currentStepInfo.name}</h3>
        <p className="text-slate-400 mb-4">
          Étape {currentStep + 1} sur {steps.length}
        </p>
        
        <div className="text-6xl font-bold mb-4">
          {formatTime(timeLeft)}
        </div>
        
        {showNotification && (
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4 animate-pulse border border-green-500">
            {currentStep === steps.length - 1 ? 'Session terminée !' : 'Étape suivante...'}
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="flex justify-center items-center gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-full transition-colors border border-slate-600"
        >
          <SkipBack className="h-5 w-5" />
        </button>

        <button
          onClick={handlePlayPause}
          className="bg-orange-600 hover:bg-orange-700 p-4 rounded-full transition-colors shadow-lg"
        >
          {isRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-full transition-colors border border-slate-600"
        >
          <SkipForward className="h-5 w-5" />
        </button>

        <button
          onClick={handleReset}
          className="bg-slate-700 hover:bg-slate-600 p-3 rounded-full transition-colors border border-slate-600"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full transition-colors border ${
            isMuted 
              ? 'bg-red-600 hover:bg-red-700 border-red-500' 
              : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
          }`}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Liste des étapes */}
      <div className="mt-6 space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
              index === currentStep 
                ? 'bg-orange-600/20 border border-orange-500/50' 
                : index < currentStep 
                  ? 'bg-green-600/20 border border-green-500/50'
                  : 'bg-slate-700/50 border border-slate-600'
            }`}
          >
            <span className="font-medium text-slate-100">{step.name}</span>
            <span className="text-sm text-slate-300">
              {formatTime(step.duration)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}