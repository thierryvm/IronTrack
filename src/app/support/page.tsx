'use client'

import { useState } from 'react'
import { Users, UserPlus, Search, Check, X, Clock, Settings, ArrowRight, BookOpen, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  const [activeSection, setActiveSection] = useState<'partners' | 'general' | 'account'>('partners')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <HelpCircle className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aide & Support</h1>
              <p className="text-gray-600">Guides et documentation pour utiliser IronTrack</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {[
                  { id: 'partners', label: 'Training Partners', icon: Users, desc: 'Partenaires d&apos;entraînement' },
                  { id: 'general', label: 'Utilisation générale', icon: BookOpen, desc: 'Fonctionnalités de base' },
                  { id: 'account', label: 'Compte & Profil', icon: Settings, desc: 'Gestion du compte' }
                ].map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as 'partners' | 'general' | 'account')}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-start space-x-3 ${
                        activeSection === section.id
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{section.label}</p>
                        <p className="text-sm opacity-75">{section.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              
              {/* Training Partners Guide */}
              {activeSection === 'partners' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="h-6 w-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-gray-900">Training Partners - Guide Complet</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Introduction */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Qu&apos;est-ce que Training Partners ?</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                        <p className="text-blue-800">
                          <strong>Training Partners</strong> vous permet de vous connecter avec d&apos;autres utilisateurs IronTrack 
                          pour partager vos séances d&apos;entraînement, vous motiver mutuellement et voir les calendriers de vos partenaires.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <UserPlus className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-900">Inviter</h4>
                          <p className="text-sm text-gray-600">Envoyez des invitations à vos amis</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-900">Partager</h4>
                          <p className="text-sm text-gray-600">Partagez vos séances d&apos;entraînement</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Settings className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-900">Contrôler</h4>
                          <p className="text-sm text-gray-600">Gérez vos paramètres de partage</p>
                        </div>
                      </div>
                    </section>

                    {/* Étape 1 : Accéder à Training Partners */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📱 Étape 1 : Accéder à Training Partners</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                          <li>Dans la navigation principale, cliquez sur <strong>&quot;Partenaires&quot;</strong></li>
                          <li>Ou allez dans le menu mobile (hamburger) et sélectionnez <strong>&quot;Partenaires&quot;</strong></li>
                          <li>Vous arrivez sur la page Training Partners avec 3 onglets</li>
                        </ol>
                      </div>
                    </section>

                    {/* Étape 2 : Rechercher et Inviter */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Étape 2 : Rechercher et Inviter des Partenaires</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Search className="h-4 w-4 text-blue-500 mr-2" />
                            Onglet &quot;Rechercher&quot;
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                            <li>Cliquez sur l&apos;onglet <strong>&quot;Rechercher&quot;</strong></li>
                            <li>Tapez le <strong>pseudo</strong>, <strong>nom</strong> ou <strong>email</strong> de la personne</li>
                            <li>Les résultats apparaissent en temps réel (minimum 2 caractères)</li>
                            <li>Cliquez sur <strong>&quot;Inviter&quot;</strong> à côté du nom de la personne</li>
                            <li>L&apos;invitation est envoyée ! 🎉</li>
                          </ol>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-yellow-800 text-sm">
                            <strong>💡 Astuce :</strong> Si la personne n&apos;apparaît pas, vérifiez qu&apos;elle utilise bien IronTrack et demandez-lui son pseudo exact.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Étape 3 : Gérer les Invitations */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📩 Étape 3 : Gérer les Invitations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                          <h4 className="font-medium text-green-900 mb-2">Invitations Reçues</h4>
                          <ul className="space-y-1 text-green-800 text-sm">
                            <li>• Vous recevez une notification</li>
                            <li>• Allez dans l&apos;onglet <strong>&quot;Invitations&quot;</strong></li>
                            <li>• Cliquez <Check className="h-3 w-3 inline text-green-600" /> <strong>&quot;Accepter&quot;</strong> ou <X className="h-3 w-3 inline text-red-600" /> <strong>&quot;Refuser&quot;</strong></li>
                          </ul>
                        </div>
                        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <h4 className="font-medium text-blue-900 mb-2">Invitations Envoyées</h4>
                          <ul className="space-y-1 text-blue-800 text-sm">
                            <li>• Statut <Clock className="h-3 w-3 inline text-yellow-500" /> <strong>&quot;En attente&quot;</strong></li>
                            <li>• Vous pouvez annuler avec <X className="h-3 w-3 inline text-red-600" /></li>
                            <li>• Notification quand acceptée</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* Étape 4 : Partager les Séances */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏋️ Étape 4 : Voir les Séances des Partenaires</h3>
                      <div className="space-y-4">
                        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                          <h4 className="font-medium text-orange-900 mb-2">Dans le Calendrier</h4>
                          <ol className="list-decimal list-inside space-y-1 text-orange-800 text-sm">
                            <li>Allez dans <strong>&quot;Calendrier&quot;</strong></li>
                            <li>Cliquez sur le bouton <Users className="h-3 w-3 inline text-blue-500" /> <strong>&quot;Partenaires&quot;</strong> en haut</li>
                            <li>Les séances de vos partenaires apparaissent avec leurs avatars</li>
                            <li>Distinction visuelle : vos séances vs celles des partenaires</li>
                          </ol>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-purple-800 text-sm">
                            <strong>🔒 Sécurité :</strong> Seuls vos partenaires acceptés peuvent voir vos séances. Vous contrôlez totalement qui voit quoi.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Étape 5 : Gérer les Partenaires */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">⚙️ Étape 5 : Gérer vos Partenaires</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Onglet &quot;Mes Partenaires&quot;</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-700 mb-2">Actions disponibles :</p>
                              <ul className="space-y-1 text-sm text-gray-600">
                                <li>• <Settings className="h-3 w-3 inline text-gray-500" /> Paramètres de partage</li>
                                <li>• <X className="h-3 w-3 inline text-red-500" /> Supprimer le partenariat</li>
                                <li>• Voir la date de connexion</li>
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm text-gray-700 mb-2">Paramètres de partage :</p>
                              <ul className="space-y-1 text-sm text-gray-600">
                                <li>• 🏋️ Séances d&apos;entraînement</li>
                                <li>• 🥗 Nutrition (à venir)</li>
                                <li>• 📈 Progression (à venir)</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Conseils et Bonnes Pratiques */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Conseils et Bonnes Pratiques</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2">✅ À Faire</h4>
                          <ul className="space-y-1 text-sm text-green-800">
                            <li>• Invitez vos amis réels qui utilisent IronTrack</li>
                            <li>• Utilisez des pseudos reconnaissables</li>
                            <li>• Planifiez des séances ensemble</li>
                            <li>• Motivez-vous mutuellement</li>
                          </ul>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-900 mb-2">❌ À Éviter</h4>
                          <ul className="space-y-1 text-sm text-red-800">
                            <li>• Inviter des inconnus au hasard</li>
                            <li>• Partager des informations sensibles</li>
                            <li>• Laisser des invitations en attente longtemps</li>
                            <li>• Oublier de gérer vos paramètres</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* Dépannage */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Problèmes Courants</h3>
                      <div className="space-y-3">
                        <details className="border border-gray-200 rounded-lg">
                          <summary className="p-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                            &quot;Je ne trouve pas mon ami dans la recherche&quot;
                          </summary>
                          <div className="p-3 pt-0 text-sm text-gray-700">
                            <ul className="space-y-1">
                              <li>• Vérifiez que votre ami utilise bien IronTrack</li>
                              <li>• Demandez-lui son pseudo exact (sensible à la casse)</li>
                              <li>• Essayez avec son email ou nom complet</li>
                              <li>• Attendez qu&apos;il crée son compte s&apos;il est nouveau</li>
                            </ul>
                          </div>
                        </details>

                        <details className="border border-gray-200 rounded-lg">
                          <summary className="p-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                            &quot;Je ne vois pas les séances de mes partenaires&quot;
                          </summary>
                          <div className="p-3 pt-0 text-sm text-gray-700">
                            <ul className="space-y-1">
                              <li>• Vérifiez que le bouton &quot;Partenaires&quot; est activé dans le calendrier</li>
                              <li>• Assurez-vous que le partenariat est accepté (onglet &quot;Mes Partenaires&quot;)</li>
                              <li>• Votre partenaire doit avoir des séances planifiées</li>
                              <li>• Rafraîchissez la page</li>
                            </ul>
                          </div>
                        </details>

                        <details className="border border-gray-200 rounded-lg">
                          <summary className="p-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                            &quot;Mon invitation reste en attente&quot;
                          </summary>
                          <div className="p-3 pt-0 text-sm text-gray-700">
                            <ul className="space-y-1">
                              <li>• Votre ami doit aller dans &quot;Invitations&quot; pour accepter</li>
                              <li>• Rappelez-lui de vérifier l&apos;onglet &quot;Invitations reçues&quot;</li>
                              <li>• Vous pouvez annuler et renvoyer l&apos;invitation</li>
                              <li>• Vérifiez que vous avez le bon utilisateur</li>
                            </ul>
                          </div>
                        </details>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* General Usage */}
              {activeSection === 'general' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Utilisation Générale d&apos;IronTrack</h2>
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏋️ Créer une Séance</h3>
                      <p className="text-gray-700 mb-2">Pour créer une nouvelle séance d&apos;entraînement :</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700">
                        <li>Allez dans &quot;Séances&quot; ou &quot;Calendrier&quot;</li>
                        <li>Cliquez sur &quot;Nouvelle séance&quot;</li>
                        <li>Remplissez les informations (nom, type, exercices)</li>
                        <li>Définissez la date et l&apos;heure</li>
                        <li>Sauvegardez</li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Suivre sa Progression</h3>
                      <p className="text-gray-700 mb-2">Dans la section &quot;Progression&quot; :</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Visualisez vos statistiques d&apos;entraînement</li>
                        <li>Suivez votre évolution dans le temps</li>
                        <li>Analysez vos performances par type d&apos;exercice</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🍎 Nutrition</h3>
                      <p className="text-gray-700">
                        Gérez votre alimentation et suivez vos objectifs nutritionnels dans la section dédiée.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* Account Management */}
              {activeSection === 'account' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Gestion du Compte & Profil</h2>
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">👤 Modifier votre Profil</h3>
                      <p className="text-gray-700 mb-2">Dans la page &quot;Profil&quot; :</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Changez votre photo de profil</li>
                        <li>Modifiez vos informations personnelles</li>
                        <li>Définissez vos objectifs</li>
                        <li>Personnalisez votre expérience</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Sécurité & Confidentialité</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Vos données sont sécurisées et privées par défaut</li>
                        <li>Seuls vos partenaires acceptés voient vos séances partagées</li>
                        <li>Vous contrôlez entièrement vos paramètres de partage</li>
                        <li>Vous pouvez supprimer votre compte à tout moment</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">⚙️ Paramètres</h3>
                      <p className="text-gray-700 mb-2">Personnalisez votre expérience :</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Thème sombre/clair</li>
                        <li>Notifications</li>
                        <li>Langue (français par défaut)</li>
                        <li>Préférences d&apos;entraînement</li>
                      </ul>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/training-partners" 
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors group"
            >
              <Users className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Training Partners</p>
                <p className="text-sm text-gray-600">Gérer vos partenaires</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
            </Link>
            
            <Link 
              href="/faq" 
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
            >
              <HelpCircle className="h-6 w-6 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">FAQ</p>
                <p className="text-sm text-gray-600">Questions fréquentes</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
            </Link>

            <Link 
              href="/profile" 
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors group"
            >
              <Settings className="h-6 w-6 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Paramètres</p>
                <p className="text-sm text-gray-600">Gérer votre profil</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}