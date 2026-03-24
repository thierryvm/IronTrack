'use client'

import { motion} from'framer-motion'
import { FileText, AlertTriangle, CheckCircle, ArrowLeft} from'lucide-react'
import { useRouter} from'next/navigation'

export default function TermsOfService() {
 const router = useRouter()

 return (
 <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-500 to-purple-600 py-8 sm:py-12">
 <div className="max-w-4xl mx-auto px-4">
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="bg-card border border-border rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8"
 >
 {/* Bouton de retour */}
 <button
 onClick={() => router.back()}
 className="flex items-center text-gray-600 hover:text-orange-800 transition-colors mb-6"
 >
 <ArrowLeft className="h-5 w-5 mr-2" />
 <span className="text-sm sm:text-base">Retour</span>
 </button>

 <div className="flex items-center mb-6 sm:mb-8">
 <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-orange-800 mr-2" />
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Conditions d'Utilisation</h1>
 </div>
 
 <div className="space-y-6 sm:space-y-xl text-gray-700 text-sm sm:text-base">
 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">1. Informations générales</h2>
 <div className="bg-orange-50 p-2 sm:p-4 rounded-lg">
 <p className="font-medium">Application : IronTrack</p>
 <p>Service de coaching sportif personnel</p>
 <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-BE')}</p>
 <p>Applicable selon le droit belge</p>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">2. Acceptation des conditions</h2>
 <p>
 En utilisant l'application IronTrack, vous acceptez pleinement et sans réserve les présentes conditions d'utilisation.
 Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement d'utiliser l'application.
 </p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">3. Description du service</h2>
 <p>
 IronTrack est une application de coaching sportif personnel qui permet :
 </p>
 <ul className="list-disc list-inside space-y-2 mt-4">
 <li>La création et le suivi de programmes d'entraînement</li>
 <li>L'enregistrement de séances de musculation</li>
 <li>Le suivi de la progression et des statistiques</li>
 <li>La gestion de profils utilisateurs</li>
 <li>La synchronisation des données entre appareils</li>
 </ul>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">4. Inscription et compte utilisateur</h2>
 <div className="space-y-4">
 <div>
 <h3 className="font-medium text-foreground text-sm sm:text-base">Conditions d'inscription :</h3>
 <ul className="list-disc list-inside ml-4 space-y-1">
 <li>Être âgé d'au moins 16 ans</li>
 <li>Fournir des informations exactes et complètes</li>
 <li>Maintenir la confidentialité de vos identifiants</li>
 <li>Accepter la politique de confidentialité</li>
 </ul>
 </div>
 <div>
 <h3 className="font-medium text-foreground text-sm sm:text-base">Responsabilités :</h3>
 <ul className="list-disc list-inside ml-4 space-y-1">
 <li>Vous êtes responsable de la sécurité de votre compte</li>
 <li>Vous devez nous informer immédiatement de toute utilisation non autorisée</li>
 <li>Un seul compte par utilisateur est autorisé</li>
 </ul>
 </div>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">5. Utilisation autorisée</h2>
 <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
 <div className="bg-green-50 p-2 sm:p-4 rounded-lg">
 <div className="flex items-center mb-2">
 <CheckCircle className="h-5 w-5 text-safe-success mr-2" />
 <h3 className="font-medium text-green-900">Autorisé</h3>
 </div>
 <ul className="text-sm space-y-1">
 <li>Usage personnel de l'application</li>
 <li>Enregistrement de vos entraînements</li>
 <li>Partage de vos progrès (si fonctionnalité disponible)</li>
 <li>Sauvegarde de vos données</li>
 </ul>
 </div>
 <div className="bg-red-50 p-2 sm:p-4 rounded-lg">
 <div className="flex items-center mb-2">
 <AlertTriangle className="h-5 w-5 text-safe-error mr-2" />
 <h3 className="font-medium text-red-900">Interdit</h3>
 </div>
 <ul className="text-sm space-y-1">
 <li>Usage commercial sans autorisation</li>
 <li>Modification ou ingénierie inversée</li>
 <li>Transmission de contenu illégal</li>
 <li>Création de comptes multiples</li>
 <li>Utilisation de bots ou scripts automatisés</li>
 </ul>
 </div>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">6. Avertissements santé</h2>
 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-4">
 <div className="flex items-center mb-2">
 <AlertTriangle className="h-5 w-5 text-safe-warning mr-2" />
 <h3 className="font-medium text-yellow-900">Important</h3>
 </div>
 <ul className="text-sm space-y-2">
 <li>Consultez un professionnel de santé avant de commencer un programme d'entraînement</li>
 <li>L'application ne remplace pas un avis médical professionnel</li>
 <li>Arrêtez l'exercice en cas de douleur ou de malaise</li>
 <li>Adaptez les exercices à votre niveau et condition physique</li>
 <li>Nous ne sommes pas responsables des blessures liées à l'utilisation de l'application</li>
 </ul>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">7. Propriété intellectuelle</h2>
 <p>
 L'application IronTrack, son contenu, ses fonctionnalités et ses éléments graphiques sont protégés par le droit d'auteur.
 Vous ne pouvez pas reproduire, distribuer ou créer des œuvres dérivées sans autorisation explicite.
 </p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">8. Disponibilité du service</h2>
 <p>
 Nous nous efforçons de maintenir l'application disponible 24h/24 et 7j/7, mais nous ne pouvons garantir une disponibilité absolue.
 Des interruptions peuvent survenir pour :
 </p>
 <ul className="list-disc list-inside space-y-2 mt-2">
 <li>Maintenance programmée</li>
 <li>Problèmes techniques</li>
 <li>Cas de force majeure</li>
 <li>Mises à jour de sécurité</li>
 </ul>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">9. Limitation de responsabilité</h2>
 <p>
 Dans les limites autorisées par la loi belge, nous excluons toute responsabilité pour :
 </p>
 <ul className="list-disc list-inside space-y-2 mt-2">
 <li>Les dommages directs ou indirects liés à l'utilisation de l'application</li>
 <li>La perte de données due à des problèmes techniques</li>
 <li>Les blessures résultant de l'exercice physique</li>
 <li>L'utilisation non conforme de l'application</li>
 </ul>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">10. Résiliation</h2>
 <div className="space-y-4">
 <div>
 <h3 className="font-medium text-foreground text-sm sm:text-base">Résiliation par l'utilisateur :</h3>
 <p className="text-sm">Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application.</p>
 </div>
 <div>
 <h3 className="font-medium text-foreground text-sm sm:text-base">Résiliation par IronTrack :</h3>
 <p className="text-sm">Nous pouvons suspendre ou fermer votre compte en cas de violation des présentes conditions.</p>
 </div>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">11. Modifications des conditions</h2>
 <p>
 Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment.
 Les modifications prennent effet dès leur publication dans l'application.
 Votre utilisation continue constitue votre acceptation des nouvelles conditions.
 </p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">12. Droit applicable et juridiction</h2>
 <p>
 Ces conditions d'utilisation sont régies par le droit belge.
 Tout litige relève de la compétence exclusive des tribunaux belges.
 </p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">13. Contact</h2>
 <div className="bg-background p-2 sm:p-4 rounded-lg">
 <p className="font-medium mb-2">Pour toute question concernant ces conditions :</p>
 <p className="text-sm">contact@irontrack.app</p>
 </div>
 </section>
 </div>
 </motion.div>
 </div>
 </div>
 )
}