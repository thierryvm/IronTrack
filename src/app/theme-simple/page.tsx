'use client';

import { useEffect, useState } from 'react';

export default function ThemeSimplePage() {
  const [mounted, setMounted] = useState(false);
  const [themeState, setThemeState] = useState({
    isDark: false,
    savedTheme: 'null',
    systemPref: 'light'
  });

  useEffect(() => {
    setMounted(true);
    
    const updateDiagnostic = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const savedTheme = localStorage.getItem('theme') || 'null';
      const systemPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      
      setThemeState({
        isDark,
        savedTheme,
        systemPref
      });
    };

    updateDiagnostic();
  }, []);

  const handleToggle = () => {
    const el = document.documentElement;
    const isDark = el.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    setThemeState(prev => ({
      ...prev,
      isDark,
      savedTheme: isDark ? 'dark' : 'light'
    }));
  };

  // Éviter l'erreur d'hydratation en n'affichant pas les valeurs avant le montage
  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface-lightAlt text-gray-900 dark:bg-surface-dark dark:text-gray-100">
        <div className="container mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🎨 Test Thème IronTrack</h1>
            <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold">
              Chargement...
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-lightAlt text-gray-900 dark:bg-surface-dark dark:text-gray-100">
      <div className="container mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎨 Test Thème IronTrack</h1>
          <button 
            onClick={handleToggle}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors"
          >
            Basculer le thème
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-light dark:bg-surface-darkAlt p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Carte Test</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Cette carte utilise les couleurs surface exactes du système.
            </p>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Fond adaptatif selon le thème
              </p>
            </div>
          </div>

          <div className="bg-surface-light dark:bg-surface-darkAlt border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Diagnostic</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Classe HTML dark:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {themeState.isDark ? 'true' : 'false'}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">localStorage theme:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {themeState.savedTheme}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Préférence système:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {themeState.systemPref}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            🎯 Test du thème
          </h3>
          <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300 text-sm">
            <li>Cliquez sur "Basculer le thème" pour tester</li>
            <li>Le changement doit être instantané</li>
            <li>Les couleurs utilisent le système brand.* et surface.*</li>
            <li>L'état est sauvegardé dans localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}