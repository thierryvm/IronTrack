'use client';

import { useTheme } from '@/components/ui/ThemeProvider';

export default function ThemeDemoPage() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-surface-lightAlt dark:bg-surface-dark text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header avec toggle */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              🎨 Démo Système de Thème IronTrack
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Testez le passage instantané entre thème clair et sombre
            </p>
            
            <button
              onClick={toggleTheme}
              className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
            >
              {theme === 'dark' ? '☀️ Passer au clair' : '🌙 Passer au sombre'}
            </button>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Thème actuel: <strong className="text-brand-600">{theme}</strong>
            </div>
          </div>

          {/* Grille de démonstration des couleurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Surfaces */}
            <div className="bg-surface-light dark:bg-surface-darkAlt p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                🎭 Surfaces
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-surface-lightAlt dark:bg-surface-dark rounded-lg">
                  <span className="text-sm">Surface principale adaptative</span>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Surface secondaire</span>
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="bg-surface-light dark:bg-surface-darkAlt p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                🔥 Couleurs Brand
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-brand-500 text-white rounded-lg text-center text-sm font-medium">
                  brand-500
                </div>
                <div className="p-3 bg-brand-600 text-white rounded-lg text-center text-sm font-medium">
                  brand-600
                </div>
                <div className="p-3 bg-brand-700 text-white rounded-lg text-center text-sm font-medium">
                  brand-700
                </div>
                <div className="p-3 bg-brand-800 text-white rounded-lg text-center text-sm font-medium">
                  brand-800
                </div>
              </div>
            </div>

            {/* États système */}
            <div className="bg-surface-light dark:bg-surface-darkAlt p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                ⚡ États Système
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-success-50 dark:bg-success-500/20 border border-success-500/30 rounded-lg">
                  <span className="text-success-600 dark:text-success-400 text-sm font-medium">
                    ✅ Succès
                  </span>
                </div>
                <div className="p-3 bg-warning-50 dark:bg-warning-500/20 border border-warning-500/30 rounded-lg">
                  <span className="text-warning-600 dark:text-warning-400 text-sm font-medium">
                    ⚠️ Attention
                  </span>
                </div>
                <div className="p-3 bg-danger-50 dark:bg-danger-500/20 border border-danger-500/30 rounded-lg">
                  <span className="text-danger-600 dark:text-danger-400 text-sm font-medium">
                    ❌ Erreur
                  </span>
                </div>
              </div>
            </div>

            {/* Typographie */}
            <div className="bg-surface-light dark:bg-surface-darkAlt p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                📝 Typographie
              </h2>
              <div className="space-y-2">
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Texte principal</strong> - Lisibilité optimale
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Texte secondaire - Moins proéminent
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Texte tertiaire - Subtil
                </div>
              </div>
            </div>

          </div>

          {/* Section CSS Variables */}
          <div className="mt-12 bg-surface-light dark:bg-surface-darkAlt p-8 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              🛠️ Classes CSS Utilitaires
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-brand-600">Surfaces</h3>
                <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <div><code>.bg-theme-surface</code></div>
                  <div><code>.bg-theme-surface-alt</code></div>
                  <div><code>.bg-surface-light</code></div>
                  <div><code>.bg-surface-dark</code></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-brand-600">Textes</h3>
                <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <div><code>.text-theme-primary</code></div>
                  <div><code>.text-theme-secondary</code></div>
                  <div><code>.text-gray-900 dark:text-gray-100</code></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-brand-600">Bordures</h3>
                <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <div><code>.border-theme</code></div>
                  <div><code>.border-gray-200 dark:border-gray-700</code></div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                💡 Variables CSS disponibles
              </h4>
              <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
{`/* Surfaces */
--surface-light: #ffffff
--surface-dark: #0b1220
--surface-dark-alt: #111827

/* Brand */
--brand-500: #f97316
--brand-600: #ea580c

/* Variables dynamiques */
--background: (change selon thème)
--foreground: (change selon thème)`}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
              📋 Instructions d'utilisation
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300 text-sm">
              <li>Cliquez sur le bouton de toggle pour changer instantanément de thème</li>
              <li>Le thème est persistant (sauvegardé dans localStorage)</li>
              <li>Respecte automatiquement les préférences système de l'utilisateur</li>
              <li>Utilise les couleurs exactes spécifiées dans le design system</li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}