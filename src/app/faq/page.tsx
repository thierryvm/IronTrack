'use client'

import { useState } from 'react'
import { Users, Dumbbell, Calendar, HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: &apos;partners&apos; | &apos;workouts&apos; | &apos;general&apos; | &apos;technical&apos;
}

const faqData: FAQItem[] = [
  // Training Partners
  {
    id: &apos;partners-1&apos;,
    question: &apos;Comment inviter quelqu\&apos;un comme partenaire d\&apos;entraînement ?&apos;,
    answer: &apos;Allez dans "Training Partners" → onglet "Rechercher" → tapez le pseudo, nom ou email de la personne → cliquez "Inviter". L\&apos;invitation sera envoyée et la personne pourra l\&apos;accepter ou la refuser.&apos;,
    category: &apos;partners&apos;
  },
  {
    id: &apos;partners-2&apos;,
    question: &apos;Mes partenaires peuvent-ils voir toutes mes séances ?&apos;,
    answer: &apos;Non, vos partenaires ne voient que vos séances si vous activez le bouton "Partenaires" dans le calendrier. De plus, vous pouvez gérer finement les paramètres de partage pour chaque partenaire.&apos;,
    category: &apos;partners&apos;
  },
  {
    id: &apos;partners-3&apos;,
    question: &apos;Comment supprimer un partenaire ?&apos;,
    answer: &apos;Dans "Training Partners" → onglet "Mes Partenaires" → cliquez sur l\&apos;icône poubelle à côté du partenaire. Le partenariat sera supprimé définitivement.&apos;,
    category: &apos;partners&apos;
  },
  {
    id: &apos;partners-4&apos;,
    question: &apos;Que se passe-t-il si je refuse une invitation ?&apos;,
    answer: &apos;L\&apos;invitation est simplement supprimée. La personne qui vous a invité ne recevra pas de notification de refus, l\&apos;invitation disparaîtra juste de sa liste.&apos;,
    category: &apos;partners&apos;
  },
  {
    id: &apos;partners-5&apos;,
    question: &apos;Puis-je annuler une invitation que j\&apos;ai envoyée ?&apos;,
    answer: &apos;Oui, dans l\&apos;onglet "Invitations" → section "Invitations Envoyées" → cliquez sur le X à côté de l\&apos;invitation. Elle sera annulée immédiatement.&apos;,
    category: &apos;partners&apos;
  },

  // Workouts
  {
    id: &apos;workouts-1&apos;,
    question: &apos;Comment créer une nouvelle séance d\&apos;entraînement ?&apos;,
    answer: &apos;Cliquez sur "Nouvelle séance" dans le calendrier ou allez dans "Séances" → "Ajouter". Remplissez les informations : nom, type, exercices, date/heure, puis sauvegardez.&apos;,
    category: &apos;workouts&apos;
  },
  {
    id: &apos;workouts-2&apos;,
    question: &apos;Puis-je modifier une séance déjà créée ?&apos;,
    answer: &apos;Oui, cliquez sur la séance dans le calendrier ou la liste des séances, puis modifiez les informations et sauvegardez.&apos;,
    category: &apos;workouts&apos;
  },
  {
    id: &apos;workouts-3&apos;,
    question: &apos;Comment marquer une séance comme terminée ?&apos;,
    answer: &apos;Cliquez sur la séance et changez son statut vers "Terminé" ou "Réalisé". Vous pouvez aussi ajouter des notes sur votre performance.&apos;,
    category: &apos;workouts&apos;
  },
  {
    id: &apos;workouts-4&apos;,
    question: &apos;Quels types d\&apos;exercices puis-je ajouter ?&apos;,
    answer: &apos;IronTrack supporte tous types d\&apos;exercices : Musculation, Cardio, Étirement, Yoga, Pilates, Natation, Crossfit, Gainage, Cours collectifs, etc.&apos;,
    category: &apos;workouts&apos;
  },

  // General
  {
    id: &apos;general-1&apos;,
    question: &apos;Comment changer mon pseudo ?&apos;,
    answer: &apos;Allez dans "Profil" → modifiez le champ "Pseudo". C\&apos;est ce nom que vos partenaires verront quand ils vous chercheront.&apos;,
    category: &apos;general&apos;
  },
  {
    id: &apos;general-2&apos;,
    question: &apos;Comment activer le thème sombre ?&apos;,
    answer: &apos;Dans le menu de navigation, cliquez sur l\&apos;icône lune/soleil pour basculer entre les thèmes clair et sombre.&apos;,
    category: &apos;general&apos;
  },
  {
    id: &apos;general-3&apos;,
    question: &apos;Mes données sont-elles sécurisées ?&apos;,
    answer: &apos;Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Seuls vos partenaires acceptés peuvent voir les séances que vous choisissez de partager.&apos;,
    category: &apos;general&apos;
  },
  {
    id: &apos;general-4&apos;,
    question: &apos;Comment supprimer mon compte ?&apos;,
    answer: &apos;Dans "Profil" → section "Actions" → "Supprimer le compte". Cette action est irréversible et supprimera toutes vos données.&apos;,
    category: &apos;general&apos;
  },
  {
    id: &apos;general-5&apos;,
    question: &apos;L\&apos;application fonctionne-t-elle hors ligne ?&apos;,
    answer: &apos;L\&apos;application peut afficher une page hors ligne personnalisée, mais vous avez besoin d\&apos;une connexion internet pour synchroniser vos données et voir les séances de vos partenaires.&apos;,
    category: &apos;general&apos;
  },

  // Technical
  {
    id: &apos;technical-1&apos;,
    question: &apos;Je ne peux pas me connecter, que faire ?&apos;,
    answer: &apos;Vérifiez votre connexion internet, puis vos identifiants. Si le problème persiste, essayez de réinitialiser votre mot de passe ou contactez le support.&apos;,
    category: &apos;technical&apos;
  },
  {
    id: &apos;technical-2&apos;,
    question: &apos;Le calendrier ne se charge pas, pourquoi ?&apos;,
    answer: &apos;Essayez de rafraîchir la page (F5). Si le problème persiste, vérifiez votre connexion internet ou essayez de vous déconnecter/reconnecter.&apos;,
    category: &apos;technical&apos;
  },
  {
    id: &apos;technical-3&apos;,
    question: &apos;Les notifications ne fonctionnent pas&apos;,
    answer: &apos;Vérifiez que vous avez autorisé les notifications dans votre navigateur et dans vos paramètres de profil. Rechargez la page après avoir activé les notifications.&apos;,
    category: &apos;technical&apos;
  },
  {
    id: &apos;technical-4&apos;,
    question: &apos;Comment signaler un bug ?&apos;,
    answer: &apos;Vous pouvez signaler les bugs dans la section Support ou en contactant l\&apos;équipe de développement avec une description détaillée du problème.&apos;,
    category: &apos;technical&apos;
  }
]

const categories = [
  { id: &apos;all&apos;, label: &apos;Toutes les questions&apos;, icon: HelpCircle, count: faqData.length },
  { id: &apos;partners&apos;, label: &apos;Training Partners&apos;, icon: Users, count: faqData.filter(f => f.category === &apos;partners&apos;).length },
  { id: &apos;workouts&apos;, label: &apos;Séances & Exercices&apos;, icon: Dumbbell, count: faqData.filter(f => f.category === &apos;workouts&apos;).length },
  { id: &apos;general&apos;, label: &apos;Général&apos;, icon: Calendar, count: faqData.filter(f => f.category === &apos;general&apos;).length },
  { id: &apos;technical&apos;, label: &apos;Technique&apos;, icon: HelpCircle, count: faqData.filter(f => f.category === &apos;technical&apos;).length }
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>(&apos;all&apos;)
  const [openItems, setOpenItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(&apos;&apos;)

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === &apos;all&apos; || item.category === selectedCategory
    const matchesSearch = searchQuery === &apos;&apos; || 
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
                          ? &apos;bg-purple-50 text-purple-700 border border-purple-200&apos;
                          : &apos;hover:bg-gray-50 text-gray-700&apos;
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{category.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive 
                          ? &apos;bg-purple-100 text-purple-700&apos; 
                          : &apos;bg-gray-100 text-gray-600&apos;
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
                  {selectedCategory === &apos;all&apos; ? &apos;Toutes les questions&apos; : categories.find(c => c.id === selectedCategory)?.label}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredFAQ.length} question{filteredFAQ.length > 1 ? &apos;s&apos; : &apos;&apos;}
                </span>
              </div>

              {filteredFAQ.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? &apos;Aucune question trouvée pour votre recherche&apos; : &apos;Aucune question dans cette catégorie&apos;}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery(&apos;&apos;)}
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
              Consultez notre guide complet ou contactez-nous pour obtenir de l&apos;aide personnalisée
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