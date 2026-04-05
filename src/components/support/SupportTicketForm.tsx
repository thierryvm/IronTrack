'use client'

import { useState, useEffect} from'react'
import { motion} from'framer-motion'
import { Bug, Lightbulb, HelpCircle, MessageSquare, User, CreditCard, Send, AlertTriangle, Info, Paperclip} from'lucide-react'
import { SupportTicketCategory, CreateTicketRequest} from'@/types/support'
import { useSupport} from'@/hooks/useSupport'
import { SecureFileUpload} from'./SecureFileUpload'
import { SecureAttachment} from'@/utils/fileUpload'

interface SupportTicketFormProps {
 onSuccess?: () => void
 initialCategory?: SupportTicketCategory
 className?: string
}

const categoryConfig = {
 bug: {
 icon: Bug,
 label:'Signaler un bug',
 description:'Un problème technique ou une erreur dans l\'application',
 color:'red',
 priority:'high' as const
},
 feature: {
 icon: Lightbulb,
 label:'Nouvelle fonctionnalité',
 description:'Suggérer une amélioration ou une nouvelle fonctionnalité',
 color:'green',
 priority:'medium' as const
},
 help: {
 icon: HelpCircle,
 label:'Demande d\'aide',
 description:'Besoin d\'aide pour utiliser l\'application',
 color:'blue',
 priority:'medium' as const
},
 feedback: {
 icon: MessageSquare,
 label:'Feedback général',
 description:'Commentaires, suggestions ou opinions générales',
 color:'purple',
 priority:'low' as const
},
 account: {
 icon: User,
 label:'Problème de compte',
 description:'Problème avec votre compte ou vos données',
 color:'orange',
 priority:'high' as const
},
 payment: {
 icon: CreditCard,
 label:'Problème de paiement',
 description:'Questions relatives aux abonnements ou paiements',
 color:'yellow',
 priority:'high' as const
}
}

export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({
 onSuccess,
 initialCategory ='help',
 className =''
}) => {
 const [selectedCategory, setSelectedCategory] = useState<SupportTicketCategory>(initialCategory)
 const [title, setTitle] = useState('')
 const [description, setDescription] = useState('')
 const [attachments, setAttachments] = useState<SecureAttachment[]>([])
 const [showSuccess, setShowSuccess] = useState(false)

 const { createTicket, loading, error} = useSupport()

 // Mettre à jour la catégorie sélectionnée quand initialCategory change
 useEffect(() => {
 setSelectedCategory(initialCategory)
}, [initialCategory])

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()

 if (!title.trim() || !description.trim()) {
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
 red:'bg-red-50 border-red-200 text-red-700',
 green:'bg-green-50 border-green-200 text-green-700',
 blue:'bg-tertiary/8 border-tertiary/25 text-tertiary',
 purple:'bg-purple-50 border-purple-200 text-purple-700',
 orange:'bg-orange-50 border-orange-200 text-orange-700',
 yellow:'bg-yellow-50 border-yellow-200 text-yellow-700'
}[config.color]
}
 return'bg-card border-border text-foreground hover:bg-muted'
}

 if (showSuccess) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.8}}
 animate={{ opacity: 1, scale: 1}}
 className={`bg-card rounded-xl shadow-md p-8 text-center ${className}`}
 >
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <Send className="h-8 w-8 text-safe-success" />
 </div>
 <h3 className="text-xl font-bold text-foreground mb-2">Ticket envoyé avec succès !</h3>
 <p className="text-muted-foreground mb-4">
 Votre demande a été envoyée à notre équipe de support. 
 Nous vous répondrons dans les plus brefs délais.
 </p>
 <div className="bg-green-50 border border-green-200 rounded-lg p-2">
 <p className="text-green-800 text-sm">
 💡 Vous pouvez suivre le statut de votre ticket dans votre profil
 </p>
 </div>
 </motion.div>
 )
}

 return (
 <div className={`bg-card rounded-xl shadow-md p-6 ${className}`}>
 <div className="mb-6">
 <h2 className="text-xl font-bold text-foreground mb-2">Contacter le Support</h2>
 <p className="text-muted-foreground">
 Décrivez votre problème ou demande, notre équipe vous répondra rapidement.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Sélection de catégorie */}
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Type de demande
 </label>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
 {(Object.entries(categoryConfig) as [SupportTicketCategory, typeof categoryConfig[SupportTicketCategory]][]).map(([category, config]) => {
 const Icon = config.icon
 const isSelected = selectedCategory === category
 
 return (
 <button
 key={category}
 type="button"
 onClick={() => setSelectedCategory(category)}
 className={`p-4 border-2 rounded-lg text-left transition-all ${getCategoryStyle(category, isSelected)}`}
 >
 <div className="flex items-start space-x-2">
 <Icon className="h-5 w-5 flex-shrink-0 mt-1" />
 <div>
 <p className="font-medium text-sm">{config.label}</p>
 <p className="text-xs opacity-75 mt-1">{config.description}</p>
 </div>
 </div>
 </button>
 )
})}
 </div>
 </div>

 {/* Titre */}
 <div>
 <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
 Titre de votre demande *
 </label>
 <input
 type="text"
 id="title"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 required
 maxLength={200}
 placeholder="Décrivez brièvement votre problème..."
 className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
 />
 <p className="text-xs text-gray-600 mt-1">{title.length}/200 caractères</p>
 </div>

 {/* Description */}
 <div>
 <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
 Description détaillée *
 </label>
 <textarea
 id="description"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 required
 rows={6}
 placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, plus nous pourrons vous aider efficacement..."
 className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
 />
 <p className="text-xs text-gray-600 mt-1">{description.length} caractères</p>
 </div>

 {/* Upload d'images */}
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 <Paperclip className="h-6 w-6 inline mr-1" />
 Images et captures d'écran (optionnel)
 </label>
 <SecureFileUpload
 onUploadComplete={(newAttachments) => {
 setAttachments(prev => [...prev, ...newAttachments])
}}
 maxFiles={5}
 disabled={loading}
 />
 
 {/* Liste des fichiers attachés */}
 {attachments.length > 0 && (
 <div className="mt-4">
 <h4 className="text-sm font-medium text-foreground mb-2">
 Fichiers attachés ({attachments.length})
 </h4>
 <div className="space-y-2">
 {attachments.map((attachment) => (
 <div
 key={attachment.id}
 className="flex items-center justify-between bg-muted rounded-lg p-2"
 >
 <div className="flex items-center space-x-2">
 <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
 <Paperclip className="h-6 w-6 text-green-600" />
 </div>
 <div>
 <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
 {attachment.originalName}
 </p>
 <p className="text-xs text-gray-600">
 {(attachment.size / 1024 / 1024).toFixed(1)}MB • {attachment.type}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => {
 setAttachments(prev => prev.filter(a => a.id !== attachment.id))
}}
 className="text-foreground hover:text-safe-error p-1"
 aria-label="Supprimer fichier"
 >
 <Send className="h-6 w-6 rotate-45" />
 </button>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Informations automatiques */}
 <div className="bg-muted rounded-lg p-4">
 <div className="flex items-start space-x-2">
 <Info className="h-5 w-5 text-safe-info flex-shrink-0 mt-1" />
 <div>
 <p className="text-sm font-medium text-foreground mb-1">Informations techniques automatiques</p>
 <p className="text-xs text-muted-foreground">
 Les informations de votre navigateur, page actuelle et données techniques 
 seront automatiquement incluses pour nous aider à diagnostiquer le problème.
 </p>
 </div>
 </div>
 </div>

 {/* Messages d'erreur */}
 {error && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-2">
 <div className="flex items-center space-x-2">
 <AlertTriangle className="h-5 w-5 text-safe-error" />
 <p className="text-red-800 text-sm">{error}</p>
 </div>
 </div>
 )}

 {/* Bouton d'envoi */}
 <button
 type="submit"
 disabled={loading || !title.trim() || !description.trim()}
 className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
 >
 {loading ? (
 <>
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
 <span>Envoi en cours...</span>
 </>
 ) : (
 <>
 <Send className="h-5 w-5" />
 <span>Envoyer la demande</span>
 </>
 )}
 </button>
 </form>
 </div>
 )
}
