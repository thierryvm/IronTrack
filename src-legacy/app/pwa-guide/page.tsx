'use client'

import { useState} from'react'
import { motion} from'framer-motion'
import { 
 Smartphone,
 Download,
 Share,
 Plus,
 Globe,
 ArrowRight,
 CheckCircle,
 AlertCircle,
 Zap,
 Wifi,
 Bell,
 Home,
 ChevronDown,
 ChevronRight,
 Monitor,
 Tablet
} from'lucide-react'
import Link from'next/link'

interface GuideStep {
 step: number
 title: string
 description: string
 icon: React.ReactNode
 details?: string[]
}

interface DeviceGuide {
 id: string
 name: string
 icon: React.ReactNode
 color: string
 steps: GuideStep[]
 tips: string[]
 requirements: string[]
}

export default function PWAGuidePage() {
 const [selectedDevice, setSelectedDevice] = useState<string>('ios')
 const [expandedStep, setExpandedStep] = useState<number | null>(null)

 const deviceGuides: DeviceGuide[] = [
 {
 id:'ios',
 name:'iPhone / iPad (Safari)',
 icon: <Smartphone className="h-6 w-6" />,
 color:'from-tertiary to-tertiary-hover',
 requirements: [
'iOS 11.3 ou plus récent',
'Safari (navigateur par défaut)',
'Connexion internet active'
 ],
 steps: [
 {
 step: 1,
 title:'Ouvrir Safari',
 description:'Lancez Safari et accédez à iron-track-dusky.vercel.app',
 icon: <Globe className="h-5 w-5" />,
 details: [
'Assurez-vous d\'utiliser Safari (pas Chrome ou Firefox)',
'Tapez l\'URL complète dans la barre d\'adresse',
'Attendez que la page soit entièrement chargée'
 ]
},
 {
 step: 2,
 title:'Ouvrir le menu Partage',
 description:'Appuyez sur l\'icône de partage en bas de l\'écran',
 icon: <Share className="h-5 w-5" />,
 details: [
'L\'icône ressemble à un carré avec une flèche vers le haut',
'Elle se trouve dans la barre d\'outils en bas',
'Si vous ne la voyez pas, faites défiler la page vers le haut'
 ]
},
 {
 step: 3,
 title:'Ajouter à l\'écran d\'accueil',
 description:'Sélectionnez"Ajouter à l\'écran d\'accueil" dans le menu',
 icon: <Plus className="h-5 w-5" />,
 details: [
'Faites défiler dans le menu pour trouver cette option',
'L\'icône ressemble à un"+" avec un carré',
'Appuyez dessus pour continuer'
 ]
},
 {
 step: 4,
 title:'Personnaliser et Ajouter',
 description:'Modifiez le nom si souhaité, puis appuyez sur"Ajouter"',
 icon: <CheckCircle className="h-5 w-5" />,
 details: [
'Le nom par défaut est"IronTrack"',
'Vous pouvez le raccourcir pour"IronTrack" ou le laisser tel quel',
'Appuyez sur"Ajouter" en haut à droite pour finaliser'
 ]
}
 ],
 tips: [
'L\'icône apparaîtra sur votre écran d\'accueil comme une vraie app',
'L\'app s\'ouvrira en mode plein écran sans les barres Safari',
'Vous recevrez des notifications comme une app native',
'Fonctionne même en mode avion (pour les données mises en cache)'
 ]
},
 {
 id:'android',
 name:'Android (Chrome)',
 icon: <Smartphone className="h-6 w-6" />,
 color:'from-green-500 to-green-600',
 requirements: [
'Android 5.0 ou plus récent',
'Chrome 76+ ou Samsung Internet',
'Connexion internet active'
 ],
 steps: [
 {
 step: 1,
 title:'Ouvrir Chrome',
 description:'Lancez Chrome et accédez à iron-track-dusky.vercel.app',
 icon: <Globe className="h-5 w-5" />,
 details: [
'Utilisez Google Chrome ou Samsung Internet',
'Tapez l\'URL complète dans la barre d\'adresse',
'Attendez le chargement complet de la page'
 ]
},
 {
 step: 2,
 title:'Popup d\'installation (automatique)',
 description:'Une bannière"Installer l\'app" devrait apparaître automatiquement',
 icon: <Download className="h-5 w-5" />,
 details: [
'La bannière apparaît en bas de l\'écran après quelques secondes',
'Si elle n\'apparaît pas, continuez à l\'étape 3',
'Appuyez sur"Installer" si vous la voyez'
 ]
},
 {
 step: 3,
 title:'Menu Chrome (alternative)',
 description:'Si pas de popup : Menu (⋮) →"Ajouter à l\'écran d\'accueil"',
 icon: <Plus className="h-5 w-5" />,
 details: [
'Appuyez sur les 3 points verticaux en haut à droite',
'Cherchez"Ajouter à l\'écran d\'accueil" ou"Installer l\'app"',
'L\'option peut être dans un sous-menu"Partager"'
 ]
},
 {
 step: 4,
 title:'Confirmer l\'installation',
 description:'Appuyez sur"Ajouter" ou"Installer" pour finaliser',
 icon: <CheckCircle className="h-5 w-5" />,
 details: [
'Une boîte de dialogue de confirmation apparaîtra',
'Vérifiez le nom"IronTrack" et l\'icône',
'Appuyez sur"Ajouter" pour créer le raccourci'
 ]
}
 ],
 tips: [
'L\'app sera installée comme une vraie application Android',
'Elle apparaîtra dans votre tiroir d\'applications',
'Notifications push disponibles',
'Fonctionnement hors-ligne pour les données en cache',
'Partage d\'écran et multitâche supportés'
 ]
},
 {
 id:'samsung',
 name:'Samsung Internet',
 icon: <Tablet className="h-6 w-6" />,
 color:'from-purple-500 to-purple-600',
 requirements: [
'Samsung Internet Browser',
'Android 5.0+ ou One UI',
'Connexion internet stable'
 ],
 steps: [
 {
 step: 1,
 title:'Samsung Internet',
 description:'Ouvrez Samsung Internet et naviguez vers iron-track-dusky.vercel.app',
 icon: <Globe className="h-5 w-5" />,
 details: [
'Utilisez le navigateur Samsung Internet (icône bleue)',
'Tapez l\'URL complète dans la barre d\'adresse',
'Assurez-vous que la page est entièrement chargée'
 ]
},
 {
 step: 2,
 title:'Menu du navigateur',
 description:'Appuyez sur les 3 lignes horizontales (≡) en bas à droite',
 icon: <Share className="h-5 w-5" />,
 details: [
'Le menu hamburger se trouve en bas de l\'écran',
'Il peut aussi être représenté par 3 points',
'Appuyez dessus pour ouvrir les options'
 ]
},
 {
 step: 3,
 title:'Ajouter à l\'écran d\'accueil',
 description:'Sélectionnez"Ajouter page à" →"Écran d\'accueil"',
 icon: <Plus className="h-5 w-5" />,
 details: [
'Cherchez l\'option"Ajouter page à" ou"Raccourci"',
'Puis sélectionnez"Écran d\'accueil"',
'L\'option peut être nommée différemment selon la version'
 ]
},
 {
 step: 4,
 title:'Finaliser l\'ajout',
 description:'Confirmez le nom"IronTrack" et appuyez sur"Ajouter"',
 icon: <CheckCircle className="h-5 w-5" />,
 details: [
'Vérifiez que le nom est"IronTrack"',
'L\'icône devrait apparaître automatiquement',
'Appuyez sur"Ajouter" ou"OK" pour terminer'
 ]
}
 ],
 tips: [
'Samsung Internet offre une excellente compatibilité PWA',
'Synchronisation possible avec votre compte Samsung',
'Mode sombre automatique selon vos préférences système',
'Protection anti-tracking intégrée',
'Performance optimisée sur les appareils Samsung'
 ]
},
 {
 id:'desktop',
 name:'Ordinateur (Chrome/Edge)',
 icon: <Monitor className="h-6 w-6" />,
 color:'from-orange-600 to-red-500',
 requirements: [
'Chrome 73+, Edge 79+, ou Firefox 100+',
'Windows 10+, macOS 10.12+, ou Linux',
'Connexion internet active'
 ],
 steps: [
 {
 step: 1,
 title:'Ouvrir le navigateur',
 description:'Lancez Chrome, Edge ou Firefox et allez sur iron-track-dusky.vercel.app',
 icon: <Monitor className="h-5 w-5" />,
 details: [
'Chrome et Edge offrent la meilleure expérience PWA',
'Firefox supporte les PWA depuis la version 100',
'Tapez l\'URL complète dans la barre d\'adresse'
 ]
},
 {
 step: 2,
 title:'Icône d\'installation',
 description:'Cherchez l\'icône d\'installation (⊕) dans la barre d\'adresse',
 icon: <Download className="h-5 w-5" />,
 details: [
'L\'icône apparaît à droite de la barre d\'adresse',
'Elle ressemble à un"+" dans un cercle ou un ordinateur',
'Si vous ne la voyez pas, attendez quelques secondes'
 ]
},
 {
 step: 3,
 title:'Installer l\'application',
 description:'Cliquez sur l\'icône et sélectionnez"Installer IronTrack"',
 icon: <Plus className="h-5 w-5" />,
 details: [
'Une popup d\'installation apparaîtra',
'Vérifiez que c\'est bien"IronTrack" qui sera installé',
'Cliquez sur"Installer" pour continuer'
 ]
},
 {
 step: 4,
 title:'Lancement automatique',
 description:'L\'app s\'ouvre automatiquement dans une fenêtre dédiée',
 icon: <CheckCircle className="h-5 w-5" />,
 details: [
'IronTrack s\'ouvre dans sa propre fenêtre, sans barre d\'adresse',
'Un raccourci est créé sur votre bureau et dans le menu Démarrer',
'Vous pouvez l\'épingler à la barre des tâches comme toute autre app'
 ]
}
 ],
 tips: [
'L\'app apparaît dans vos applications installées',
'Fonctionne exactement comme une application native',
'Notifications desktop disponibles',
'Raccourcis clavier personnalisés',
'Synchronisation avec votre compte Google/Microsoft',
'Peut être désinstallée comme toute autre application'
 ]
}
 ]

 const selectedGuide = deviceGuides.find(guide => guide.id === selectedDevice)!

 const benefits = [
 {
 icon: <Zap className="h-6 w-6 text-safe-warning" />,
 title:'Performance Optimale',
 description:'Chargement instantané et expérience fluide comme une app native'
},
 {
 icon: <Wifi className="h-6 w-6 text-safe-info" />,
 title:'Fonctionnement Hors-ligne',
 description:'Consultez vos données même sans connexion internet'
},
 {
 icon: <Bell className="h-6 w-6 text-safe-success" />,
 title:'Notifications Push',
 description:'Recevez des rappels d\'entraînement directement sur votre appareil'
},
 {
 icon: <Home className="h-6 w-6 text-safe-primary" />,
 title:'Accès Rapide',
 description:'Icône sur votre écran d\'accueil pour un lancement en un tap'
}
 ]

 return (
 <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-tertiary/8">
 {/* Header */}
 <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white">
 <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="text-center"
 >
 <div className="flex items-center justify-center mb-4">
 <div className="p-2 bg-card border border-border /20 rounded-xl backdrop-blur-sm">
 <Download className="h-8 w-8" />
 </div>
 </div>
 <h1 className="text-3xl sm:text-4xl font-bold mb-4">
 Installer IronTrack sur votre appareil
 </h1>
 <p className="text-xl text-white/90 max-w-3xl mx-auto">
 Profitez d'une expérience mobile optimale avec notre Progressive Web App. 
 Installation simple, performance native, fonctionnement hors-ligne.
 </p>
 </motion.div>
 </div>
 </div>

 <div className="max-w-6xl mx-auto px-4 py-8">
 {/* Avantages */}
 <motion.section
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.1}}
 className="mb-12"
 >
 <h2 className="text-2xl font-bold text-foreground text-center mb-8">
 Pourquoi installer IronTrack ?
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {benefits.map((benefit, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.2 + index * 0.1}}
 className="bg-card border border-border rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-shadow"
 >
 <div className="flex items-center mb-4">
 {benefit.icon}
 <h3 className="font-semibold text-foreground ml-2">{benefit.title}</h3>
 </div>
 <p className="text-muted-foreground text-sm">{benefit.description}</p>
 </motion.div>
 ))}
 </div>
 </motion.section>

 {/* Sélecteur d'appareil */}
 <motion.section
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.3}}
 className="mb-8"
 >
 <h2 className="text-2xl font-bold text-foreground text-center mb-8">
 Choisissez votre appareil
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {deviceGuides.map((device) => (
 <button
 key={device.id}
 onClick={() => setSelectedDevice(device.id)}
 className={`p-4 rounded-xl border-2 transition-all ${
 selectedDevice === device.id
 ?'border-primary bg-orange-50'
 :'border-border hover:border-border bg-card'
}`}
 aria-label={`Sélectionner le guide pour ${device.name}`}
 >
 <div className="flex items-center justify-center mb-2">
 <div className={`p-2 rounded-lg bg-gradient-to-r ${device.color} text-white`}>
 {device.icon}
 </div>
 </div>
 <h3 className="font-semibold text-foreground text-sm text-center">
 {device.name}
 </h3>
 </button>
 ))}
 </div>
 </motion.section>

 {/* Guide détaillé */}
 <motion.section
 key={selectedDevice}
 initial={{ opacity: 0, x: 20}}
 animate={{ opacity: 1, x: 0}}
 className="bg-card border border-border rounded-xl shadow-md p-6 sm:p-8"
 >
 <div className="flex items-center mb-6">
 <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedGuide.color} text-white mr-4`}>
 {selectedGuide.icon}
 </div>
 <div>
 <h3 className="text-2xl font-bold text-foreground">{selectedGuide.name}</h3>
 <p className="text-muted-foreground">Guide d'installation étape par étape</p>
 </div>
 </div>

 {/* Prérequis */}
 <div className="mb-8 p-4 bg-tertiary/8 rounded-lg border border-tertiary/25">
 <div className="flex items-center mb-2">
 <AlertCircle className="h-5 w-5 text-secondary mr-2" />
 <h4 className="font-semibold text-foreground">Prérequis</h4>
 </div>
 <ul className="space-y-1">
 {selectedGuide.requirements.map((req, index) => (
 <li key={index} className="text-tertiary text-sm flex items-center">
 <CheckCircle className="h-6 w-6 text-secondary mr-2 flex-shrink-0" />
 {req}
 </li>
 ))}
 </ul>
 </div>

 {/* Étapes */}
 <div className="mb-8">
 <h4 className="text-lg font-semibold text-foreground mb-6">Étapes d'installation</h4>
 <div className="space-y-4">
 {selectedGuide.steps.map((step) => (
 <div key={step.step} className="border border-border rounded-lg overflow-hidden">
 <button
 onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
 className="w-full p-4 bg-muted hover:bg-muted transition-colors flex items-center justify-between"
 aria-label={`${expandedStep === step.step ?'Réduire' :'Développer'} l'étape ${step.step}: ${step.title}`}
 aria-expanded={expandedStep === step.step}
 >
 <div className="flex items-center">
 <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
 {step.step}
 </div>
 <div className="text-left">
 <h5 className="font-semibold text-foreground">{step.title}</h5>
 <p className="text-muted-foreground text-sm">{step.description}</p>
 </div>
 </div>
 {expandedStep === step.step ? (
 <ChevronDown className="h-5 w-5 text-foreground" />
 ) : (
 <ChevronRight className="h-5 w-5 text-foreground" />
 )}
 </button>
 
 {expandedStep === step.step && step.details && (
 <motion.div
 initial={{ opacity: 0, height: 0}}
 animate={{ opacity: 1, height:'auto'}}
 exit={{ opacity: 0, height: 0}}
 className="p-4 bg-card border border-border border-t border-border"
 >
 <div className="flex items-start">
 <div className="p-2 bg-orange-100 rounded-lg mr-4 flex-shrink-0">
 {step.icon}
 </div>
 <ul className="space-y-2 flex-1">
 {step.details.map((detail, index) => (
 <li key={index} className="text-foreground text-sm flex items-start">
 <ArrowRight className="h-6 w-6 text-orange-800 mr-2 mt-1 flex-shrink-0" />
 {detail}
 </li>
 ))}
 </ul>
 </div>
 </motion.div>
 )}
 </div>
 ))}
 </div>
 </div>

 {/* Conseils */}
 <div className="p-4 bg-green-50 rounded-lg border border-green-200">
 <div className="flex items-center mb-2">
 <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
 <h4 className="font-semibold text-green-900">Conseils et avantages</h4>
 </div>
 <ul className="space-y-2">
 {selectedGuide.tips.map((tip, index) => (
 <li key={index} className="text-green-800 text-sm flex items-start">
 <Zap className="h-6 w-6 text-green-600 mr-2 mt-1 flex-shrink-0" />
 {tip}
 </li>
 ))}
 </ul>
 </div>
 </motion.section>

 {/* Call to Action */}
 <motion.section
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.5}}
 className="mt-12 text-center"
 >
 <div className="bg-gradient-to-r from-orange-600 to-red-500 rounded-xl p-8 text-white">
 <h3 className="text-2xl font-bold mb-4">Prêt à commencer ?</h3>
 <p className="text-white/90 mb-6 max-w-2xl mx-auto">
 Suivez le guide ci-dessus pour installer IronTrack et profiter d'une expérience 
 d'entraînement optimale sur votre appareil.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 href="/"
 className="bg-card border border-border text-orange-800 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors inline-flex items-center justify-center"
 >
 <Home className="h-5 w-5 mr-2" />
 Retour à l'accueil
 </Link>
 <Link
 href="/support/contact"
 className="bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-800 transition-colors border border-orange-400 inline-flex items-center justify-center"
 >
 Besoin d'aide ?
 </Link>
 </div>
 </div>
 </motion.section>
 </div>
 </div>
 )
}