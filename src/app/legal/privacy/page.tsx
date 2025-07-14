'use client'

import { motion } from 'framer-motion'
import { Shield, Mail, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyPolicy() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8"
        >
          {/* Bouton de retour */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-orange-600 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm sm:text-base">Retour</span>
          </button>

          <div className="flex items-center mb-6 sm:mb-8">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
          </div>
          
          <div className="space-y-6 sm:space-y-8 text-gray-700 text-sm sm:text-base">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">1. Informations légales</h2>
              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                <p className="font-medium">Éditeur de l&apos;application :</p>
                <p>IronTrack - Application de coaching sportif</p>
                <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-BE')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">2. Responsable du traitement des données</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), 
                l&apos;éditeur de l&apos;application IronTrack est responsable du traitement de vos données personnelles.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">3. Données collectées</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Données d&apos;inscription :</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Adresse e-mail</li>
                    <li>Nom d&apos;utilisateur (pseudo)</li>
                    <li>Mot de passe (chiffré)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Données de profil :</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Informations de profil (nom, prénom si renseignés)</li>
                    <li>Photo de profil (optionnelle)</li>
                    <li>Préférences d&apos;entraînement</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Données d&apos;activité :</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Séances d&apos;entraînement</li>
                    <li>Exercices réalisés</li>
                    <li>Poids et répétitions</li>
                    <li>Progression et statistiques</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">4. Finalités du traitement</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Création et gestion de votre compte utilisateur</li>
                <li>Fourniture des services de coaching sportif</li>
                <li>Suivi de votre progression et personnalisation</li>
                <li>Amélioration des services proposés</li>
                <li>Communication technique et informative</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">5. Base légale du traitement</h2>
              <p>
                Le traitement de vos données personnelles est basé sur :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>L&apos;exécution d&apos;un contrat</strong> : pour la fourniture des services</li>
                <li><strong>Votre consentement</strong> : pour les données optionnelles</li>
                <li><strong>L&apos;intérêt légitime</strong> : pour l&apos;amélioration des services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">6. Durée de conservation</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Données de compte : conservées tant que le compte est actif</li>
                <li>Données d&apos;entraînement : conservées pendant 3 ans après la dernière utilisation</li>
                <li>Données de connexion : conservées 1 an maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">7. Vos droits</h2>
              <p className="mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Droit d&apos;accès</strong> : connaître les données traitées</li>
                <li><strong>Droit de rectification</strong> : corriger vos données</li>
                <li><strong>Droit à l&apos;effacement</strong> : supprimer vos données</li>
                <li><strong>Droit à la portabilité</strong> : récupérer vos données</li>
                <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement</li>
                <li><strong>Droit à la limitation</strong> : limiter le traitement</li>
              </ul>
              <p className="mt-4 text-xs sm:text-sm bg-blue-50 p-3 rounded">
                Pour exercer ces droits, contactez-nous. Nous répondrons dans un délai de 30 jours calendaires.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">8. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Chiffrement des données sensibles</li>
                <li>Connexions sécurisées (HTTPS)</li>
                <li>Authentification sécurisée</li>
                <li>Sauvegardes régulières</li>
                <li>Contrôles d&apos;accès stricts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">9. Cookies</h2>
              <p>
                Notre application utilise des cookies techniques essentiels pour son fonctionnement. 
                Aucun cookie publicitaire ou de tracking n&apos;est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">10. Modifications</h2>
              <p>
                Cette politique peut être mise à jour. Nous vous informerons de tout changement significatif.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">11. Contact</h2>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="font-medium mb-2">Pour toute question concernant cette politique :</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-orange-500" />
                  <span>contact@irontrack.app</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">12. Réclamations</h2>
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l&apos;Autorité de Protection des Données (APD) en Belgique.
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