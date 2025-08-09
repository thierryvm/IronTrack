'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bug, Lightbulb, HelpCircle, MessageSquare, User, CreditCard, Send, AlertTriangle, Info, Paperclip, CheckCircle } from 'lucide-react'
import { SupportTicketCategory, CreateTicketRequest } from '@/types/support'
import { useSupport } from '@/hooks/useSupport'
import { SecureFileUpload } from './SecureFileUpload'
import { SecureAttachment } from '@/utils/fileUpload'
import { FormField2025 } from '@/components/ui/FormField2025'
import { Input2025 } from '@/components/ui/Input2025'
import { Button2025 } from '@/components/ui/Button2025'
import { Textarea2025 } from '@/components/ui/Textarea2025'

interface SupportTicketForm2025Props {
  onSuccess?: () => void
  initialCategory?: SupportTicketCategory
  className?: string
}

const categoryConfig = {
  bug: {
    icon: Bug,
    label: 'Signaler un bug',
    description: 'Un problème technique ou une erreur dans l\'application',
    color: 'red',
    priority: 'high' as const
  },
  feature: {
    icon: Lightbulb,
    label: 'Nouvelle fonctionnalité',
    description: 'Suggérer une amélioration ou une nouvelle fonctionnalité',
    color: 'green',
    priority: 'medium' as const
  },
  help: {
    icon: HelpCircle,
    label: 'Demande d\'aide',
    description: 'Besoin d\'aide pour utiliser l\'application',
    color: 'blue',
    priority: 'medium' as const
  },
  feedback: {
    icon: MessageSquare,
    label: 'Feedback général',
    description: 'Commentaires, suggestions ou opinions générales',
    color: 'purple',
    priority: 'low' as const
  },
  account: {
    icon: User,
    label: 'Problème de compte',
    description: 'Problème avec votre compte ou vos données',
    color: 'orange',
    priority: 'high' as const
  },
  payment: {
    icon: CreditCard,
    label: 'Problème de paiement',
    description: 'Questions relatives aux abonnements ou paiements',
    color: 'yellow',
    priority: 'high' as const
  }
}

export const SupportTicketForm2025: React.FC<SupportTicketForm2025Props> = ({
  onSuccess,
  initialCategory = 'help',
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SupportTicketCategory>(initialCategory)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<SecureAttachment[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { createTicket, loading, error } = useSupport()

  // Mettre à jour la catégorie sélectionnée quand initialCategory change
  useEffect(() => {
    setSelectedCategory(initialCategory)
  }, [initialCategory])

  // Validation des champs
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Le titre est requis'
    } else if (title.length > 200) {
      newErrors.title = 'Le titre ne peut pas dépasser 200 caractères'
    }

    if (!description.trim()) {
      newErrors.description = 'La description est requise'
    } else if (description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const ticketData: CreateTicketRequest = {
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      priority: categoryConfig[selectedCategory].priority,
      url: window.location.href,
      attachments: attachments.map(att => ({
        name: att.name,
        originalName: att.originalName,
        type: att.type,
        size: att.size,
        url: att.url
      }))
    }

    const result = await createTicket(ticketData)
    
    if (result) {
      setShowSuccess(true)
      setTitle('')
      setDescription('')
      setAttachments([])
      setErrors({})
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess?.()
      }, 3000)
    }
  }

  const getCategoryStyle = (category: SupportTicketCategory, isSelected: boolean) => {
    const config = categoryConfig[category]
    if (isSelected) {
      return {
        red: 'border-red-500 bg-red-100 text-red-700',
        green: 'border-green-500 bg-green-100 text-green-700',
        blue: 'border-blue-500 bg-blue-100 text-blue-700',
        purple: 'border-purple-500 bg-purple-100 text-purple-700',
        orange: 'border-orange-500 bg-orange-100 text-orange-700',
        yellow: 'border-yellow-500 bg-yellow-100 text-yellow-700'
      }[config.color]
    }
    return 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
  }

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center ${className}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-10 w-10 text-green-500" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Ticket envoyé avec succès !</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Votre demande a été envoyée à notre équipe de support. 
          Nous vous répondrons dans les plus brefs délais.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 text-sm font-medium">
            💡 Vous pouvez suivre le statut de votre ticket dans votre profil
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-orange-100 rounded-xl">
            <MessageSquare className="h-6 w-6 text-orange-800" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Contacter le Support</h2>
            <p className="text-gray-600">
              Décrivez votre problème ou demande, notre équipe vous répondra rapidement
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sélection de catégorie */}
          <div>
            <FormField2025 
              label="Type de demande" 
              required
              helpText="Sélectionnez la catégorie qui correspond le mieux à votre demande"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.entries(categoryConfig) as [SupportTicketCategory, typeof categoryConfig[SupportTicketCategory]][]).map(([category, config]) => {
                  const Icon = config.icon
                  const isSelected = selectedCategory === category
                  
                  return (
                    <motion.button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${getCategoryStyle(category, isSelected)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-sm mb-1">{config.label}</p>
                          <p className="text-xs opacity-80 leading-relaxed">{config.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </FormField2025>
          </div>

          {/* Titre */}
          <FormField2025
            label="Titre de votre demande"
            required
            error={errors.title}
            helpText={`${title.length}/200 caractères`}
          >
            <Input2025
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Décrivez brièvement votre problème..."
              isError={!!errors.title}
            />
          </FormField2025>

          {/* Description */}
          <FormField2025
            label="Description détaillée"
            required
            error={errors.description}
            helpText={`${description.length} caractères - Plus vous donnez d'informations, plus nous pourrons vous aider efficacement`}
          >
            <Textarea2025
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Décrivez votre problème en détail..."
              isError={!!errors.description}
              autoResize
            />
          </FormField2025>

          {/* Upload d'images */}
          <FormField2025
            label="Images et captures d'écran"
            helpText="Ajoutez des captures d'écran pour nous aider à mieux comprendre votre problème (optionnel)"
          >
            <div className="space-y-4">
              <SecureFileUpload
                onUploadComplete={(newAttachments) => {
                  setAttachments(prev => [...prev, ...newAttachments])
                }}
                maxFiles={5}
                disabled={loading}
              />
              
              {/* Liste des fichiers attachés */}
              {attachments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                    <Paperclip className="h-4 w-4" />
                    <span>Fichiers attachés ({attachments.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <motion.div
                        key={attachment.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Paperclip className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {attachment.originalName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(attachment.size / 1024 / 1024).toFixed(1)}MB • {attachment.type}
                            </p>
                          </div>
                        </div>
                        <Button2025
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAttachments(prev => prev.filter(a => a.id !== attachment.id))
                          }}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Supprimer fichier"
                        >
                          <Send className="h-4 w-4 rotate-45" />
                        </Button2025>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormField2025>

          {/* Informations automatiques */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Informations techniques automatiques</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Les informations de votre navigateur, page actuelle et données techniques 
                  seront automatiquement incluses pour nous aider à diagnostiquer le problème.
                </p>
              </div>
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </form>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <Button2025
          onClick={handleSubmit}
          loading={loading}
          disabled={!title.trim() || !description.trim()}
          fullWidth
          icon={!loading ? <Send className="h-4 w-4" /> : undefined}
        >
          {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
        </Button2025>
      </div>
    </motion.div>
  )
}