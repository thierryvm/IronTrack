'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, HelpCircle, Bug, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const FloatingSupport = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldShow, setShouldShow] = useState(true)
  const pathname = usePathname()

  // Masquer sur certaines pages
  useEffect(() => {
    const hiddenPaths = [
      '/auth', 
      '/onboarding',
      '/support/contact', // Pas besoin sur la page de contact elle-même
      '/admin' // Pas besoin dans l'admin
    ]
    
    const shouldHide = hiddenPaths.some(path => 
      pathname.startsWith(path)
    )
    
    setShouldShow(!shouldHide)
    setIsOpen(false) // Fermer à chaque changement de page
  }, [pathname])

  if (!shouldShow) return null

  const supportOptions = [
    {
      title: 'Signaler un bug',
      description: 'Un problème technique',
      href: '/support/contact?category=bug',
      icon: Bug,
      color: 'text-red-600 bg-red-100'
    },
    {
      title: 'Demander de l\'aide',
      description: 'Besoin d\'assistance',
      href: '/support/contact?category=help',
      icon: HelpCircle,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Suggérer une amélioration',
      description: 'Idée de fonctionnalité',
      href: '/support/contact?category=feature',
      icon: Lightbulb,
      color: 'text-yellow-600 bg-yellow-100'
    }
  ]

  return (
    <>
      {/* Bouton principal flottant */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }} // Apparaît après 2 secondes
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-label="Support et aide"
          title="Besoin d'aide ?"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="message"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageSquare className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* Menu contextuel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-20 z-30 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu des options */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-40 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[280px]"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">
                  💬 Comment pouvons-nous vous aider ?
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choisissez le type de demande
                </p>
              </div>

              {/* Options */}
              <div className="py-2 space-y-1">
                {supportOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Link
                      key={option.title}
                      href={option.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg ${option.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {option.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}

                {/* Lien vers FAQ */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link
                    href="/faq"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    📚 Voir la FAQ complète
                  </Link>
                </div>
              </div>

              {/* Footer avec temps de réponse */}
              <div className="px-4 py-2 bg-green-50 rounded-lg mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-xs text-green-700 font-medium">
                    Réponse sous 24h en moyenne
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}