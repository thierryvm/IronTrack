'use client'

import { useState } from 'react'
import { Users, UserPlus, Search, Check, X, Clock, Settings, ArrowRight, BookOpen, HelpCircle, TrendingUp, Target, Award, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  const [activeSection, setActiveSection] = useState<'partners' | 'general' | 'account' | 'progression' | 'onboarding'>('partners')

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
                  { id: 'partners', label: 'Training Partners', icon: Users, desc: 'Partenaires d'entraînement' },
                  { id: 'general', label: 'Utilisation générale', icon: BookOpen, desc: 'Fonctionnalités de base' },
                  { id: 'progression', label: 'Progression & Badges', icon: TrendingUp, desc: 'Suivi des performances' },
                  { id: 'account', label: 'Compte & Profil', icon: Settings, desc: 'Gestion du compte' },
                  { id: 'onboarding', label: 'Onboarding & Configuration', icon: Target, desc: 'Première configuration' }
                ].map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as 'partners' | 'general' | 'account' | 'progression' | 'onboarding')}
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Qu'est-ce que Training Partners ?</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                        <p className="text-blue-800">
                          <strong>Training Partners</strong> vous permet de vous connecter avec d'autres utilisateurs IronTrack 
                          pour partager vos séances d'entraînement, vous motiver mutuellement et voir les calendriers de vos partenaires.
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
                          <p className="text-sm text-gray-600">Partagez vos séances d'entraînement</p>
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
                            <li>Cliquez sur l'onglet <strong>&quot;Rechercher&quot;</strong></li>
                            <li>Tapez le <strong>pseudo</strong>, <strong>nom</strong> ou <strong>email</strong> de la personne</li>
                            <li>Les résultats apparaissent en temps réel (minimum 2 caractères)</li>
                            <li>Cliquez sur <strong>&quot;Inviter&quot;</strong> à côté du nom de la personne</li>
                            <li>L'invitation est envoyée ! 🎉</li>
                          </ol>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-yellow-800 text-sm">
                            <strong>💡 Astuce :</strong> Si la personne n'apparaît pas, vérifiez qu'elle utilise bien IronTrack et demandez-lui son pseudo exact.
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
                            <li>• Allez dans l'onglet <strong>&quot;Invitations&quot;</strong></li>
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
                                <li>• 🏋️ Séances d'entraînement</li>
                                <li>• 🥗 Nutrition (recettes, objectifs)</li>
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
                              <li>• Attendez qu'il crée son compte s'il est nouveau</li>
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
                              <li>• Rappelez-lui de vérifier l'onglet &quot;Invitations reçues&quot;</li>
                              <li>• Vous pouvez annuler et renvoyer l'invitation</li>
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Utilisation Générale d'IronTrack</h2>
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏋️ Créer une Séance</h3>
                      <p className="text-gray-700 mb-2">Pour créer une nouvelle séance d'entraînement :</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700">
                        <li>Allez dans &quot;Séances&quot; ou &quot;Calendrier&quot;</li>
                        <li>Cliquez sur &quot;Nouvelle séance&quot;</li>
                        <li>Remplissez les informations (nom, type, exercices)</li>
                        <li>Définissez la date et l'heure</li>
                        <li>Sauvegardez</li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Suivre sa Progression</h3>
                      <p className="text-gray-700 mb-2">Dans la section &quot;Progression&quot; :</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Visualisez vos statistiques d'entraînement</li>
                        <li>Suivez votre évolution dans le temps</li>
                        <li>Analysez vos performances par type d'exercice</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🍎 Nutrition</h3>
                      <p className="text-gray-700 mb-2">
                        Gérez votre alimentation et suivez vos objectifs nutritionnels dans la section dédiée :
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Créez et sauvegardez vos recettes personnalisées</li>
                        <li>Suivez vos objectifs caloriques et nutritionnels</li>
                        <li>Partagez vos données nutritionnelles avec vos partenaires</li>
                        <li>Consultez les recettes partagées par vos partenaires</li>
                      </ul>
                    </section>
                  </div>
                </div>
              )}

              {/* Progression & Badges Guide */}
              {activeSection === 'progression' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-gray-900">Progression & Badges - Guide Complet</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Introduction */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Comprendre le système de progression</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                        <p className="text-blue-800">
                          IronTrack suit automatiquement votre progression en analysant vos performances d'entraînement.
                          Le système calcule vos statistiques, records personnels et débloques des badges selon vos objectifs.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-900">Objectifs</h4>
                          <p className="text-sm text-gray-600">Définissez vos challenges</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-900">Performances</h4>
                          <p className="text-sm text-gray-600">Suivez vos résultats</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-900">Badges</h4>
                          <p className="text-sm text-gray-600">Débloquez des récompenses</p>
                        </div>
                      </div>
                    </section>

                    {/* Poids Initial vs Actuel */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">⚖️ Poids Initial vs Poids Actuel</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <h4 className="font-medium text-green-900 mb-2">Poids Initial</h4>
                            <ul className="space-y-1 text-green-800 text-sm">
                              <li>• <strong>Référence fixe</strong> pour calculer votre progression</li>
                              <li>• Poids au début de votre programme</li>
                              <li>• Sert à calculer gain/perte de poids</li>
                              <li>• Se définit une seule fois dans le profil</li>
                            </ul>
                          </div>
                          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                            <h4 className="font-medium text-blue-900 mb-2">Poids Actuel</h4>
                            <ul className="space-y-1 text-blue-800 text-sm">
                              <li>• <strong>Poids corporel</strong> du moment</li>
                              <li>• Utilisé pour calculer l'IMC</li>
                              <li>• Peut être mis à jour régulièrement</li>
                              <li>• Visible dans la section IMC du profil</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-yellow-800 text-sm">
                            <strong>💡 Exemple :</strong> Poids initial = 70kg, Poids actuel = 73kg → Progression = +3kg
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Ajouter des performances */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Ajouter des performances</h3>
                      <div className="space-y-4">
                        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                          <h4 className="font-medium text-orange-900 mb-2">Comment ça marche</h4>
                          <ol className="list-decimal list-inside space-y-1 text-orange-800 text-sm">
                            <li>Créez une séance d'entraînement dans &quot;Séances&quot;</li>
                            <li>Ajoutez vos exercices avec poids/répétitions prévus</li>
                            <li>Réalisez votre entraînement</li>
                            <li>Marquez la séance comme &quot;Terminée&quot;</li>
                            <li>Ajustez les résultats réels (poids, reps, durée)</li>
                            <li>Les performances sont automatiquement enregistrées</li>
                          </ol>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-purple-800 text-sm">
                            <strong>🔄 Automatique :</strong> Pas besoin de bouton &quot;Ajouter performance&quot;. 
                            Tout se fait via vos séances d'entraînement terminées.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Objectifs personnalisés */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Créer des objectifs</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Étapes</h4>
                          <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                            <li>Allez dans <strong>&quot;Progression&quot;</strong></li>
                            <li>Section <strong>&quot;Objectifs&quot;</strong> → cliquez <strong>&quot;Ajouter&quot;</strong></li>
                            <li>Sélectionnez un <strong>exercice</strong> existant</li>
                            <li>Choisissez le <strong>type d'objectif</strong> (kg, reps, durée, distance)</li>
                            <li>Définissez votre <strong>valeur cible</strong></li>
                            <li>Utilisez les <strong>suggestions</strong> pour gagner du temps</li>
                            <li>Sauvegardez → Un badge &quot;En cours&quot; est créé automatiquement</li>
                          </ol>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Types d'objectifs Musculation</h4>
                            <ul className="space-y-1 text-green-800 text-sm">
                              <li>• <strong>Poids (kg) :</strong> 100kg développé couché</li>
                              <li>• <strong>Répétitions :</strong> 20 pompes d'affilée</li>
                              <li>• <strong>Durée :</strong> 2 min de gainage</li>
                            </ul>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Types d'objectifs Cardio</h4>
                            <ul className="space-y-1 text-blue-800 text-sm">
                              <li>• <strong>Distance :</strong> 5km de course</li>
                              <li>• <strong>Vitesse :</strong> 12 km/h sur tapis</li>
                              <li>• <strong>Calories :</strong> 300 kcal brûlées</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Système de badges */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏅 Système de badges</h3>
                      <div className="space-y-4">
                        <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                          <h4 className="font-medium text-yellow-900 mb-2">Fonctionnement automatique</h4>
                          <div className="space-y-2 text-yellow-800 text-sm">
                            <p><strong>1. Création :</strong> Créez un objectif → Badge &quot;En cours&quot; généré</p>
                            <p><strong>2. Validation :</strong> Atteignez l'objectif → Badge passe à &quot;Validé&quot;</p>
                            <p><strong>3. Affichage :</strong> Badge validé apparaît dans votre profil</p>
                            <p><strong>4. Rétrogradation :</strong> Si vous ne maintenez plus le niveau → Badge redevient &quot;En cours&quot;</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-2">Où voir mes badges</h4>
                            <ul className="space-y-1 text-gray-700 text-sm">
                              <li>• <strong>Profil :</strong> Badges validés dans &quot;Badges & Récompenses&quot;</li>
                              <li>• <strong>Progression :</strong> Badges en cours dans &quot;Badges à valider&quot;</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-2">Icônes par exercice</h4>
                            <ul className="space-y-1 text-gray-700 text-sm">
                              <li>• 🏋️‍♂️ Développé couché, squat</li>
                              <li>• 🚴‍♂️ Vélo, 🏃‍♂️ Course</li>
                              <li>• 🤸‍♂️ Pompes, dips</li>
                              <li>• 🧗‍♂️ Tractions</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Statistiques et records */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Statistiques et records</h3>
                      <div className="space-y-4">
                        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <h4 className="font-medium text-blue-900 mb-2">Calculs automatiques</h4>
                          <ul className="space-y-1 text-blue-800 text-sm">
                            <li>• <strong>Records personnels :</strong> Poids max et reps max par exercice</li>
                            <li>• <strong>Progression :</strong> Évolution du poids corporel</li>
                            <li>• <strong>Statistiques :</strong> Séances totales, poids total soulevé</li>
                            <li>• <strong>Tendances :</strong> Amélioration par exercice</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-green-800 text-sm">
                            <strong>💪 Astuce :</strong> Plus vous complétez de séances, plus vos statistiques sont précises et détaillées !
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Problèmes courants */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Problèmes fréquents</h3>
                      <div className="space-y-3">
                        <details className="border border-gray-200 rounded-lg">
                          <summary className="p-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                            &quot;Mes statistiques de progression sont vides&quot;
                          </summary>
                          <div className="p-3 pt-0 text-sm text-gray-700">
                            <ul className="space-y-1">
                              <li>• Complétez quelques séances d'entraînement d'abord</li>
                              <li>• Marquez-les comme &quot;Terminées&quot; avec vos résultats</li>
                              <li>• Définissez votre poids initial dans votre profil</li>
                              <li>• Attendez que les données se synchronisent</li>
                            </ul>
                          </div>
                        </details>

                        <details className="border border-gray-200 rounded-lg">
                          <summary className="p-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                            &quot;Mon badge ne se débloque pas&quot;
                          </summary>
                          <div className="p-3 pt-0 text-sm text-gray-700">
                            <ul className="space-y-1">
                              <li>• Vérifiez que vous avez vraiment atteint l'objectif</li>
                              <li>• Attendez quelques secondes, le système vérifie automatiquement</li>
                              <li>• Rafraîchissez la page Progression</li>
                              <li>• Vérifiez que la séance est marquée &quot;Terminée&quot;</li>
                            </ul>
                          </div>
                        </details>

                        <details className="border border-gray-200 rounded-lg">
                          <summary className="p-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                            &quot;Je ne trouve pas le bouton Ajouter performance&quot;
                          </summary>
                          <div className="p-3 pt-0 text-sm text-gray-700">
                            <ul className="space-y-1">
                              <li>• Il n'y a pas de bouton séparé pour ajouter des performances</li>
                              <li>• Les performances s'ajoutent via vos séances terminées</li>
                              <li>• Créez une séance → Complétez-la → Marquez comme terminée</li>
                              <li>• Le bouton &quot;Ajouter&quot; sert uniquement pour les objectifs</li>
                            </ul>
                          </div>
                        </details>
                      </div>
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
                        <li>Préférences d'entraînement</li>
                      </ul>
                    </section>
                  </div>
                </div>
              )}

              {/* Onboarding & Configuration */}
              {activeSection === 'onboarding' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Onboarding & Configuration Initiale</h2>
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Première Configuration</h3>
                      <p className="text-gray-700 mb-4">
                        L'onboarding vous guide lors de votre première connexion pour configurer votre profil et vos préférences d'entraînement.
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">Comment refaire l'onboarding ?</h4>
                        <p className="text-sm text-green-700">
                          Accédez à <strong>/onboarding</strong> ou cliquez sur le bouton &quot;Refaire l'onboarding&quot; dans les actions rapides.
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Étapes de Configuration</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Objectif d'entraînement</h4>
                            <p className="text-sm text-gray-600">Prise de masse, Perte de poids, Maintien, ou Performance</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Niveau d'expérience</h4>
                            <p className="text-sm text-gray-600">Débutant, Intermédiaire, ou Avancé</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Fréquence d'entraînement</h4>
                            <p className="text-sm text-gray-600">Faible, Modérée, ou Élevée + disponibilité par séance</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Informations physiques</h4>
                            <p className="text-sm text-gray-600">Taille, poids actuel, âge, et poids initial</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 Mise à jour des Données</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Synchronisation automatique</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Après l'onboarding, vos données sont automatiquement synchronisées avec votre profil.
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• <strong>Préférences d'entraînement</strong> : Mises à jour systématiquement</li>
                          <li>• <strong>Données physiques</strong> : Taille, poids, âge mis à jour</li>
                          <li>• <strong>Poids initial</strong> : Préservé pour maintenir l'historique de progression</li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">❓ FAQ Onboarding</h3>
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Puis-je modifier mes données après l'onboarding ?</h4>
                          <p className="text-sm text-gray-600">
                            Oui ! Vous pouvez modifier toutes vos données via la page Profil ou refaire l'onboarding complet.
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Pourquoi le poids initial n'est-il pas modifié ?</h4>
                          <p className="text-sm text-gray-600">
                            Le poids initial est préservé pour maintenir l'historique de votre progression. 
                            Vous pouvez le modifier manuellement via l'édition du profil.
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Mes données ne s'affichent pas dans le profil ?</h4>
                          <p className="text-sm text-gray-600">
                            Après l'onboarding, vous êtes automatiquement redirigé vers votre profil avec un rechargement.
                            Si le problème persiste, actualisez la page.
                          </p>
                        </div>
                      </div>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* NOUVEAU - Contact Support en premier */}
            <Link 
              href="/support/contact" 
              className="flex items-center space-x-3 p-4 border-2 border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-colors group"
            >
              <MessageSquare className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">✉️ Contacter le Support</p>
                <p className="text-sm text-orange-700">Signaler un problème</p>
              </div>
              <ArrowRight className="h-4 w-4 text-orange-500 group-hover:text-orange-600" />
            </Link>
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
              href="/progress" 
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors group"
            >
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Progression</p>
                <p className="text-sm text-gray-600">Objectifs & badges</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500" />
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

            <Link 
              href="/onboarding" 
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors group"
            >
              <Target className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Onboarding</p>
                <p className="text-sm text-gray-600">Refaire la configuration</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}