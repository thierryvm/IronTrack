'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface UserGreetingProps {
  className?: string
  showError?: boolean
}

export default function UserGreeting({ className = '', showError = false }: UserGreetingProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { displayName, isLoading: profileLoading, error } = useUserProfile()
  const [useMotion, setUseMotion] = useState(false)
  
  const isLoading = authLoading || (isAuthenticated && profileLoading)

  // Activer les animations après le premier rendu (améliore LCP)
  useEffect(() => {
    const timer = setTimeout(() => setUseMotion(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Skeleton optimisé pour LCP - Dimensions exactes
  if (isLoading) {
    return (
      <div className={`text-center ${className}`} style={{ minHeight: '120px' }}>
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded-lg w-64 mx-auto mb-4"></div>
          <div className="h-6 bg-white/10 rounded-lg w-80 mx-auto"></div>
        </div>
      </div>
    )
  }

  // Contenu sans animation pour LCP critique
  const content = (
    <>
      <h1 className="text-4xl font-bold mb-4">
        Bonjour {displayName} ! 💪
      </h1>
      <p className="text-xl text-white/90">
        Prêt pour une nouvelle séance de musculation ?
      </p>
      {showError && error && (
        <p className="text-sm text-white/80 mt-2">
          ⚠️ Erreur de profil : {error}
        </p>
      )}
    </>
  )

  return (
    <div className={`text-center ${className}`} style={{ minHeight: '120px' }}>
      {useMotion ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      ) : (
        <div>{content}</div>
      )}
    </div>
  )
}