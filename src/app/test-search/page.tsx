'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Dumbbell, Calendar, Users, Apple, BarChart3, User, Settings, HelpCircle, Shield } from 'lucide-react';
import Link from 'next/link';

// Données de test simulées
const mockData = {
  exercises: [
    { id: '1', name: 'Développé couché', type: 'exercise', category: 'Pectoraux', url: '/exercises/1' },
    { id: '2', name: 'Squats', type: 'exercise', category: 'Jambes', url: '/exercises/2' },
    { id: '3', name: 'Tractions', type: 'exercise', category: 'Dos', url: '/exercises/3' },
    { id: '4', name: 'Développé militaire', type: 'exercise', category: 'Épaules', url: '/exercises/4' },
  ],
  workouts: [
    { id: '1', name: 'Push Day - Pectoraux & Épaules', type: 'workout', category: 'Séance', url: '/workouts/1' },
    { id: '2', name: 'Pull Day - Dos & Biceps', type: 'workout', category: 'Séance', url: '/workouts/2' },
    { id: '3', name: 'Leg Day - Jambes complètes', type: 'workout', category: 'Séance', url: '/workouts/3' },
  ],
  partners: [
    { id: '1', name: 'Jordan Vermeulen', type: 'partner', category: 'Partenaire', url: '/training-partners/1' },
    { id: '2', name: 'Marie Dupont', type: 'partner', category: 'Partenaire', url: '/training-partners/2' },
  ],
  pages: [
    { id: '1', name: 'Profil utilisateur', type: 'page', category: 'Page', url: '/profile' },
    { id: '2', name: 'Paramètres compte', type: 'page', category: 'Page', url: '/profile' },
    { id: '3', name: 'Support technique', type: 'page', category: 'Page', url: '/support' },
    { id: '4', name: 'FAQ - Questions fréquentes', type: 'page', category: 'Page', url: '/faq' },
    { id: '5', name: 'Administration', type: 'page', category: 'Page', url: '/admin' },
  ]
};

const getIcon = (type: string) => {
  switch (type) {
    case 'exercise': return Dumbbell;
    case 'workout': return Calendar;
    case 'partner': return Users;
    case 'nutrition': return Apple;
    case 'progress': return BarChart3;
    case 'page': return User;
    default: return Search;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case 'exercise': return 'bg-blue-500';
    case 'workout': return 'bg-green-500'; 
    case 'partner': return 'bg-purple-500';
    case 'nutrition': return 'bg-orange-500';
    case 'progress': return 'bg-yellow-500';
    case 'page': return 'bg-gray-500';
    default: return 'bg-gray-400';
  }
};

export default function TestSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction de recherche globale
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const allItems = [
      ...mockData.exercises,
      ...mockData.workouts,
      ...mockData.partners,
      ...mockData.pages
    ];

    return allItems.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    ).slice(0, 10); // Limiter à 10 résultats
  }, [searchQuery]);

  const performanceTest = () => {
    const startTime = performance.now();
    const testQuery = 'dev';
    
    // Simuler 1000 recherches
    for (let i = 0; i < 1000; i++) {
      const allItems = [
        ...mockData.exercises,
        ...mockData.workouts,
        ...mockData.partners,
        ...mockData.pages
      ];
      
      allItems.filter(item => 
        item.name.toLowerCase().includes(testQuery) ||
        item.category.toLowerCase().includes(testQuery)
      );
    }
    
    const endTime = performance.now();
    return endTime - startTime;
  };

  if (!mounted) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-surface-lightAlt dark:bg-surface-dark pt-20">
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              🔍 Test Recherche Globale
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Validation du système de recherche intégré au header
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Interface de recherche principale */}
            <div className="lg:col-span-2">
              <div className="bg-surface-light dark:bg-surface-darkAlt rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Interface de Recherche
                </h2>

                <div className="relative mb-6">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher exercices, séances, partenaires..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-500 text-lg transition-all"
                  />
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery ? `${searchResults.length} résultat(s) pour "${searchQuery}"` : 'Saisissez votre recherche...'}
                </div>

                {/* Résultats de recherche */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => {
                      const Icon = getIcon(result.type);
                      const color = getColor(result.type);
                      
                      return (
                        <Link
                          key={`${result.type}-${result.id}`}
                          href={result.url}
                          className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors group"
                        >
                          <div className={`p-2 rounded-lg ${color} text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                              {result.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {result.category}
                            </p>
                          </div>
                        </Link>
                      );
                    })
                  ) : searchQuery ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun résultat trouvé</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Commencez à taper pour rechercher...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel de statistiques */}
            <div className="space-y-6">
              <div className="bg-surface-light dark:bg-surface-darkAlt rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                  📊 Statistiques
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Exercices</span>
                    <span className="font-bold text-blue-600">{mockData.exercises.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Séances</span>
                    <span className="font-bold text-green-600">{mockData.workouts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Partenaires</span>
                    <span className="font-bold text-purple-600">{mockData.partners.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pages</span>
                    <span className="font-bold text-gray-600">{mockData.pages.length}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const time = performanceTest();
                    alert(`Test de performance : ${time.toFixed(2)}ms pour 1000 recherches`);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  🚀 Test Performance
                </button>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  ✅ Fonctionnalités
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  <li>• Recherche temps réel</li>
                  <li>• Multi-types (exercices, séances, etc.)</li>
                  <li>• Résultats cliquables</li>
                  <li>• Performance optimisée</li>
                  <li>• Interface responsive</li>
                  <li>• Mode sombre compatible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}