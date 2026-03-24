'use client'

import React, { useState, useEffect} from'react'
import Link from'next/link'
import { HeadphonesIcon, Users, Calendar, Bell, ArrowLeft, ExternalLink, MessageSquare} from'lucide-react'
import { createClient} from'@/utils/supabase/client'
import { useAdminRole} from'@/hooks/useAdminRole'
import { UserTicketsSection} from'@/components/profile/UserTicketsSection'

interface Notification {
 id: string
 type: string
 message: string
 created_at: string
 href?: string
 description?: string
}

export default function NotificationsPage() {
 const [notifications, setNotifications] = useState<Notification[]>([])
 const [loading, setLoading] = useState(true)
 const { isAdmin, isModerator, loading: roleLoading} = useAdminRole()

 useEffect(() => {
 
 // Attendre que les rôles soient chargés avant de récupérer les notifications
 if (roleLoading) {
 return
}

 const loadAllNotifications = async () => {
 try {
 const supabase = createClient()
 
 // Récupérer l'utilisateur connecté pour les tickets personnels
 const { data: { user}} = await supabase.auth.getUser()
 
 // SÉCURITÉ: Charger tickets selon le rôle
 let tickets = null
 let error = null
 
 if (isAdmin || isModerator) {
 // Admin/Modérateurs: TOUS les tickets
 const result = await supabase
 .from('support_tickets')
 .select('*')
 .in('status', ['open','in_progress','waiting_user']) // Pas de'pending' car ENUM DB ne l'a pas
 .order('created_at', { ascending: false})
 tickets = result.data
 error = result.error
} else if (user) {
 // Utilisateurs normaux: UNIQUEMENT leurs propres tickets
 const result = await supabase
 .from('support_tickets')
 .select('*')
 .eq('user_id', user.id)
 .in('status', ['open','in_progress','waiting_user'])
 .order('created_at', { ascending: false})
 tickets = result.data
 error = result.error
}
 
 // Charger toutes les invitations partenaires
 const { data: partnerRequests, error: partnerError} = await supabase
 .from('training_partners')
 .select('*')
 .eq('status','pending')
 .order('created_at', { ascending: false})
 
 if (error) console.warn('Erreur chargement tickets:', error)
 if (partnerError) console.warn('Erreur chargement invitations:', partnerError)
 
 const allNotifications: Notification[] = []
 
 // Ajouter tickets support avec liens appropriés selon le rôle
 if (tickets) {
 tickets.forEach(ticket => {
 allNotifications.push({
 id: `ticket-${ticket.id}`,
 type:'support',
 message: `Ticket Support: ${ticket.title || ticket.description ||'Nouveau ticket'}`,
 created_at: ticket.created_at || new Date().toISOString(),
 // SÉCURITÉ: Liens différents selon le rôle
 href: (isAdmin || isModerator) 
 ? `/admin/tickets/${ticket.id}` 
 : `/support/tickets/${ticket.id}`,
 description: `Status: ${ticket.status ||'En cours'} • Priorité: ${ticket.priority ||'Normale'}`
})
})
}
 
 // Ajouter invitations partenaires
 if (partnerRequests) {
 partnerRequests.forEach(request => {
 allNotifications.push({
 id: `partner-${request.id}`,
 type:'partner',
 message: `Invitation Partenaire: ${request.partner_name || request.partner_email ||'Nouveau partenaire'}`,
 created_at: request.created_at || new Date().toISOString(),
 href: `/training-partners`,
 description:'Invitation en attente de réponse'
})
})
}
 
 // Trier par date (plus récent d'abord)
 allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

 setNotifications(allNotifications)

 // Marquer tous les tickets comme vus pour effacer le badge du header
 if (tickets) {
 const now = new Date().toISOString()
 tickets.forEach(ticket => {
 localStorage.setItem(`ticket_seen_${ticket.id}`, now)
})
 window.dispatchEvent(new Event('ticket-seen'))
}
 
} catch (error) {
 console.error('Error in loadAllNotifications:', error)
} finally {
 setLoading(false)
}
}

 loadAllNotifications()
}, [isAdmin, isModerator, roleLoading])

 const getNotificationIcon = (type: string) => {
 switch (type) {
 case'support':
 return <HeadphonesIcon className="w-5 h-5 text-safe-info" />
 case'partner':
 return <Users className="w-5 h-5 text-safe-success" />
 default:
 return <Bell className="w-5 h-5 text-gray-600" />
}
}

 const getNotificationTypeLabel = (type: string) => {
 switch (type) {
 case'support':
 return'Support'
 case'partner':
 return'Partenaires'
 default:
 return'Notification'
}
}

 if (loading || roleLoading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
 <div className="max-w-4xl mx-auto px-4 py-8">
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
 {[...Array(5)].map((_, i) => (
 <div key={i} className="bg-card border border-border rounded-lg p-4 mb-4">
 <div className="flex items-start gap-4">
 <div className="w-5 h-5 bg-gray-200 rounded"></div>
 <div className="flex-1">
 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )
}

 return (
 <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
 <div className="max-w-4xl mx-auto px-4 py-8">
 {/* Header */}
 <div className="flex items-center gap-4 mb-8">
 <Link 
 href="/"
 className="p-2 rounded-lg hover:bg-muted transition-colors"
 aria-label="Retour à l'accueil"
 >
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <div>
 <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
 <p className="text-muted-foreground">
 Gérer vos notifications et alertes importantes
 </p>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-blue-100 rounded-lg">
 <HeadphonesIcon className="w-5 h-5 text-secondary" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Support</p>
 <p className="text-xl font-bold text-foreground">
 {notifications.filter(n => n.type ==='support').length}
 </p>
 </div>
 </div>
 </div>
 
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-green-100 rounded-lg">
 <Users className="w-5 h-5 text-green-600" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Partenaires</p>
 <p className="text-xl font-bold text-foreground">
 {notifications.filter(n => n.type ==='partner').length}
 </p>
 </div>
 </div>
 </div>
 
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-muted rounded-lg">
 <Bell className="w-5 h-5 text-gray-600" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Total</p>
 <p className="text-xl font-bold text-foreground">
 {notifications.length}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Liste des notifications */}
 <div className="space-y-4">
 {notifications.length > 0 ? (
 notifications.map((notification) => (
 <div key={notification.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
 <div className="p-4">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 mt-1">
 {getNotificationIcon(notification.type)}
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1">
 <p className="text-sm font-medium text-foreground">
 {notification.message}
 </p>
 {notification.description && (
 <p className="text-sm text-muted-foreground mt-1">
 {notification.description}
 </p>
 )}
 <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
 <span className="inline-flex items-center px-2 py-1 rounded-full bg-muted">
 {getNotificationTypeLabel(notification.type)}
 </span>
 <span>
 {new Date(notification.created_at).toLocaleDateString('fr-FR', {
 day:'numeric',
 month:'long',
 year:'numeric',
 hour:'2-digit',
 minute:'2-digit'
})}
 </span>
 </div>
 </div>
 
 {notification.href && (
 <Link 
 href={notification.href}
 className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:bg-brand-900/20 rounded-lg transition-colors"
 >
 Voir
 <ExternalLink className="w-4 h-4" />
 </Link>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="bg-card border border-border rounded-lg p-8 text-center">
 <Bell className="w-12 h-12 text-foreground mx-auto mb-4" />
 <h3 className="text-lg font-medium text-foreground mb-2">
 Aucune notification
 </h3>
 <p className="text-muted-foreground">
 Vous n'avez aucune notification pour le moment.
 </p>
 </div>
 )}
 </div>
 
 {/* Actions rapides */}
 <div className="mt-8 p-4 bg-card border border-border rounded-lg">
 <h3 className="text-sm font-medium text-foreground mb-2">Actions rapides</h3>
 <div className="flex flex-wrap gap-2">
 {/* SÉCURITÉ: Lien admin tickets UNIQUEMENT pour admin/modérateurs */}
 {(isAdmin || isModerator) && (
 <Link 
 href="/admin/tickets" 
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted rounded-lg transition-colors"
 >
 <HeadphonesIcon className="w-4 h-4" />
 Gérer tickets support
 </Link>
 )}
 
 <Link 
 href="/training-partners" 
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted rounded-lg transition-colors"
 >
 <Users className="w-4 h-4" />
 Gérer partenaires
 </Link>
 
 <Link 
 href="/support/contact" 
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted rounded-lg transition-colors"
 >
 <Calendar className="w-4 h-4" />
 Contacter le support
 </Link>
 </div>
 </div>

 {/* 🎫 Section Tickets Support - Sécurisée et Mobile-Optimisée */}
 <div className="mt-8">
 <div className="mb-6">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-orange-100 rounded-lg">
 <MessageSquare className="w-5 h-5 text-primary" />
 </div>
 <div>
 <h2 className="text-xl font-bold text-foreground">
 Mes Tickets Support
 </h2>
 <p className="text-sm text-muted-foreground">
 Gérez vos demandes de support et suivez leurs réponses
 </p>
 </div>
 </div>
 </div>
 
 {/* 🔒 SÉCURITÉ: Composant avec RLS intégré */}
 <UserTicketsSection />
 </div>
 </div>
 </div>
 )
}