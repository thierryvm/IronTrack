'use client'

import React from'react'

interface ErrorBoundaryState {
 hasError: boolean
 error?: Error
}

interface ErrorBoundaryProps {
 children: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
 constructor(props: ErrorBoundaryProps) {
 super(props)
 this.state = { hasError: false}
}

 static getDerivedStateFromError(error: Error): ErrorBoundaryState {
 return { hasError: true, error}
}

 componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
 console.error('🚨 ErrorBoundary caught an error:', error, errorInfo)
}

 render() {
 if (this.state.hasError) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-background">
 <div className="text-center p-8">
 <h2 className="text-2xl font-bold text-foreground mb-4">
 Oups, une erreur est survenue
 </h2>
 <p className="text-gray-600 mb-6">
 Une erreur inattendue s'est produite. Veuillez actualiser la page.
 </p>
 <button
 onClick={() => window.location.reload()}
 className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-hover transition-colors"
 >
 Actualiser la page
 </button>
 </div>
 </div>
 )
}

 return this.props.children
}
}

export default ErrorBoundary