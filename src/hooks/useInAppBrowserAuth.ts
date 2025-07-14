'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { detectBrowserInfo, type BrowserInfo } from '@/utils/browserDetection';
import { validateEmail, validatePassword } from '@/utils/security';

interface AuthState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  browserInfo: BrowserInfo | null;
  isInAppBrowser: boolean;
  showInAppWarning: boolean;
}

interface AuthMethods {
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearMessages: () => void;
  setShowInAppWarning: (show: boolean) => void;
}

export function useInAppBrowserAuth(): AuthState & AuthMethods {
  const [supabase] = useState(() => createClient());
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: null,
    success: null,
    browserInfo: null,
    isInAppBrowser: false,
    showInAppWarning: false,
  });

  // Initialisation - détection du navigateur
  useEffect(() => {
    const browserInfo = detectBrowserInfo();
    setState(prev => ({
      ...prev,
      browserInfo,
      isInAppBrowser: browserInfo.isInAppBrowser,
      // Afficher automatiquement l'avertissement si on détecte un problème Google
      showInAppWarning: browserInfo.isInAppBrowser && 
        (window.location.search.includes('error=disallowed_useragent') ||
         window.location.search.includes('error=popup_blocked'))
    }));

    // Écouter les erreurs d'authentification dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error === 'disallowed_useragent') {
      setState(prev => ({
        ...prev,
        error: 'Connexion Google non autorisée depuis cette application. Utilisez votre navigateur principal.',
        showInAppWarning: true
      }));
    } else if (error === 'popup_blocked') {
      setState(prev => ({
        ...prev,
        error: 'Pop-up bloqué. Ouvrez le lien dans votre navigateur principal.',
        showInAppWarning: true
      }));
    } else if (error && errorDescription) {
      setState(prev => ({
        ...prev,
        error: decodeURIComponent(errorDescription)
      }));
    }
  }, []);

  // Méthode de connexion par email
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      // Validation côté client
      const emailValidation = validateEmail(email);
      if (emailValidation) {
        setState(prev => ({ ...prev, error: emailValidation.message, isLoading: false }));
        return;
      }

      const passwordValidation = validatePassword(password);
      if (passwordValidation) {
        setState(prev => ({ ...prev, error: passwordValidation.message, isLoading: false }));
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        setState(prev => ({ 
          ...prev, 
          error: error.message === 'Invalid login credentials' 
            ? 'Email ou mot de passe incorrect'
            : error.message,
          isLoading: false 
        }));
        return;
      }

      if (data.user) {
        setState(prev => ({ 
          ...prev, 
          success: 'Connexion réussie !',
          isLoading: false 
        }));
      }
    } catch {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur de connexion. Veuillez réessayer.',
        isLoading: false 
      }));
    }
  }, [supabase.auth]);

  // Méthode d'inscription par email
  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      // Validation côté client
      const emailValidation = validateEmail(email);
      if (emailValidation) {
        setState(prev => ({ ...prev, error: emailValidation.message, isLoading: false }));
        return;
      }

      const passwordValidation = validatePassword(password);
      if (passwordValidation) {
        setState(prev => ({ ...prev, error: passwordValidation.message, isLoading: false }));
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        setState(prev => ({ 
          ...prev, 
          error: error.message === 'User already registered'
            ? 'Un compte existe déjà avec cet email'
            : error.message,
          isLoading: false 
        }));
        return;
      }

      if (data.user) {
        setState(prev => ({ 
          ...prev, 
          success: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.',
          isLoading: false 
        }));
      }
    } catch {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur d\'inscription. Veuillez réessayer.',
        isLoading: false 
      }));
    }
  }, [supabase.auth]);

  // Méthode de réinitialisation de mot de passe
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      const emailValidation = validateEmail(email);
      if (emailValidation) {
        setState(prev => ({ ...prev, error: emailValidation.message, isLoading: false }));
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/auth?change_password=1`
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, isLoading: false }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        success: 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.',
        isLoading: false 
      }));
    } catch {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.',
        isLoading: false 
      }));
    }
  }, [supabase.auth]);

  // Utilitaires
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: null, success: null }));
  }, []);

  const setShowInAppWarning = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showInAppWarning: show }));
  }, []);

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    clearMessages,
    setShowInAppWarning
  };
}