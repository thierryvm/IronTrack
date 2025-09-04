'use client'

import { createClient } from '@/utils/supabase/client'
import InAppBrowserWarning from '@/components/auth/InAppBrowserWarning'
import EmailAuthFormGlassmorphism from '@/components/auth/EmailAuthFormGlassmorphism'
import { Dumbbell } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// MIGRATION SHADCN/UI AUTH - 100% COMPLET
import { Button } from '@/components/ui/button'

export default function AuthPage() {
  const supabase = createClient()

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
    } catch (error: unknown) {
      console.error('OAuth Error:', error)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-purple-600 to-blue-700">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
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
              ease: "easeInOut"
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          >
            <Dumbbell size={24 + i * 4} />
          </motion.div>
        ))}
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Carte glassmorphism */}
          <div className="relative backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent" />
            
            <div className="relative z-10 p-8">
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-2xl shadow-lg"
                  >
                    <Dumbbell className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-4xl font-bold mb-2 text-white">
                  IronTrack
                </h1>
                <motion.p 
                  className="text-white/90 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Ton coach muscu personnel
                </motion.p>
                <motion.p 
                  className="text-white/90 text-sm mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  Content de te revoir !
                </motion.p>
              </motion.div>

              {/* Avertissement pour navigateurs in-app */}
              <InAppBrowserWarning />

              {/* Bouton Google prioritaire */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    variant="outline"
                    className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold py-4 px-6 transition-all duration-300 shadow-lg min-h-[44px] hover:bg-white/20"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continuer avec Google</span>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Divider glassmorphism */}
              <motion.div 
                className="relative mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/10 backdrop-blur-md text-white/80 rounded-full border border-white/20">ou</span>
                </div>
              </motion.div>

              {/* Formulaire unifié */}
              <div className="mt-4">
                <EmailAuthFormGlassmorphism showGoogleOption={false} />
              </div>

              {/* Liens RGPD et légaux */}
              <motion.div 
                className="mt-8 pt-6 border-t border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-center space-y-3 text-xs text-white/90">
                  <div className="flex justify-center space-x-4 flex-wrap">
                    <Link href="/legal/terms" className="hover:text-white/90 underline transition-colors">
                      Conditions d'utilisation
                    </Link>
                    <span>•</span>
                    <Link href="/legal/privacy" className="hover:text-white/90 underline transition-colors">
                      Politique de confidentialité
                    </Link>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Link href="/faq" className="hover:text-white/90 underline transition-colors">
                      FAQ
                    </Link>
                    <span>•</span>
                    <Link href="/support" className="hover:text-white/90 underline transition-colors">
                      Support
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}