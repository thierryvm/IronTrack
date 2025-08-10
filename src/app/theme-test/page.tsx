'use client'

import { useTheme } from '@/components/ui/ThemeProvider'

export default function ThemeTestPage() {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header de test */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">🎨 Test Thème IronTrack</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Thème actuel : <span className="font-semibold text-orange-600 dark:text-orange-400">
                {theme === 'dark' ? '🌙 Sombre' : '☀️ Clair'}
              </span>
            </p>
          </div>

          {/* Bouton de basculement */}
          <div className="text-center mb-8">
            <button
              onClick={toggleTheme}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {theme === 'dark' ? '☀️ Passer au thème clair' : '🌙 Passer au thème sombre'}
            </button>
          </div>

          {/* Cartes de test */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2">Carte Test 1</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Contraste testé : fond gris clair/sombre avec texte adapté.
              </p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
                  Action
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2">Carte Test 2</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Contraste testé : fond blanc/gris avec bordures adaptées.
              </p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
                  Valider
                </button>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-white/90 mb-2">
                Carte Colorée
              </h3>
              <p className="text-orange-800 dark:text-white/80">
                Contraste testé : fond coloré avec texte à contraste suffisant (≥4.5:1).
              </p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm">
                  IronTrack
                </button>
              </div>
            </div>
          </div>

          {/* Section diagnostic */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">🔍 Diagnostic</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Thème détecté:</span>
                <span className="font-mono">{theme}</span>
              </div>
              <div className="flex justify-between">
                <span>Component monté:</span>
                <span className="font-mono">{mounted ? 'true' : 'false'}</span>
              </div>
              <div className="flex justify-between">
                <span>Classe HTML dark:</span>
                <span className="font-mono">
                  {typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'true' : 'false'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>localStorage theme:</span>
                <span className="font-mono">
                  {typeof localStorage !== 'undefined' ? localStorage.getItem('theme') || 'null' : 'non disponible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Préférence système:</span>
                <span className="font-mono">
                  {typeof window !== 'undefined' && window.matchMedia ? 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
                    'non disponible'}
                </span>
              </div>
            </div>
          </div>

          {/* Tests de contraste */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">♿ Tests d'Accessibilité</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">✅ Contraste Correct</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                  Texte avec contraste ≥4.5:1 (WCAG AA)
                </p>
              </div>
              
              <div className="p-4 bg-orange-600 text-white rounded-lg">
                <h3 className="font-semibold">✅ Fond Coloré</h3>
                <p className="text-white/90 text-sm mt-2">
                  Texte blanc sur orange avec contraste suffisant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}