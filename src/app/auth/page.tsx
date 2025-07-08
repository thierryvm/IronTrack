'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Dumbbell, LogOut } from 'lucide-react'

function AuthContent() {
  const [supabase] = useState(() => createClient())
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    // Gestion des messages d'erreur dans l'URL
    const error = searchParams.get('error');
    if (error === 'invalid_credentials') {
      setErrorMsg('Identifiants invalides. Vérifie ton email et ton mot de passe.');
    } else if (error === 'otp_expired') {
      setErrorMsg('Le lien d\'inscription a expiré ou a déjà été utilisé. Merci de recommencer.');
    } else if (error) {
      setErrorMsg('Erreur d\'authentification. Merci de réessayer.');
    } else {
      setErrorMsg(null);
    }
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        setUserEmail(user.email ?? null)
        // Synchronisation du nom dans le profil si disponible
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;
        if (fullName) {
          await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id);
        }
      } else {
        setIsLoggedIn(false)
        setUserEmail(null)
      }
    }
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true)
        router.push('/')
      }
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setUserEmail(null)
      }
    })
    // Afficher le formulaire de changement de mot de passe si demandé
    if (searchParams.get('change_password') === '1') {
      setShowChangePassword(true);
    } else {
      setShowChangePassword(false);
    }
    return () => subscription.unsubscribe()
  }, [supabase, router, searchParams])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserEmail(null)
    router.push('/auth') // Toujours rediriger vers la page de connexion
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IronTrack</h1>
          <p className="text-gray-600">Ton coach muscu personnel</p>
        </div>

        {/* Affichage des messages d'erreur */}
        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {/* Formulaire changement mot de passe prioritaire */}
        {showChangePassword ? (
          <>
            <Auth
              supabaseClient={supabase}
              view="update_password"
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#f97316',
                      brandAccent: '#ea580c',
                    },
                  },
                },
                style: {
                  button: {
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 24px',
                  },
                  input: {
                    borderRadius: '8px',
                    fontSize: '16px',
                    padding: '12px 16px',
                  },
                },
              }}
              localization={{
                variables: {
                  update_password: {
                    password_label: 'Nouveau mot de passe',
                    button_label: 'Mettre à jour le mot de passe',
                    confirmation_text: 'Mot de passe mis à jour avec succès',
                  },
                },
              }}
            />
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  router.push('/');
                }
              }}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Retour
            </button>
          </>
        ) : isLoggedIn ? (
          <div className="text-center space-y-6">
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Bienvenue, {userEmail} !</p>
              <p className="text-gray-600 mb-4">Tu es déjà connecté.</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 mx-auto"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Se déconnecter</span>
            </button>
          </div>
        ) : (
          <>
            {/* Formulaire d'authentification */}
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#f97316',
                      brandAccent: '#ea580c',
                    },
                  },
                },
                style: {
                  button: {
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 24px',
                  },
                  input: {
                    borderRadius: '8px',
                    fontSize: '16px',
                    padding: '12px 16px',
                  },
                },
              }}
              providers={['google']}
              redirectTo={process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback'}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Mot de passe',
                    button_label: 'Se connecter',
                    loading_button_label: 'Connexion...',
                    social_provider_text: 'Se connecter avec {{provider}}',
                    link_text: 'Déjà un compte ? Se connecter',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Mot de passe',
                    button_label: 'S\'inscrire',
                    loading_button_label: 'Inscription...',
                    social_provider_text: 'S\'inscrire avec {{provider}}',
                    link_text: 'Pas de compte ? S\'inscrire',
                  },
                  forgotten_password: {
                    email_label: 'Email',
                    button_label: 'Envoyer le lien',
                    link_text: 'Mot de passe oublié ?',
                    confirmation_text: 'Un email de réinitialisation a été envoyé.',
                  },
                  magic_link: {
                    email_input_label: 'Email',
                    button_label: 'Envoyer le lien magique',
                    link_text: 'Se connecter avec un lien magique',
                    confirmation_text: 'Vérifie ta boîte mail pour le lien magique.',
                  },
                  update_password: {
                    password_label: 'Nouveau mot de passe',
                    button_label: 'Mettre à jour le mot de passe',
                    confirmation_text: 'Mot de passe mis à jour avec succès',
                  },
                },
              }}
            />
            {/* Informations supplémentaires */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                En continuant, tu acceptes nos{' '}
                <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                  conditions d&apos;utilisation
                </a>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AuthContent />
    </Suspense>
  );
} 