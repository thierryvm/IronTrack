'use client'

import { motion } from 'framer-motion'
import { Shield, Mail, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyPolicy() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-500 to-purple-600 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8"
        >
          {/* Bouton de retour */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-800 dark:text-orange-300 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm sm:text-base">Retour</span>
          </button>

          <div className="flex items-center mb-6 sm:mb-8">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-orange-800 dark:text-orange-300 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Politique de Confidentialité</h1>
          </div>
          
          <div className="space-y-6 sm:space-y-8 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">1. Informations légales</h2>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 sm:p-4 rounded-lg">
                <p className="font-medium">Éditeur de l'application :</p>
                <p>IronTrack - Application de coaching sportif</p>
                <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-BE')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">2. Responsable du traitement des données</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), 
                l'éditeur de l'application IronTrack est responsable du traitement de vos données personnelles.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">3. Données collectées</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Données d'inscription :</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Adresse e-mail</li>
                    <li>Nom d'utilisateur (pseudo)</li>
                    <li>Mot de passe (chiffré)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Données de profil :</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Informations de profil (nom, prénom si renseignés)</li>
                    <li>Photo de profil (optionnelle)</li>
                    <li>Préférences d'entraînement</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Données d'activité :</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Séances d'entraînement</li>
                    <li>Exercices réalisés</li>
                    <li>Poids et répétitions</li>
                    <li>Progression et statistiques</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Données techniques et analytics :</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Pages visitées et temps de navigation</li>
                    <li>Performances techniques (temps de chargement)</li>
                    <li>Interactions avec l'interface (clics, navigation)</li>
                    <li>Données agrégées et anonymisées d'utilisation</li>
                  </ul>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
                    Ces données sont collectées de manière anonyme pour améliorer l'expérience utilisateur.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">4. Finalités du traitement</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Création et gestion de votre compte utilisateur</li>
                <li>Fourniture des services de coaching sportif</li>
                <li>Suivi de votre progression et personnalisation</li>
                <li>Amélioration des services proposés</li>
                <li>Communication technique et informative</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">5. Base légale du traitement</h2>
              <p>
                Le traitement de vos données personnelles est basé sur :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>L'exécution d'un contrat</strong> : pour la fourniture des services</li>
                <li><strong>Votre consentement</strong> : pour les données optionnelles</li>
                <li><strong>L'intérêt légitime</strong> : pour l'amélioration des services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">6. Durée de conservation</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Données de compte : conservées tant que le compte est actif</li>
                <li>Données d'entraînement : conservées pendant 3 ans après la dernière utilisation</li>
                <li>Données de connexion : conservées 1 an maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">7. Vos droits</h2>
              <p className="mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Droit d'accès</strong> : connaître les données traitées</li>
                <li><strong>Droit de rectification</strong> : corriger vos données</li>
                <li><strong>Droit à l'effacement</strong> : supprimer vos données</li>
                <li><strong>Droit à la portabilité</strong> : récupérer vos données</li>
                <li><strong>Droit d'opposition</strong> : vous opposer au traitement</li>
                <li><strong>Droit à la limitation</strong> : limiter le traitement</li>
              </ul>
              <p className="mt-4 text-xs sm:text-sm bg-blue-50 p-3 rounded">
                Pour exercer ces droits, contactez-nous. Nous répondrons dans un délai de 30 jours calendaires.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">8. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Chiffrement des données sensibles</li>
                <li>Connexions sécurisées (HTTPS)</li>
                <li>Authentification sécurisée</li>
                <li>Sauvegardes régulières</li>
                <li>Contrôles d'accès stricts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">9. Cookies et Analytics</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">9.1 Cookies techniques essentiels</h3>
                  <p>
                    Notre application utilise des cookies techniques essentiels pour son fonctionnement,
                    notamment pour l'authentification et la sauvegarde de vos préférences.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">9.2 Analytics et amélioration des performances</h3>
                  <p>
                    Nous utilisons <strong>Vercel Analytics</strong> et <strong>Speed Insights</strong> pour :
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Analyser l'utilisation de l'application de manière anonymisée</li>
                    <li>Mesurer les performances (temps de chargement, réactivité)</li>
                    <li>Améliorer l'expérience utilisateur</li>
                  </ul>
                  <p className="mt-3 text-sm bg-blue-50 p-3 rounded-lg">
                    <strong>Base légale :</strong> Intérêts légitimes (amélioration du service)<br/>
                    <strong>Données collectées :</strong> Pages visitées, temps de navigation, performances techniques<br/>
                    <strong>Conservation :</strong> 24 mois maximum<br/>
                    <strong>Droit d'opposition :</strong> Contactez-nous à l'adresse ci-dessous
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">9.3 Aucun cookie publicitaire</h3>
                  <p>
                    Nous n'utilisons aucun cookie publicitaire, de profilage ou de tracking à des fins commerciales.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">10. Modifications</h2>
              <p>
                Cette politique peut être mise à jour. Nous vous informerons de tout changement significatif.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">11. Contact</h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                <p className="font-medium mb-2">Pour toute question concernant cette politique :</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-6 w-6 text-orange-800 dark:text-orange-300" />
                  <span>contact@irontrack.app</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">12. Réclamations</h2>
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l'Autorité de Protection des Données (APD) en Belgique.
              </p>
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mt-4">
                <p className="font-medium">Autorité de Protection des Données (APD)</p>
                <p>Rue de la Presse 35, 1000 Bruxelles</p>
                <p>contact@apd-gba.be</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}