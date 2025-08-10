'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface FormField2025Props {
  label: string
  children: ReactNode
  error?: string
  success?: string
  helpText?: string
  required?: boolean
  className?: string
  labelClassName?: string
}

export function FormField2025({
  label,
  children,
  error,
  success,
  helpText,
  required = false,
  className = '',
  labelClassName = ''
}: FormField2025Props) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label avec indicateur requis */}
      <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Champ de saisie */}
      <div className="relative">
        {children}
        
        {/* Icône de statut */}
        {(error || success) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error && <AlertCircle className="h-4 w-4 text-red-500" />}
            {success && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>

      {/* Messages d'aide et d'erreur */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </motion.p>
      )}

      {success && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-green-600 flex items-center gap-1"
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {success}
        </motion.p>
      )}

      {helpText && !error && !success && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}