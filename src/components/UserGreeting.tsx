'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { motion } from 'framer-motion'

interface UserGreetingProps {
  className?: string
  showError?: boolean
}

export default function UserGreeting({ className = '', showError = false }: UserGreetingProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { displayName, isLoading: profileLoading, error } = useUserProfile()
  
  const isLoading = authLoading || (isAuthenticated && profileLoading)

  if (isLoading) {
    return (
      <div className={`animate-pulse text-center ${className}`} style={{ minHeight: '120px' }}>
        <div className="h-8 bg-white/20 rounded-lg w-64 mx-auto mb-4"></div>
        <div className="h-6 bg-white/10 rounded-lg w-80 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`} style={{ minHeight: '120px' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold mb-4">
          Bonjour {displayName} ! 💪
        </h1>
        <p className="text-xl text-orange-100">
          Prêt pour une nouvelle séance de musculation ?
        </p>
        {showError && error && (
          <p className="text-sm text-orange-200 mt-2">
            ⚠️ Erreur de profil : {error}
          </p>
        )}
      </motion.div>
    </div>
  )
}