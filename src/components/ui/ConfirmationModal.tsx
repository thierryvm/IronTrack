'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger',
  loading = false
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          confirmBg: 'bg-red-500 hover:bg-red-500',
          confirmText: 'text-white'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
          confirmText: 'text-white'
        }
      default:
        return {
          icon: AlertTriangle,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          confirmBg: 'bg-blue-500 hover:bg-blue-600',
          confirmText: 'text-white'
        }
    }
  }

  const styles = getTypeStyles()
  const IconComponent = styles.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 ${styles.iconBg} rounded-full`}>
                  <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-safe-muted" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 ${styles.confirmBg} ${styles.confirmText} py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white dark:border-gray-700/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}