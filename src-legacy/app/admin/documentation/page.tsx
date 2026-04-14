'use client'

import { useAdminAuth} from'@/contexts/AdminAuthContext'
import { Card, CardContent, CardHeader, CardTitle} from'@/components/ui/card'
import { Badge} from'@/components/ui/badge'
import {
 FileText,
 Shield,
 Users,
 MessageSquare,
 Download,
 Activity,
 Settings,
 Lock,
 ChevronRight
} from'lucide-react'

export default function AdminDocumentationPage() {
 const { user} = useAdminAuth()

 const sections = [
 {
 title:'Santé du Système',
 icon: Activity,
 color:'text-primary',
 bg:'bg-primary/10',
 items: [
'Dashboard visuel avec score global /100 : anneau SVG animé et 3 catégories (Dépendances, Sécurité, Runtime)',
'Vérification en temps réel : ping base de données avec mesure de latence ms',
'20 dépendances surveillées : statuts OK / Attention / Critique, versions actuelles et recommandations',
'8 contrôles de sécurité : CSP, HSTS, RLS Supabase, Rate Limiting, sessions SSR…',
'Alerte bannière rouge automatique si un problème critique est détecté',
'Bouton Rafraîchir — accessible aux super_admin uniquement via onglet Configuration',
 ]
},
 {
 title:'Gestion des tickets',
 icon: MessageSquare,
 color:'text-secondary',
 bg:'bg-accent',
 items: [
'Consulter et filtrer les tickets par statut, catégorie et date',
'Répondre aux tickets via la page de détail (cliquer sur la ligne)',
'Changer le statut : Ouvert → En cours → Résolu → Fermé',
'Avertissement affiché avant de rouvrir un ticket fermé',
'Les notes internes ne sont visibles que par les admins',
 ]
},
 {
 title:'Gestion des utilisateurs',
 icon: Users,
 color:'text-success',
 bg:'bg-success/10',
 items: [
'Lister et rechercher tous les utilisateurs',
'Consulter le profil détaillé (activité, séances, rôle)',
'Modifier le rôle via le bouton"Modifier le rôle" (icône badge)',
'Bannir / débannir un utilisateur',
'Seuls les super_admin peuvent modifier les rôles admin',
 ]
},
 {
 title:'Exports de données',
 icon: Download,
 color:'text-primary',
 bg:'bg-primary/10',
 items: [
'Exporter utilisateurs, séances, nutrition, exercices',
'Formats disponibles : JSON et CSV',
'Sélectionner une plage de dates pour filtrer les données',
'Historique des exports enregistré dans les logs',
'Un message"0 enregistrements" indique une plage sans données',
 ]
},
 {
 title:'Logs & Audit',
 icon: Activity,
 color:'text-muted-foreground',
 bg:'bg-accent',
 items: [
'Journal complet de toutes les actions administrateur',
'Filtrer par période : 1h, 24h, 7 jours, 30 jours',
'Filtrer par type d\'action et par administrateur',
'Les détails JSON sont affichés de manière lisible (no overflow)',
'Toute consultation des logs est elle-même loguée',
 ]
},
 {
 title:'Configuration système',
 icon: Settings,
 color:'text-muted-foreground',
 bg:'bg-background',
 items: [
'Accessible aux super_admin uniquement',
'Mode maintenance, cache, sauvegardes automatiques',
'Notifications : alertes sécurité, nouveaux tickets, rapports',
'Reset Configuration : une confirmation est requise avant exécution',
'Les boutons d\'export/sauvegarde fournissent un retour visuel',
 ]
},
 {
 title:'Sécurité & Permissions',
 icon: Lock,
 color:'text-destructive',
 bg:'bg-destructive/10',
 items: [
'Trois niveaux : moderator < admin < super_admin',
'Toutes les actions admin sont tracées dans les logs',
'Recherche partenaires : emails non exposés (conformité RGPD)',
'Sessions expirées redirigent automatiquement vers la connexion',
'Rate limiting actif sur les APIs sensibles',
 ]
},
 ]

 return (
 <div className="min-h-screen bg-background p-6">
 <div className="max-w-5xl mx-auto">
 {/* Header */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6 mb-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4">
 <div className="p-2 bg-primary/10 rounded-xl">
 <FileText className="h-8 w-8 text-primary" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-foreground">Documentation Admin</h1>
 <p className="text-muted-foreground">
 Guide d&apos;utilisation du panel d&apos;administration IronTrack
 </p>
 </div>
 </div>
 <div className="flex items-center space-x-2">
 <Shield className="h-5 w-5 text-muted-foreground" />
 <Badge variant="secondary" className="capitalize">
 {user?.role?.replace('_','') ||'Admin'}
 </Badge>
 </div>
 </div>
 </div>

 {/* Introduction */}
 <div className="bg-accent border border-border rounded-xl p-4 mb-6">
 <p className="text-foreground text-sm leading-relaxed">
 Ce guide couvre toutes les fonctionnalités du panel d&apos;administration IronTrack.
 Les sections ci-dessous décrivent les droits requis et les bonnes pratiques pour chaque module.
 En cas de problème, consultez les <strong>Logs Système</strong> pour retracer les actions récentes.
 </p>
 </div>

 {/* Sections */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {sections.map((section) => {
 const Icon = section.icon
 return (
 <Card key={section.title} className="border border-border">
 <CardHeader className="pb-2">
 <CardTitle className="flex items-center space-x-2 text-base">
 <div className={`p-2 rounded-lg ${section.bg}`}>
 <Icon className={`h-5 w-5 ${section.color}`} />
 </div>
 <span className="text-foreground">{section.title}</span>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {section.items.map((item, i) => (
 <li key={i} className="flex items-start space-x-2 text-sm text-muted-foreground">
 <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 )
})}
 </div>

 {/* Footer */}
 <div className="mt-6 text-center text-xs text-muted-foreground">
 IronTrack Admin — Documentation v2.0 — Pour toute question, ouvrez un ticket support.
 </div>
 </div>
 </div>
 )
}
