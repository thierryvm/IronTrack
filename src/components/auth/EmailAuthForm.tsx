'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useInAppBrowserAuth } from '@/hooks/useInAppBrowserAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailAuthFormProps {
  showGoogleOption?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EmailAuthForm({ showGoogleOption }: EmailAuthFormProps) {
  // Note: Google Auth conditionnel sera implémenté dans une prochaine version
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

  // getTitle supprimé - titre maintenant géré par la page parente

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
        {/* Titre supprimé - déjà en haut de la page */}

        {/* Messages d'état glassmorphism */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            role="alert"
            aria-live="polite"
            className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-4 backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p id="email-error" className="text-red-100 text-sm font-medium">{error}</p>
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
            <Label htmlFor="email" className="text-sm font-medium text-white/90">
              Adresse email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 w-5 h-5" />
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-md text-white placeholder-white/60"
                placeholder="ton-email@exemple.com"
                required
                autoComplete={isSignUp ? 'email' : 'username'}
                aria-describedby={error ? "email-error" : undefined}
                aria-invalid={!!error}
              />
            </div>
          </div>

          {/* Mot de passe */}
          {!showForgotPassword && (
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-white/90">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-md text-white placeholder-white/60"
                  placeholder={isSignUp ? 'Un mot de passe sécurisé (min. 8 caractères)' : 'Ton mot de passe'}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  minLength={isSignUp ? 8 : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {isSignUp && (
                <p className="text-xs text-white/90 mt-1">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              )}
            </div>
          )}

          {/* Confirmation du mot de passe */}
          {isSignUp && !showForgotPassword && (
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/90">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 transition-all backdrop-blur-md text-white placeholder-white/60 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-400/60 bg-red-500/15 focus:ring-red-400/50 focus:border-red-400/50'
                      : 'bg-white/10 dark:bg-gray-900/20 border-white/30 dark:border-gray-700/30 focus:ring-orange-400/50 focus:border-orange-400/50'
                  }`}
                  placeholder="Répète ton mot de passe"
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                  aria-label={showConfirmPassword ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
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
          <Button
            type="submit"
            disabled={isLoading || (isSignUp && password !== confirmPassword)}
            className="w-full bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-md h-auto"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {getButtonText()}
              </div>
            ) : (
              getButtonText()
            )}
          </Button>
        </form>

        {/* Navigation entre les modes glassmorphism */}
        <div className="mt-8 space-y-4 text-center text-sm">
          {showForgotPassword ? (
            <Button
              variant="ghost"
              onClick={() => switchMode('signin')}
              className="text-orange-300 hover:text-orange-200 font-medium transition-colors h-auto p-0 hover:bg-transparent"
            >
              ⬅️ Retour à la connexion
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-orange-300 hover:text-orange-200 font-medium transition-colors w-full h-auto p-2 hover:bg-transparent"
              >
                {isSignUp ? '💡 Déjà un compte ? Se connecter' : '🆕 Pas encore de compte ? Créer un compte'}
              </Button>
              
              {!isSignUp && (
                <Button
                  variant="ghost"
                  onClick={() => switchMode('forgot')}
                  className="text-white/90 hover:text-white font-medium w-full transition-colors h-auto p-2 hover:bg-white/10"
                >
                  🔑 Mot de passe oublié ?
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}