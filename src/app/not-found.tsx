'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-orange-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Page introuvable
          </h1>
          <p className="text-muted-foreground">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          
          <div className="text-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground dark:hover:text-foreground dark:hover:text-orange-400 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la page précédente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}