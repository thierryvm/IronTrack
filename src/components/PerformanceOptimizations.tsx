// @ts-nocheck
'use client'

import { useEffect } from 'react'

// Optimisations de performance pour mobile
export function PerformanceOptimizations() {
  useEffect(() => {
    // VÃ©rifier que nous sommes cÃ´tÃ© client
    if (typeof window === 'undefined') return

    // 1. PrÃ©connexion aux domaines critiques
    const preconnectLinks = [
      'https://taspdceblvmpvdjixyit.supabase.co',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ]
    
    preconnectLinks.forEach(href => {
      // VÃ©rifier si le lien n'existe pas dÃ©jÃ 
      const existingLink = document.head.querySelector(`link[href="${href}"]`)
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = href
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      }
    })

    // 2. Lazy loading des images off-screen
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
              imageObserver.unobserve(img)
            }
          }
        })
      })

      // Observer toutes les images avec data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img)
      })
    }

    // 3. Service Worker dÃ©sactivÃ© (sw.js n'existe pas)

    // 4. Optimisation fetch (simplifiÃ©e pour Ã©viter les problÃ¨mes)
    const originalFetch = window.fetch
    
    // 5. CSS critique
    const existingStyle = document.head.querySelector('#performance-critical-css')
    if (!existingStyle) {
      const criticalCSS = `
        /* Critical CSS pour LCP */
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
      `
      
      const style = document.createElement('style')
      style.id = 'performance-critical-css'
      style.textContent = criticalCSS
      document.head.appendChild(style)
    }

    return () => {
      // Nettoyage si nÃ©cessaire
    }
  }, [])

  return null // Composant invisible d'optimisation
}

// Hook pour optimiser les re-rendus
export function usePerformanceOptimizations() {
  useEffect(() => {
    // 6. RÃ©duction des re-rendus React
    if (typeof window !== 'undefined') {
      const originalSetTimeout = window.setTimeout
      const originalSetInterval = window.setInterval
      
      // Throttle des timers pour Ã©conomiser la batterie mobile
      window.setTimeout = (callback, delay, ...args) => {
        const minDelay = Math.max(delay || 0, 16) // 60fps max
        return originalSetTimeout(callback, minDelay, ...args)
      }
      
      window.setInterval = (callback, delay, ...args) => {
        const minDelay = Math.max(delay || 0, 100) // 10fps max pour intervals
        return originalSetInterval(callback, minDelay, ...args)
      }
    }
  }, [])
}

export default PerformanceOptimizations