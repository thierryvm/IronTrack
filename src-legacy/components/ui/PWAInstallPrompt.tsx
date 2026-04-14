'use client'

import { useState, useEffect} from'react'
import { motion, AnimatePresence} from'framer-motion'
import { Download, X, Smartphone, Monitor} from'lucide-react'
import Link from'next/link'

interface BeforeInstallPromptEvent extends Event {
 readonly platforms: string[]
 readonly userChoice: Promise<{
 outcome:'accepted' |'dismissed'
 platform: string
}>
 prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
 const [showPrompt, setShowPrompt] = useState(false)
 const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
 const [isInstalled, setIsInstalled] = useState(false)
 const [deviceType, setDeviceType] = useState<'mobile' |'desktop'>('mobile')

 useEffect(() => {
 // Détecter le type d'appareil
 const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
 setDeviceType(isMobile ?'mobile' :'desktop')

 // Vérifier si l'app est déjà installée
 const isStandalone = window.matchMedia('(display-mode: standalone)').matches
 const isInWebAppiOS = (window.navigator as { standalone?: boolean}).standalone === true
 setIsInstalled(isStandalone || isInWebAppiOS)

 // Écouter l'événement beforeinstallprompt (Chrome/Edge)
 const handleBeforeInstallPrompt = (e: Event) => {
 e.preventDefault()
 setDeferredPrompt(e as BeforeInstallPromptEvent)
 
 // Attendre un peu avant d'afficher le prompt pour ne pas être intrusif
 setTimeout(() => {
 if (!isInstalled) {
 setShowPrompt(true)
}
}, 10000) // Afficher après 10 secondes
}

 // Écouter l'installation réussie
 const handleAppInstalled = () => {
 setIsInstalled(true)
 setShowPrompt(false)
 setDeferredPrompt(null)
}

 window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
 window.addEventListener('appinstalled', handleAppInstalled)

 // Pour iOS/Safari qui n'ont pas d'événement automatique
 if (isMobile && !isInstalled && !isStandalone) {
 const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
 const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
 
 if (isIOS && isSafari) {
 // Attendre un peu plus sur iOS car l'expérience est différente
 setTimeout(() => {
 setShowPrompt(true)
}, 15000) // 15 secondes pour iOS
}
}

 return () => {
 window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
 window.removeEventListener('appinstalled', handleAppInstalled)
}
}, [isInstalled])

 const handleInstallClick = async () => {
 if (deferredPrompt) {
 // Installation automatique pour Chrome/Edge/Android
 try {
 deferredPrompt.prompt()
 const { outcome} = await deferredPrompt.userChoice
 
 if (outcome ==='accepted') {
 setShowPrompt(false)
 setDeferredPrompt(null)
}
} catch (error) {
 console.log('Erreur lors de l\'installation PWA:', error)
 // Fallback vers le guide manuel
 window.open('/pwa-guide','_blank')
}
} else {
 // Rediriger vers le guide d'installation pour iOS/Safari ou autres cas
 window.open('/pwa-guide','_blank')
}
}

 const handleDismiss = () => {
 setShowPrompt(false)
 // Ne pas réafficher pendant cette session
 sessionStorage.setItem('pwa-prompt-dismissed','true')
}

 // Ne pas afficher si déjà installé ou si l'utilisateur a déjà refusé cette session
 if (isInstalled || sessionStorage.getItem('pwa-prompt-dismissed')) {
 return null
}

 return (
 <AnimatePresence>
 {showPrompt && (
 <motion.div
 initial={{ opacity: 0, y: 100}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: 100}}
 className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
 >
 <div className="bg-card border border-border rounded-xl shadow-2xl border border-border p-4 backdrop-blur-sm">
 <div className="flex items-start justify-between mb-2">
 <div className="flex items-center">
 <div className="p-2 bg-gradient-to-r from-orange-600 to-red-500 rounded-lg mr-2">
 {deviceType ==='mobile' ? (
 <Smartphone className="h-5 w-5 text-white" />
 ) : (
 <Monitor className="h-5 w-5 text-white" />
 )}
 </div>
 <div>
 <h3 className="font-semibold text-foreground text-sm">
 Installer IronTrack
 </h3>
 <p className="text-xs text-gray-600">
 {deviceType ==='mobile' 
 ?'Ajoutez l\'app à votre écran d\'accueil'
 :'Installez l\'app sur votre ordinateur'
}
 </p>
 </div>
 </div>
 <button
 onClick={handleDismiss}
 className="text-gray-700 hover:text-gray-600 p-1"
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 
 <div className="flex gap-2">
 <button
 onClick={handleInstallClick}
 className="flex-1 bg-gradient-to-r from-orange-600 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center"
 >
 <Download className="h-6 w-6 mr-2" />
 {deferredPrompt ?'Installer' :'Guide'}
 </button>
 
 <Link
 href="/pwa-guide"
 className="px-2 py-2 text-orange-800 hover:text-primary-hover text-sm font-medium transition-colors"
 >
 Aide
 </Link>
 </div>
 
 <p className="text-xs text-gray-600 mt-2 text-center">
 ⚡ Accès rapide • 🔔 Notifications • 📱 Mode hors-ligne
 </p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 )
}