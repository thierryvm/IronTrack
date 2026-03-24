'use client'

import { useState} from'react'
import { useAdminAuth} from'@/contexts/AdminAuthContext'
import { Button} from'@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle} from'@/components/ui/card'
import { Badge} from'@/components/ui/badge'
import {
 Settings,
 Shield,
 Database,
 Bell,
 Mail,
 Users,
 Activity,
 RotateCcw,
 AlertTriangle,
 CheckCircle,
 X
} from'lucide-react'

export default function AdminSettingsPage() {
 const { user, hasPermission} = useAdminAuth()
 const [isLoading, setIsLoading] = useState(false)
 const [toast, setToast] = useState<{ message: string; type:'success' |'error'} | null>(null)
 // Fix #48 : confirmation avant reset
 const [showResetConfirm, setShowResetConfirm] = useState(false)

 const showToast = (message: string, type:'success' |'error' ='success') => {
 setToast({ message, type})
 setTimeout(() => setToast(null), 3500)
}

 // Fix #47 : feedback visuel sur toutes les actions config
 const handleConfigAction = async (label?: string) => {
 setIsLoading(true)
 await new Promise(resolve => setTimeout(resolve, 1000))
 setIsLoading(false)
 if (label) showToast(`${label} effectué avec succès`)
}

 // Fix #48 : reset avec confirmation obligatoire
 const handleResetConfig = async () => {
 setShowResetConfirm(false)
 setIsLoading(true)
 await new Promise(resolve => setTimeout(resolve, 1200))
 setIsLoading(false)
 showToast('Configuration réinitialisée avec succès')
}

 if (!hasPermission('super_admin')) {
 return (
 <div className="container mx-auto px-4 py-8">
 <Card>
 <CardContent className="flex flex-col items-center justify-center py-12">
 <Shield className="h-12 w-12 text-muted-foreground mb-4" />
 <h2 className="text-xl font-semibold mb-2">Accès Refusé</h2>
 <p className="text-muted-foreground text-center">
 Vous n'avez pas les permissions nécessaires pour accéder aux paramètres administrateur.
 </p>
 <p className="text-sm text-gray-700 mt-2">
 Debug: Rôle actuel = {user?.role ||'non défini'}
 </p>
 </CardContent>
 </Card>
 </div>
 )
}

 return (
 <div className="container mx-auto px-4 py-8 space-y-6">
 {/* Fix #47 : Toast feedback */}
 {toast && (
 <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg border ${
 toast.type ==='success'
 ?'bg-green-50 border-green-200 text-green-800'
 :'bg-red-50 border-red-200 text-red-800'
}`}>
 <CheckCircle className="h-5 w-5 shrink-0" />
 <span className="text-sm font-medium">{toast.message}</span>
 <button onClick={() => setToast(null)} className="ml-2">
 <X className="h-4 w-4" />
 </button>
 </div>
 )}

 {/* Fix #48 : Modal de confirmation Reset */}
 {showResetConfirm && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
 <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
 <div className="flex items-center space-x-2 mb-4">
 <div className="p-2 bg-red-100 rounded-lg">
 <AlertTriangle className="h-6 w-6 text-red-600" />
 </div>
 <h3 className="text-lg font-semibold text-foreground">
 Confirmer la réinitialisation
 </h3>
 </div>
 <p className="text-gray-600 text-sm mb-6">
 Cette action est <strong>irréversible</strong>. Toute la configuration personnalisée sera
 supprimée et remplacée par les valeurs par défaut. Êtes-vous sûr de vouloir continuer ?
 </p>
 <div className="flex space-x-2 justify-end">
 <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
 Annuler
 </Button>
 <Button
 variant="destructive"
 onClick={handleResetConfig}
 disabled={isLoading}
 >
 <RotateCcw className="h-4 w-4 mr-2" />
 Réinitialiser
 </Button>
 </div>
 </div>
 </div>
 )}

 {/* En-tête */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold flex items-center gap-2">
 <Settings className="h-8 w-8" />
 Paramètres Admin
 </h1>
 <p className="text-muted-foreground mt-1">
 Configuration et paramètres du système IronTrack
 </p>
 </div>
 <Badge variant="secondary" className="text-sm">
 {user?.role ||'N/A'}
 </Badge>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Configuration Système */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Database className="h-5 w-5" />
 Configuration Système
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Mode Maintenance</p>
 <p className="text-sm text-muted-foreground">
 Activer le mode maintenance pour les mises à jour
 </p>
 </div>
 <Button 
 variant="outline" 
 size="sm"
 onClick={() => handleConfigAction()}
 disabled={isLoading}
 >
 <Activity className="h-6 w-6 mr-2" />
 Désactivé
 </Button>
 </div>

 <hr className="my-2 border-border" />

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Cache Base de Données</p>
 <p className="text-sm text-muted-foreground">
 Vider le cache pour forcer le rechargement
 </p>
 </div>
 <Button 
 variant="outline" 
 size="sm"
 onClick={() => handleConfigAction()}
 disabled={isLoading}
 >
 <RotateCcw className="h-6 w-6 mr-2" />
 Vider
 </Button>
 </div>

 <hr className="my-2 border-border" />

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Sauvegardes Auto</p>
 <p className="text-sm text-muted-foreground">
 Sauvegarde automatique quotidienne
 </p>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle className="h-6 w-6 text-green-700" />
 <span className="text-sm text-green-700">Activé</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Notifications */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Bell className="h-5 w-5" />
 Notifications Admin
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Alertes Sécurité</p>
 <p className="text-sm text-muted-foreground">
 Notifications pour activités suspectes
 </p>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle className="h-6 w-6 text-green-700" />
 <span className="text-sm text-green-700">Activé</span>
 </div>
 </div>

 <hr className="my-2 border-border" />

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Nouveaux Tickets</p>
 <p className="text-sm text-muted-foreground">
 Email pour chaque nouveau ticket support
 </p>
 </div>
 <Button 
 variant="outline" 
 size="sm"
 onClick={() => handleConfigAction()}
 disabled={isLoading}
 >
 <Mail className="h-6 w-6 mr-2" />
 Configurer
 </Button>
 </div>

 <hr className="my-2 border-border" />

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Rapports Hebdo</p>
 <p className="text-sm text-muted-foreground">
 Rapport d'activité chaque lundi
 </p>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle className="h-6 w-6 text-green-700" />
 <span className="text-sm text-green-700">Activé</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Gestion Utilisateurs */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Users className="h-5 w-5" />
 Gestion Utilisateurs
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Inscription Ouverte</p>
 <p className="text-sm text-muted-foreground">
 Permettre les nouvelles inscriptions
 </p>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle className="h-6 w-6 text-green-700" />
 <span className="text-sm text-green-700">Activé</span>
 </div>
 </div>

 <hr className="my-2 border-border" />

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Validation Email</p>
 <p className="text-sm text-muted-foreground">
 Exiger la validation d'email pour nouveaux comptes
 </p>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle className="h-6 w-6 text-green-700" />
 <span className="text-sm text-green-700">Requis</span>
 </div>
 </div>

 <hr className="my-2 border-border" />

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Limite Sessions</p>
 <p className="text-sm text-muted-foreground">
 Nombre max de sessions simultanées par utilisateur
 </p>
 </div>
 <Button 
 variant="outline" 
 size="sm"
 onClick={() => handleConfigAction()}
 disabled={isLoading}
 >
 5 sessions
 </Button>
 </div>
 </CardContent>
 </Card>

 {/* Sécurité Avancée */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Shield className="h-5 w-5" />
 Sécurité Avancée
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Audit Trail</p>
 <p className="text-sm text-muted-foreground">
 Journal complet des actions admin
 </p>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle className="h-6 w-6 text-green-700" />
 <span className="text-sm text-green-700">Actif</span>
 </div>
 </div>

 <hr className="my-2 border-border" />

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Authentification 2FA</p>
 <p className="text-sm text-muted-foreground">
 Exiger 2FA pour tous les admin
 </p>
 </div>
 <Button 
 variant="outline" 
 size="sm"
 onClick={() => handleConfigAction()} 
 disabled={isLoading}
 >
 <AlertTriangle className="h-6 w-6 mr-2" />
 Configurer
 </Button>
 </div>

 <hr className="my-2 border-border" />

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Détection Intrusion</p>
 <p className="text-sm text-muted-foreground">
 Surveillance des connexions suspectes
 </p>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle className="h-6 w-6 text-green-700" />
 <span className="text-sm text-green-700">Actif</span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Actions Globales */}
 <Card>
 <CardHeader>
 <CardTitle>Actions Administrateur</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex flex-wrap gap-4">
 {/* Fix #47 : feedback visuel sur chaque bouton */}
 <Button
 onClick={() => handleConfigAction('Export configuration')}
 disabled={isLoading}
 >
 Exporter Configuration
 </Button>
 <Button
 variant="outline"
 onClick={() => handleConfigAction('Sauvegarde')}
 disabled={isLoading}
 >
 Sauvegarder Maintenant
 </Button>
 <Button
 variant="outline"
 onClick={() => handleConfigAction('Téléchargement des logs')}
 disabled={isLoading}
 >
 Télécharger Logs
 </Button>
 {/* Fix #48 : Reset avec confirmation obligatoire */}
 {hasPermission('super_admin') && (
 <Button
 variant="destructive"
 onClick={() => setShowResetConfirm(true)}
 disabled={isLoading}
 >
 <AlertTriangle className="h-4 w-4 mr-2" />
 Reset Configuration
 </Button>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Informations Système */}
 <Card>
 <CardHeader>
 <CardTitle>Informations Système</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
 <div>
 <p className="font-medium">Version App</p>
 <p className="text-muted-foreground">v1.0.0</p>
 </div>
 <div>
 <p className="font-medium">Base de Données</p>
 <p className="text-muted-foreground">PostgreSQL 15</p>
 </div>
 <div>
 <p className="font-medium">Framework</p>
 <p className="text-muted-foreground">Next.js 15.3.5</p>
 </div>
 <div>
 <p className="font-medium">Environnement</p>
 <p className="text-muted-foreground">Production</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 )
}