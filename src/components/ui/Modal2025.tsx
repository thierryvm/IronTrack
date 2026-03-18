'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ButtonMigrated } from './ButtonMigrated'

interface Modal2025Props {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full m-4'
}

export function Modal2025({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}: Modal2025Props) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`
              relative w-full ${sizeClasses[size]} mx-4 
              bg-card rounded-xl shadow-2xl
              max-h-[90vh] overflow-hidden
              ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                {title && (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                )}
                {showCloseButton && (
                  <ButtonMigrated
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </ButtonMigrated>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Subcomponents pour structurer le contenu
export function ModalContent({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

export function ModalFooter({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-3 p-6 border-t border-border bg-muted ${className}`}>
      {children}
    </div>
  )
}