'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useInAppBrowserAuth } from '@/hooks/useInAppBrowserAuth';

interface EmailAuthFormGlassmorphismProps {
  onSwitchToGoogle?: () => void;
  showGoogleOption?: boolean;
}

export default function EmailAuthFormGlassmorphism({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSwitchToGoogle, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showGoogleOption = true 
}: EmailAuthFormGlassmorphismProps) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTitle = () => {
    if (showForgotPassword) return 'Récupère ton accès';
    return isSignUp ? 'Rejoins la communauté IronTrack' : 'Connexion';
  };

  const getButtonText = () => {
    if (isLoading) return showForgotPassword ? 'Envoi...' : isSignUp ? 'Inscription...' : 'Connexion...';
    return showForgotPassword ? 'Envoyer le lien de réinitialisation' : isSignUp ? 'Créer mon compte' : 'Se connecter';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full"
    >
      {/* Messages d'état */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl backdrop-blur-md bg-red-500/20 text-red-200 border border-red-400/30"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl backdrop-blur-md bg-green-500/20 text-green-200 border border-green-400/30"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulaire */}
      <motion.form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
            Adresse email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 w-5 h-5" />
            <motion.input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-md text-white placeholder-white/60"
              placeholder="ton-email@exemple.com"
              required
              autoComplete={isSignUp ? 'email' : 'username'}
              whileFocus={{ scale: 1.02 }}
            />
          </div>
        </div>

        {/* Mot de passe */}
        <AnimatePresence>
          {!showForgotPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 w-5 h-5" />
                <motion.input
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
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white/90 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation du mot de passe */}
        <AnimatePresence>
          {isSignUp && !showForgotPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 w-5 h-5" />
                <motion.input
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
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white/90 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              <AnimatePresence>
                {confirmPassword && password !== confirmPassword && (
                  <motion.p 
                    className="text-red-300 text-xs mt-1 flex items-center gap-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    🔄 Les mots de passe ne correspondent pas
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton de soumission */}
        <motion.button
          type="submit"
          disabled={isLoading || (isSignUp && password !== confirmPassword)}
          className="w-full bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg backdrop-blur-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>{getButtonText()}</span>
          )}
        </motion.button>
      </motion.form>

      {/* Navigation entre les modes */}
      <motion.div 
        className="mt-8 space-y-4 text-center text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {showForgotPassword ? (
            <motion.button
              key="forgot-back"
              onClick={() => switchMode('signin')}
              className="text-orange-300 hover:text-orange-200 font-medium transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
            >
              ← Retour à la connexion
            </motion.button>
          ) : (
            <motion.div
              key="login-signup"
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  resetForm()
                }}
                className="text-orange-300 hover:text-orange-200 font-medium transition-colors block w-full"
                whileHover={{ scale: 1.05 }}
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? Créer un compte'}
              </motion.button>
              
              <AnimatePresence>
                {!isSignUp && (
                  <motion.button
                    onClick={() => switchMode('forgot')}
                    className="text-white/90 hover:text-white/90 font-medium block w-full transition-colors"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    Mot de passe oublié ?
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}