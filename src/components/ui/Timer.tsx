'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'

interface TimerProps {
  initialTime?: number // en secondes
  onComplete?: () => void
  autoStart?: boolean
  showControls?: boolean
}

export default function Timer({ 
  initialTime = 60, 
  onComplete, 
  autoStart = false,
  showControls = true 
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isMuted, setIsMuted] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Créer l'élément audio pour les notifications
    audioRef.current = new Audio('/notification.mp3') // On ajoutera ce fichier plus tard
    audioRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            if (!isMuted && audioRef.current) {
              audioRef.current.play().catch(console.error)
            }
            setShowNotification(true)
            if (onComplete) setTimeout(onComplete, 0)
            return 0
          }
          return prev - 1
        })
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
  }, [isRunning, timeLeft, isMuted, onComplete])

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(initialTime)
    setShowNotification(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((initialTime - timeLeft) / initialTime) * 100

  return (
    <div className="relative">
      {/* Timer principal */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
        {/* Barre de progression */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-orange-600 rounded-t-2xl overflow-hidden">
          <motion.div
            className="h-full bg-yellow-300"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>

        {/* Affichage du temps */}
        <div className="text-center mb-4">
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <p className="text-orange-100 text-sm">Temps de repos</p>
        </div>

        {/* Contrôles */}
        {showControls && (
          <div className="flex justify-center space-x-4">
            {!isRunning ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startTimer}
                className="bg-green-500 hover:bg-green-600 p-3 rounded-full transition-colors"
                disabled={timeLeft === 0}
              >
                <Play className="h-5 w-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={pauseTimer}
                className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full transition-colors"
              >
                <Pause className="h-5 w-5" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetTimer}
              className="bg-gray-500 hover:bg-gray-600 p-3 rounded-full transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </motion.button>
          </div>
        )}
      </div>

      {/* Notification de fin */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="font-semibold">Temps écoulé !</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Composant pour les temps de repos rapides
export function QuickTimer() {
  const [selectedTime, setSelectedTime] = useState(60)
  const [showTimer, setShowTimer] = useState(false)

  const quickTimes = [30, 60, 90, 120, 180]

  if (showTimer) {
    return (
      <div className="space-y-4 w-full">
        <Timer 
          initialTime={selectedTime} 
          onComplete={() => setShowTimer(false)}
          autoStart={true}
        />
        <button
          onClick={() => setShowTimer(false)}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Fermer
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md w-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Temps de repos rapide</h2>
      <div className="grid grid-cols-3 gap-2">
        {quickTimes.map((time) => (
          <button
            key={time}
            onClick={() => {
              setSelectedTime(time)
              setShowTimer(true)
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-0 rounded-lg transition-colors text-sm font-bold w-full"
            style={{minWidth: 0}}
          >
            {time}s
          </button>
        ))}
      </div>
    </div>
  )
} 