'use client'

import { useState } from 'react'
import { Users, Dumbbell, Calendar, HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'partners' | 'workouts' | 'general' | 'technical'
}

const faqData: FAQItem[] = [
  // Training Partners
  {
    id: 'partners-1',
    question: 'Comment inviter quelqu\'un comme partenaire d\'entraînement ?',
    answer: 'Allez dans "Training Partners" → onglet "Rechercher" → tapez le pseudo, nom ou email de la personne → cliquez "Inviter". L\'invitation sera envoyée et la personne pourra l\'accepter ou la refuser.',
    category: 'partners'
  },
  {
    id: 'partners-2',
    question: 'Mes partenaires peuvent-ils voir toutes mes séances ?',
    answer: 'Non, vos partenaires ne voient que vos séances si vous activez le bouton "Partenaires" dans le calendrier. De plus, vous pouvez gérer finement les paramètres de partage pour chaque partenaire.',
    category: 'partners'
  },
  {
    id: 'partners-3',
    question: 'Comment supprimer un partenaire ?',
    answer: 'Dans "Training Partners" → onglet "Mes Partenaires" → cliquez sur l\'icône poubelle à côté du partenaire. Le partenariat sera supprimé définitivement.',
    category: 'partners'
  },
  {
    id: 'partners-4',
    question: 'Que se passe-t-il si je refuse une invitation ?',
    answer: 'L\'invitation est simplement supprimée. La personne qui vous a invité ne recevra pas de notification de refus, l\'invitation disparaîtra juste de sa liste.',
    category: 'partners'
  },
  {
    id: 'partners-5',
    question: 'Puis-je annuler une invitation que j\'ai envoyée ?',
    answer: 'Oui, dans l\'onglet "Invitations" → section "Invitations Envoyées" → cliquez sur le X à côté de l\'invitation. Elle sera annulée immédiatement.',
    category: 'partners'
  },

  // Workouts
  {
    id: 'workouts-1',
    question: 'Comment créer une nouvelle séance d\'entraînement ?',
    answer: 'Cliquez sur "Nouvelle séance" dans le calendrier ou allez dans "Séances" → "Ajouter". Remplissez les informations : nom, type, exercices, date/heure, puis sauvegardez.',
    category: 'workouts'
  },
  {
    id: 'workouts-2',
    question: 'Puis-je modifier une séance déjà créée ?',
    answer: 'Oui, cliquez sur la séance dans le calendrier ou la liste des séances, puis modifiez les informations et sauvegardez.',
    category: 'workouts'
  },
  {
    id: 'workouts-3',
    question: 'Comment marquer une séance comme terminée ?',
    answer: 'Cliquez sur la séance et changez son statut vers "Terminé" ou "Réalisé". Vous pouvez aussi ajouter des notes sur votre performance.',
    category: 'workouts'
  },
  {
    id: 'workouts-4',
    question: 'Quels types d\'exercices puis-je ajouter ?',
    answer: 'IronTrack supporte tous types d\'exercices : Musculation, Cardio, Étirement, Yoga, Pilates, Natation, Crossfit, Gainage, Cours collectifs, etc.',
    category: 'workouts'
  },

  // General
  {
    id: 'general-1',
    question: 'Comment changer mon pseudo ?',
    answer: 'Allez dans "Profil" → modifiez le champ "Pseudo". C\'est ce nom que vos partenaires verront quand ils vous chercheront.',
    category: 'general'
  },
  {
    id: 'general-2',
    question: 'Comment activer le thème sombre ?',
    answer: 'Dans le menu de navigation, cliquez sur l\'icône lune/soleil pour basculer entre les thèmes clair et sombre.',
    category: 'general'
  },
  {
    id: 'general-3',
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Seuls vos partenaires acceptés peuvent voir les séances que vous choisissez de partager.',
    category: 'general'
  },
  {
    id: 'general-4',
    question: 'Comment supprimer mon compte ?',
    answer: 'Dans "Profil" → section "Actions" → "Supprimer le compte". Cette action est irréversible et supprimera toutes vos données.',
    category: 'general'
  },
  {
    id: 'general-5',
    question: 'L\'application fonctionne-t-elle hors ligne ?',
    answer: 'L\'application peut afficher une page hors ligne personnalisée, mais vous avez besoin d\'une connexion internet pour synchroniser vos données et voir les séances de vos partenaires.',
    category: 'general'
  },

  // Technical
  {
    id: 'technical-1',
    question: 'Je ne peux pas me connecter, que faire ?',
    answer: 'Vérifiez votre connexion internet, puis vos identifiants. Si le problème persiste, essayez de réinitialiser votre mot de passe ou contactez le support.',
    category: 'technical'
  },
  {
    id: 'technical-2',
    question: 'Le calendrier ne se charge pas, pourquoi ?',
    answer: 'Essayez de rafraîchir la page (F5). Si le problème persiste, vérifiez votre connexion internet ou essayez de vous déconnecter/reconnecter.',
    category: 'technical'
  },
  {
    id: 'technical-3',
    question: 'Les notifications ne fonctionnent pas',
    answer: 'Vérifiez que vous avez autorisé les notifications dans votre navigateur et dans vos paramètres de profil. Rechargez la page après avoir activé les notifications.',
    category: 'technical'
  },
  {
    id: 'technical-4',
    question: 'Comment signaler un bug ?',
    answer: 'Vous pouvez signaler les bugs dans la section Support ou en contactant l\'équipe de développement avec une description détaillée du problème.',
    category: 'technical'
  }
]

const categories = [
  { id: 'all', label: 'Toutes les questions', icon: HelpCircle, count: faqData.length },
  { id: 'partners', label: 'Training Partners', icon: Users, count: faqData.filter(f => f.category === 'partners').length },
  { id: 'workouts', label: 'Séances & Exercices', icon: Dumbbell, count: faqData.filter(f => f.category === 'workouts').length },
  { id: 'general', label: 'Général', icon: Calendar, count: faqData.filter(f => f.category === 'general').length },
  { id: 'technical', label: 'Technique', icon: HelpCircle, count: faqData.filter(f => f.category === 'technical').length }
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <HelpCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Questions Fréquentes (FAQ)</h1>
              <p className="text-gray-600">Trouvez rapidement les réponses à vos questions</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Catégories</h3>
              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  const isActive = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{category.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'Toutes les questions' : categories.find(c => c.id === selectedCategory)?.label}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredFAQ.length} question{filteredFAQ.length > 1 ? 's' : ''}
                </span>
              </div>

              {filteredFAQ.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'Aucune question trouvée pour votre recherche' : 'Aucune question dans cette catégorie'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQ.map((item) => {
                    const isOpen = openItems.includes(item.id)
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            <div className="pt-3 text-gray-700 leading-relaxed">
                              {item.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-md p-6 text-white">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Vous ne trouvez pas votre réponse ?</h3>
            <p className="text-purple-100 mb-4">
              Consultez notre guide complet ou contactez-nous pour obtenir de l'aide personnalisée
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/support"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Guide Complet
              </Link>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors border border-purple-400">
                Contacter le Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}