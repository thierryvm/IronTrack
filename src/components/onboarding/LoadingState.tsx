'use client'

interface LoadingStateProps {
 message?: string
}

export function LoadingState({ message ="Chargement..."}: LoadingStateProps) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-card border border-border rounded-full shadow-lg mb-4">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
 </div>
 <p className="text-gray-600 text-lg font-medium">{message}</p>
 <p className="text-gray-600 text-sm mt-2">Préparation de votre espace personnel...</p>
 </div>
 </div>
 )
}