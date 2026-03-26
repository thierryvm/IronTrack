'use client'

import { useState, useEffect, Suspense} from'react'
import { createClient} from'@/utils/supabase/client'
import { useRouter, useSearchParams} from'next/navigation'
import Link from'next/link'
import { Eye, EyeOff, Dumbbell, Sparkles} from'lucide-react'
import { motion, AnimatePresence} from'framer-motion'

function ResetPasswordForm() {
 const [password, setPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [message, setMessage] = useState('')
 const [isSuccess, setIsSuccess] = useState(false)
 
 const supabase = createClient()
 const router = useRouter()
 const searchParams = useSearchParams()

 useEffect(() => {
 // Vérifier si on a un token de reset dans l'URL
 const accessToken = searchParams.get('access_token')
 const refreshToken = searchParams.get('refresh_token')
 
 if (!accessToken || !refreshToken) {
 setMessage('🔗 Lien de réinitialisation invalide ou expiré')
 return
}

 // Définir la session avec les tokens reçus
 supabase.auth.setSession({
 access_token: accessToken,
 refresh_token: refreshToken
})
}, [searchParams, supabase.auth])

 const handlePasswordReset = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)
 setMessage('')

 // Validation
 if (password.length < 8) {
 setMessage('🔐 Le mot de passe doit contenir au moins 8 caractères')
 setLoading(false)
 return
}

 if (password !== confirmPassword) {
 setMessage('🔄 Les mots de passe ne correspondent pas')
 setLoading(false)
 return
}

 try {
 const { error} = await supabase.auth.updateUser({ 
 password: password 
})
 
 if (error) throw error
 
 setMessage('✅ Mot de passe mis à jour avec succès !')
 setIsSuccess(true)
 
 // Redirection après 3 secondes
 setTimeout(() => {
 router.push('/auth')
}, 3000)
 
} catch (error: unknown) {
 console.error('Password Reset Error:', error)
 setMessage((error as Error)?.message ||'😅 Erreur lors de la mise à jour du mot de passe')
} finally {
 setLoading(false)
}
}

 return (
 <div className="min-h-screen relative overflow-hidden">
 {/* Arrière-plan animé */}
 <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-purple-600 to-tertiary">
 <div className="absolute inset-0 bg-black/20" />
 <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
 <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
 <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
 </div>

 {/* Particules flottantes */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 {[...Array(3)].map((_, i) => (
 <motion.div
 key={i}
 className="absolute text-white/10"
 animate={{
 y: [0, -100, 0],
 x: [0, 50, 0],
 rotate: [0, 180, 360],
}}
 transition={{
 duration: 8 + i * 2,
 repeat: Infinity,
 ease:"easeInOut"
}}
 style={{
 left: `${20 + i * 25}%`,
 top: `${30 + i * 15}%`,
}}
 >
 <Dumbbell size={24 + i * 4} />
 </motion.div>
 ))}
 </div>

 <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
 <motion.div
 initial={{ opacity: 0, scale: 0.9}}
 animate={{ opacity: 1, scale: 1}}
 transition={{ duration: 0.5}}
 className="w-full max-w-md"
 >
 {/* Carte glassmorphism */}
 <div className="relative backdrop-blur-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent" />
 
 <div className="relative z-10 p-8">
 <motion.div 
 className="text-center mb-8"
 initial={{ opacity: 0, y: -20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.2}}
 >
 <div className="flex items-center justify-center mb-4">
 <motion.div
 whileHover={{ scale: 1.1, rotate: 360}}
 transition={{ duration: 0.5}}
 className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-2xl shadow-lg"
 >
 <Dumbbell className="w-8 h-8 text-white" />
 </motion.div>
 </div>
 <h1 className="text-4xl font-bold mb-2 text-foreground">
 IronTrack
 </h1>
 <motion.p 
 className="text-white/90 text-lg"
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 transition={{ duration: 0.3}}
 >
 <Sparkles className="inline w-4 h-4 mr-1" />
 {isSuccess ?'Mot de passe mis à jour !' :'Nouveau mot de passe'}
 </motion.p>
 </motion.div>

 <AnimatePresence mode="wait">
 {!isSuccess ? (
 <motion.form 
 key="reset-form"
 onSubmit={handlePasswordReset}
 className="space-y-4"
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -20}}
 transition={{ delay: 0.3}}
 >
 <div>
 <label className="block text-sm font-medium text-white mb-2">
 Nouveau mot de passe
 </label>
 <div className="relative">
 <motion.input
 type={showPassword ?'text' :'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full px-4 py-2 pr-12 bg-card border border-border rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all text-foreground placeholder-gray-500"
 placeholder="Au moins 8 caractères"
 required
 minLength={8}
 whileFocus={{ scale: 1.02}}
 />
 <motion.button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 aria-label={showPassword ?"Masquer le mot de passe" :"Afficher le mot de passe"}
 className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white/90 transition-colors"
 whileHover={{ scale: 1.1}}
 whileTap={{ scale: 0.9}}
 >
 {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
 </motion.button>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-white mb-2">
 Confirmer le mot de passe
 </label>
 <motion.input
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className={`w-full px-4 py-2 bg-card border border-border rounded-xl focus:ring-2 transition-all text-foreground placeholder-gray-500 ${
 confirmPassword && password !== confirmPassword
 ?'border-red-400/60 bg-red-500/10 focus:ring-red-400/50 focus:border-red-400/50'
 :'border-white focus:ring-orange-400/50 focus:border-orange-400/50'
}`}
 placeholder="Répétez votre nouveau mot de passe"
 required
 whileFocus={{ scale: 1.02}}
 />
 <AnimatePresence>
 {confirmPassword && password !== confirmPassword && (
 <motion.p 
 className="text-red-300 text-xs mt-1 flex items-center"
 initial={{ opacity: 0, y: -10}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -10}}
 >
 🔄 Les mots de passe ne correspondent pas
 </motion.p>
 )}
 </AnimatePresence>
 </div>

 <AnimatePresence>
 {message && (
 <motion.div 
 className={`p-4 rounded-xl text-sm backdrop-blur-md ${
 message.includes('erreur') || message.includes('Erreur') || message.includes('invalide')
 ?'bg-red-500/20 text-white/80 border border-red-400/30' 
 :'bg-green-500/20 text-green-200 border border-green-400/30'
}`}
 initial={{ opacity: 0, y: -10}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -10}}
 >
 {message}
 </motion.div>
 )}
 </AnimatePresence>

 <motion.button
 type="submit"
 disabled={loading || password !== confirmPassword || password.length < 8}
 className="w-full bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg backdrop-blur-md"
 whileHover={{ scale: 1.02}}
 whileTap={{ scale: 0.98}}
 >
 {loading ? (
 <div className="w-5 h-5 border-2 border-white border-t-white rounded-full animate-spin" />
 ) : (
 <span>🔄 Mettre à jour le mot de passe</span>
 )}
 </motion.button>
 </motion.form>
 ) : (
 <motion.div
 key="success-message"
 className="text-center space-y-6"
 initial={{ opacity: 0, scale: 0.9}}
 animate={{ opacity: 1, scale: 1}}
 transition={{ delay: 0.2}}
 >
 <div className="text-6xl mb-4">🎉</div>
 <p className="text-white/90 text-lg mb-6">
 Parfait ! Votre mot de passe a été mis à jour avec succès.
 </p>
 <p className="text-white/90 text-sm">
 Redirection automatique vers la connexion...
 </p>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Lien retour */}
 <motion.div 
 className="mt-8 text-center"
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 transition={{ delay: 0.6}}
 >
 <Link 
 href="/auth" 
 className="text-orange-300 hover:text-white/80 font-medium transition-colors inline-flex items-center space-x-1"
 >
 <span>⬅️</span>
 <span>Retour à la connexion</span>
 </Link>
 </motion.div>
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 )
}

export default function ResetPasswordPage() {
 return (
 <Suspense fallback={
 <div className="min-h-screen flex items-center justify-center">
 <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
 </div>
}>
 <ResetPasswordForm />
 </Suspense>
 )
}
