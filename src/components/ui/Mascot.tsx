'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Trophy, Flame, Target, Zap } from 'lucide-react'

interface MascotProps {
  message?: string
  type?: 'motivation' | 'success' | 'warning' | 'info'
  show?: boolean
  onClose?: () => void
}

const messages = {
  motivation: [
    "Allez Thierry, tu vas y arriver ! 💪",
    "Un exercice de plus, un pas vers tes objectifs ! 🎯",
    "Tu es plus fort que tes excuses ! 🔥",
    "Chaque répétition compte ! ⚡",
    "Reste focus, tu es sur la bonne voie ! 🎯"
  ],
  success: [
    "Excellent travail ! Tu progresses ! 🏆",
    "Nouveau record personnel ! 🎉",
    "Séance terminée avec succès ! 💪",
    "Tu es en feu aujourd'hui ! 🔥",
    "Continue comme ça ! ⚡"
  ],
  warning: [
    "N'oublie pas de bien t'hydrater ! 💧",
    "Écoute ton corps, prends ton temps ! 🫂",
    "La technique avant la charge ! 🎯",
    "Pense à tes temps de repos ! ⏰"
  ],
  info: [
    "Nouveau défi disponible ! 🎯",
    "Tu as débloqué un nouveau badge ! 🏅",
    "Ton ami a battu son record ! 👥",
    "Nouveau tutoriel disponible ! 📹"
  ]
}

const icons = {
  motivation: Flame,
  success: Trophy,
  warning: Target,
  info: Zap
}

export default function Mascot({ message, type = 'motivation', show = false, onClose }: MascotProps) {
  const [currentMessage, setCurrentMessage] = useState(message || messages.motivation[0])
  const [isVisible, setIsVisible] = useState(show)
  const Icon = icons[type]

  useEffect(() => {
    setIsVisible(show)
  }, [show])

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        const messageList = messages[type]
        const randomIndex = Math.floor(Math.random() * messageList.length)
        setCurrentMessage(messageList[randomIndex])
      }, 10000) // Change de message toutes les 10 secondes

      return () => clearInterval(interval)
    }
  }, [message, type])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl p-4 max-w-sm"
          >
            {/* Mascotte */}
            <div className="flex items-center space-x-3 mb-3">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="bg-yellow-300 rounded-full p-2"
              >
                <Dumbbell className="h-6 w-6 text-orange-600" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">IronBuddy</h3>
                <p className="text-xs text-orange-100">Ton coach personnel</p>
              </div>
              <Icon className="h-5 w-5 text-yellow-300" />
            </div>

            {/* Message */}
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-sm mb-3"
            >
              {currentMessage}
            </motion.p>

            {/* Bouton fermer */}
            <button
              onClick={handleClose}
              className="text-orange-100 hover:text-white text-xs transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant pour afficher la mascotte dans les pages
export function MascotWidget() {
  const [showMascot, setShowMascot] = useState(false)

  useEffect(() => {
    // Afficher la mascotte après 3 secondes
    const timer = setTimeout(() => {
      setShowMascot(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Mascot 
      show={showMascot}
      onClose={() => setShowMascot(false)}
    />
  )
} 