'use client'

import React from 'react'
import { Input } from '@/components/ui/input'

// 🧪 PAGE TEST CHADCN/UI - Validation installation
export default function TestShadcnPage() {
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 TEST CHADCN/UI - Validation Installation
        </h1>

        {/* Test Input CHADCN */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ✅ Test Input CHADCN
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input CHADCN Standard
              </label>
              <Input 
                placeholder="Tapez ici pour tester..." 
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input CHADCN Disabled
              </label>
              <Input 
                placeholder="Input désactivé" 
                disabled
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Test Classes Tailwind */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ✅ Test Variables CSS CHADCN
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-primary text-primary-foreground rounded">
              <p>Background Primary + Text Primary Foreground</p>
            </div>
            
            <div className="p-4 bg-secondary text-secondary-foreground rounded">
              <p>Background Secondary + Text Secondary Foreground</p>
            </div>
            
            <div className="p-4 bg-muted text-muted-foreground rounded">
              <p>Background Muted + Text Muted Foreground</p>
            </div>
          </div>
        </div>

        {/* Test Responsive */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ✅ Test Responsive Design
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-100 rounded text-center">
              <p className="text-sm">Mobile: 1 col</p>
              <p className="text-sm">Tablet: 2 cols</p>
              <p className="text-sm">Desktop: 3 cols</p>
            </div>
            <div className="p-4 bg-green-100 rounded text-center">
              <p className="text-sm">Test Grid</p>
              <p className="text-sm">Responsive</p>
            </div>
            <div className="p-4 bg-purple-100 rounded text-center">
              <p className="text-sm">CHADCN/UI</p>
              <p className="text-sm">Installation OK</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            🎯 Instructions de Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-green-800">
            <li>Vérifier que les Input CHADCN s'affichent correctement</li>
            <li>Tester la responsivité (redimensionner la fenêtre)</li>
            <li>Vérifier que les variables CSS CHADCN fonctionnent</li>
            <li>Valider que les styles sont cohérents</li>
            <li>Tester l'interaction (focus, disabled, etc.)</li>
          </ol>
          
          <div className="mt-4 bg-green-100 rounded p-3">
            <p className="text-sm text-green-800">
              <strong>✅ Si tout fonctionne</strong> : CHADCN/UI est correctement installé et on peut commencer la migration !
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}