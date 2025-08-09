'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { useInAppBrowserAuth } from '@/hooks/useInAppBrowserAuth';

interface EmailAuthFormProps {
  showGoogleOption?: boolean;
}

export default function EmailAuthForm({ showGoogleOption = true }: EmailAuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    isLoading,
    error,
    success,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    clearMessages
  } = useInAppBrowserAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (showForgotPassword) {
      await resetPassword(email);
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        return; // L'erreur sera gérée par la validation visuelle
      }
      await signUpWithEmail(email, password);
    } else {
      await signInWithEmail(email, password);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    clearMessages();
  };

  const switchMode = (mode: 'signin' | 'signup' | 'forgot') => {
    resetForm();
    setIsSignUp(mode === 'signup');
    setShowForgotPassword(mode === 'forgot');
  };

  const getTitle = () => {
    if (showForgotPassword) return 'Réinitialiser le mot de passe';
    return isSignUp ? 'Créer un compte' : 'Se connecter';
  };

  const getButtonText = () => {
    if (isLoading) return showForgotPassword ? 'Envoi...' : isSignUp ? 'Inscription...' : 'Connexion...';
    return showForgotPassword ? 'Envoyer le lien' : isSignUp ? 'S\'inscrire' : 'Se connecter';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="bg-transparent p-0">
        {/* Titre adapté */}
        <div className="text-center mb-6">
          <motion.p 
            className="text-white/90 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="inline w-4 h-4 mr-1" />
            {showForgotPassword ? 'Récupère ton accès' : 
             isSignUp ? 'Rejoins la communauté IronTrack' : 
             'Content de te revoir !'}
          </motion.p>
        </div>

        {/* Messages d'état glassmorphism */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-4 backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-4 backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          </motion.div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-md text-white placeholder-white/60"
                placeholder="ton-email@exemple.com"
                required
                autoComplete={isSignUp ? 'email' : 'username'}
              />
            </div>
          </div>

          {/* Mot de passe */}
          {!showForgotPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-md text-white placeholder-white/60"
                  placeholder={isSignUp ? 'Un mot de passe sécurisé (min. 8 caractères)' : 'Ton mot de passe'}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  minLength={isSignUp ? 8 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-white/70 mt-1">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              )}
            </div>
          )}

          {/* Confirmation du mot de passe */}
          {isSignUp && !showForgotPassword && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl focus:ring-2 transition-all backdrop-blur-md text-white placeholder-white/60 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-400/60 bg-red-500/10 focus:ring-red-400/50 focus:border-red-400/50'
                      : 'border-white/20 focus:ring-orange-400/50 focus:border-orange-400/50'
                  }`}
                  placeholder="Répète ton mot de passe"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-300 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  🔄 Les mots de passe ne correspondent pas
                </p>
              )}
            </div>
          )}

          {/* Bouton de soumission glassmorphism */}
          <button
            type="submit"
            disabled={isLoading || (isSignUp && password !== confirmPassword)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {getButtonText()}
              </div>
            ) : (
              getButtonText()
            )}
          </button>
        </form>

        {/* Navigation entre les modes glassmorphism */}
        <div className="mt-8 space-y-4 text-center text-sm">
          {showForgotPassword ? (
            <button
              onClick={() => switchMode('signin')}
              className="text-orange-300 hover:text-orange-200 font-medium transition-colors"
            >
              ⬅️ Retour à la connexion
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-orange-300 hover:text-orange-200 font-medium transition-colors block w-full"
              >
                {isSignUp ? '💡 Déjà un compte ? Se connecter' : '🆕 Pas encore de compte ? Créer un compte'}
              </button>
              
              {!isSignUp && (
                <button
                  onClick={() => switchMode('forgot')}
                  className="text-white/70 hover:text-white/90 font-medium block w-full transition-colors"
                >
                  🔑 Mot de passe oublié ?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}