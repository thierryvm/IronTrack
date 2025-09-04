/**
 * ACCESSIBILITÉ CRITIQUE: Correctifs CSS pour passer de 75% → 90%+
 * Version simplifiée sans erreurs TypeScript - Impact maximum
 */
'use client'

import { useEffect } from 'react'

// HOOK: Correctifs CSS critiques d'accessibilité
function useAccessibilityFixes() {
  useEffect(() => {
    // Injection CSS correctifs WCAG 2.1 AA
    const style = document.createElement('style')
    style.setAttribute('data-a11y-fixes', 'true')
    style.textContent = `
      /* CORRECTIFS CONTRASTE WCAG 2.1 AA (4.5:1) */
      
      /* Texte gris SEULEMENT si pas de classe contexte */
      .text-gray-600 dark:text-safe-muted:not([class*="menu"]):not([class*="nav"]):not([class*="header"]) { 
        color: #6b7280 !important; 
      }
      .text-gray-700 dark:text-gray-300:not([class*="menu"]):not([class*="nav"]):not([class*="header"]) { 
        color: #4b5563 !important; 
      }
      
      /* Links navigation préservés - SEULEMENT contenu principal */
      main a:not(.btn-primary):not(.bg-orange-600):not([class*="text-"]) {
        text-decoration: underline;
      }
      main a:hover:not(.btn-primary):not([class*="hover:"]) {
        color: #ea580c !important;
      }
      
      /* Boutons secondaires - SEULEMENT sans classe */
      button:not([class*="bg-"]):not([class*="text-"]):not(.btn-primary) {
        color: #374151 !important;
        border-color: #374151 !important;
      }
      
      /* Placeholders */
      input::placeholder,
      textarea::placeholder {
        color: #4b5563 !important; /* Minimum 4.5:1 */
      }
      
      /* États focus TRÈS visibles */
      button:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible,
      a:focus-visible {
        outline: 3px solid #ea580c !important;
        outline-offset: 2px !important;
        background-color: rgba(234, 88, 12, 0.1) !important;
      }
      
      /* Touch targets minimum 44px */
      button,
      a,
      input[type="button"],
      input[type="submit"] {
        min-height: 44px !important;
        min-width: 44px !important;
      }
      
      /* Touch targets mobiles 48px */
      @media (max-width: 768px) {
        button,
        a,
        input[type="button"],
        input[type="submit"],
        .supabase-auth-ui_ui-button,
        .supabase-auth-ui_ui-input {
          min-height: 48px !important;
          font-size: 16px !important;
        }
      }
      
      /* Skip link visible au focus */
      a[href="#main-content"]:focus {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 9999 !important;
        background: #ea580c !important;
        color: white !important;
        padding: 8px 16px !important;
        text-decoration: none !important;
        font-weight: 600 !important;
      }
      
      /* Images décoratives */
      img[alt=""] {
        role: presentation;
        aria-hidden: true;
      }
      
      /* Améliorations formulaires */
      input:not([aria-label]):not([aria-labelledby]) {
        border: 2px solid #374151 !important;
      }
      
      /* États d'erreur visibles */
      input:invalid {
        border-color: #dc2626 !important;
        background-color: #fef2f2 !important;
      }
      
      /* Navigation principale visible */
      nav[role="navigation"] {
        border: 1px solid transparent;
      }
      nav[role="navigation"]:focus-within {
        border-color: #ea580c !important;
      }
      
      /* Indicateur page actuelle */
      .nav-link.active {
        background-color: #ea580c !important;
        color: white !important;
        font-weight: 600 !important;
      }
    `
    
    // Éviter duplication
    if (!document.querySelector('[data-a11y-fixes]')) {
      document.head.appendChild(style)
    }

    // Cleanup
    return () => {
      const injectedStyles = document.querySelector('[data-a11y-fixes]')
      if (injectedStyles) {
        injectedStyles.remove()
      }
    }
  }, [])
}

// COMPOSANT: Correctifs d'accessibilité invisible
export function AccessibilityFixes() {
  useAccessibilityFixes()
  return null // Composant invisible
}

// COMPOSANT: Badge indicateur (optionnel)
export function AccessibilityIndicator() {
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div 
      className="fixed bottom-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-xs z-50 opacity-80"
      role="status"
      aria-live="polite"
    >
      ♿ A11Y+
    </div>
  )
}

export default AccessibilityFixes