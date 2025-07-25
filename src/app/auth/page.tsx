'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Dumbbell, LogOut, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { 
  validateEmail, 
  validatePassword, 
  sanitizeInput, 
  detectSecurityThreats,
  ClientRateLimiter 
} from '@/utils/security'
import InAppBrowserWarning from '@/components/auth/InAppBrowserWarning'
import { detectBrowserInfo } from '@/utils/browserDetection'


function AuthContent() {
  const [supabase] = useState(() => createClient())
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Champs custom pour inscription
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rateLimiter] = useState(() => new ClientRateLimiter(5, 15 * 60 * 1000)) // 5 tentatives par 15 min
  // États pour la gestion des navigateurs in-app
  const [showInAppWarning, setShowInAppWarning] = useState(false)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Déterminer l'URL de redirection basée sur l'environnement actuel
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
      return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    }
    
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocalhost) {
      return 'http://localhost:3000/'
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  };

  useEffect(() => {
    // Détection des navigateurs in-app au montage du composant
    const browserInfo = detectBrowserInfo();
    setIsInAppBrowser(browserInfo.isInAppBrowser);
    
    
    
    // Gestion des messages d'erreur dans l'URL
    const error = searchParams.get('error');
    if (error === 'invalid_credentials') {
      setErrorMsg('Identifiants invalides. Vérifie ton email et ton mot de passe.');
    } else if (error === 'otp_expired') {
      setErrorMsg('Le lien d\'inscription a expiré ou a déjà été utilisé. Merci de recommencer.');
    } else if (error === 'disallowed_useragent') {
      setErrorMsg('Connexion Google non autorisée depuis cette application. Merci d\'ouvrir le lien dans votre navigateur principal.');
      setShowInAppWarning(true);
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
        
        // Si l'utilisateur est connecté et n'a pas de paramètre spécial, rediriger
        if (!searchParams.get('change_password') && !searchParams.get('error')) {
          router.push('/')
          return
        }
      } else {
        setIsLoggedIn(false)
        setUserEmail(null)
      }
    }
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setIsLoggedIn(true)
        const user = session?.user
        setUserEmail(user?.email ?? null)
        // Redirection immédiate sans afficher la modal
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

  useEffect(() => {
    // Détection du mode inscription via le DOM
    const observer = new MutationObserver(() => {
      // Observer pour détecter les changements dans le formulaire
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserEmail(null)
    router.push('/auth') // Toujours rediriger vers la page de connexion
  }


  // Gestion inscription custom sécurisée
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setFormErrors({})
    
    // Vérification du rate limiting
    if (!rateLimiter.isAllowed(signupEmail || 'anonymous')) {
      setErrorMsg(`Trop de tentatives. Merci d'attendre avant de réessayer. (Tentatives restantes: ${rateLimiter.getRemainingAttempts(signupEmail || 'anonymous')})`)
      return
    }
    
    const errors: Record<string, string> = {}
    
    // Validation sécurisée de l'email
    const emailError = validateEmail(signupEmail)
    if (emailError) {
      errors[emailError.field] = emailError.message
    }
    
    // Validation sécurisée du mot de passe
    const passwordError = validatePassword(signupPassword)
    if (passwordError) {
      errors[passwordError.field] = passwordError.message
    }
    
    // Vérification de la confirmation du mot de passe
    if (!signupConfirm || signupConfirm.trim() === '') {
      errors.confirmPassword = 'La confirmation du mot de passe est requise'
    } else if (signupPassword !== signupConfirm) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    
    // Détection de menaces de sécurité
    if (detectSecurityThreats(signupEmail)) {
      errors.email = 'Email contient des caractères interdits'
    }
    
    // Si des erreurs sont détectées
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setLoading(true)
    
    try {
      // Sanitisation de l'email (bien que validateEmail l'ait déjà vérifié)
      const sanitizedEmail = signupEmail.toLowerCase().trim()
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: signupPassword
      })
      
      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }
      
      // Ajoute un pseudo sécurisé dans la table profiles
      if (data.user) {
        const sanitizedPseudo = sanitizeInput(sanitizedEmail.split('@')[0])
        await supabase.from('profiles').update({ 
          pseudo: sanitizedPseudo,
          email: sanitizedEmail 
        }).eq('id', data.user.id)
      }
      
      setLoading(false)
      setShowSignUp(false)
      setSignupEmail('')
      setSignupPassword('')
      setSignupConfirm('')
      setFormErrors({})
      setErrorMsg('Inscription réussie ! Vérifie tes emails pour valider ton compte.')
    } catch {
      setErrorMsg('Erreur lors de l\'inscription. Merci de réessayer.')
      setLoading(false)
    }
  }

  // Gestionnaire pour intercepter les clics sur le bouton Google
  const handleGoogleSignIn = useCallback((event: Event) => {
    if (isInAppBrowser) {
      event.preventDefault();
      event.stopPropagation();
      setShowInAppWarning(true);
      return false;
    }
  }, [isInAppBrowser]);

  // Effet pour intercepter les clics sur le bouton Google après le rendu
  useEffect(() => {
    if (isInAppBrowser) {
      const observer = new MutationObserver(() => {
        const googleButton = document.querySelector('button[data-provider="google"]');
        if (googleButton && !googleButton.hasAttribute('data-intercepted')) {
          googleButton.setAttribute('data-intercepted', 'true');
          googleButton.addEventListener('click', handleGoogleSignIn);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      
      // Nettoyage
      return () => {
        observer.disconnect();
        const googleButton = document.querySelector('button[data-provider="google"]');
        if (googleButton) {
          googleButton.removeEventListener('click', handleGoogleSignIn);
        }
      };
    }
  }, [isInAppBrowser, handleGoogleSignIn]);

  return (
    <>
      {/* Avertissement pour navigateurs in-app */}
      {showInAppWarning && (
        <InAppBrowserWarning 
          onClose={() => setShowInAppWarning(false)}
          showAlternativeAuth={true}
        />
      )}
      
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
        ) : showSignUp ? (
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                id="signupEmail"
                type="email"
                autoComplete="email"
                className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base px-4 py-3 ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                value={signupEmail}
                onChange={e => {
                  const value = e.target.value
                  // Validation basique en temps réel
                  if (detectSecurityThreats(value)) {
                    return // Bloque les caractères dangereux
                  }
                  setSignupEmail(value)
                  if (formErrors.email) {
                    setFormErrors(prev => ({ ...prev, email: '' }))
                  }
                }}
                required
                maxLength={254}
                placeholder="exemple@email.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {formErrors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700">Mot de passe *</label>
              <div className="relative">
                <input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base px-4 py-3 pr-12 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={signupPassword}
                  onChange={e => {
                    setSignupPassword(e.target.value)
                    if (formErrors.password) {
                      setFormErrors(prev => ({ ...prev, password: '' }))
                    }
                  }}
                  required
                  minLength={8}
                  maxLength={128}
                  placeholder="Minimum 8 caractères"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-1 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {formErrors.password}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Le mot de passe doit contenir au moins 8 caractères avec 3 des éléments suivants :
                <br />minuscules, majuscules, chiffres, caractères spéciaux
              </div>
            </div>
            <div>
              <label htmlFor="signupConfirm" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
              <div className="relative">
                <input
                  id="signupConfirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base px-4 py-3 pr-12 ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={signupConfirm}
                  onChange={e => {
                    setSignupConfirm(e.target.value)
                    if (formErrors.confirmPassword) {
                      setFormErrors(prev => ({ ...prev, confirmPassword: '' }))
                    }
                  }}
                  required
                  placeholder="Confirme ton mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-1 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-base"
              disabled={loading}
            >
              {loading ? 'Inscription...' : 'S\'inscrire'.replace("'", "&apos;")}
            </button>
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-orange-600 hover:underline text-sm"
                onClick={() => setShowSignUp(false)}
              >
                Déjà un compte ? Se connecter
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Formulaire d'authentification (connexion) */}
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
              redirectTo={getRedirectUrl()}
              onlyThirdPartyProviders={false}
              magicLink={false}
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
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-orange-600 hover:underline text-sm"
                onClick={() => setShowSignUp(true)}
              >
                Pas de compte ? S&apos;inscrire
              </button>
            </div>
          </>
        )}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            En continuant, tu acceptes nos{' '}
            <a href="/legal/terms" className="text-orange-600 hover:text-orange-700 font-medium">
              conditions d&apos;utilisation
            </a>
            {' '}et notre{' '}
            <a href="/legal/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
              politique de confidentialité
            </a>
          </p>
        </div>
      </motion.div>
      
      {/* Bannière d'information discrète pour les navigateurs in-app */}
      {isInAppBrowser && !showInAppWarning && (
        <div className="fixed bottom-4 left-4 right-4 bg-amber-100 border border-amber-300 rounded-lg p-3 shadow-lg z-40">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <span>⚠️</span>
              <span>Pour Google, ouvre dans ton navigateur</span>
            </div>
            <button
              onClick={() => setShowInAppWarning(true)}
              className="text-amber-700 font-medium hover:text-amber-900"
            >
              Comment faire ?
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AuthContent />
    </Suspense>
  );
} 