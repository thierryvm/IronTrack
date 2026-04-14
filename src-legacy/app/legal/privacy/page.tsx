'use client'

import { motion} from'framer-motion'
import { Shield, Mail, ArrowLeft} from'lucide-react'
import { useRouter} from'next/navigation'
import { Button} from'@/components/ui/button'

export default function PrivacyPolicy() {
 const router = useRouter()

 return (
 <div className="min-h-screen bg-background py-8 sm:py-12">
 <div className="max-w-4xl mx-auto px-4">
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8"
 >
 {/* Bouton de retour */}
 <Button
 variant="ghost"
 onClick={() => router.back()}
 className="gap-2 mb-6 text-muted-foreground hover:text-foreground -ml-2"
 >
 <ArrowLeft className="h-4 w-4" />
 Retour
 </Button>

 <div className="flex items-center gap-2 mb-6 sm:mb-8">
 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
 <Shield className="h-5 w-5 text-primary" />
 </div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Politique de Confidentialité</h1>
 </div>

 <div className="space-y-6 sm:space-y-xl text-muted-foreground text-sm sm:text-base">
 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">1. Informations légales</h2>
 <div className="bg-muted border border-border p-2 sm:p-4 rounded-lg">
 <p className="font-medium text-foreground">Éditeur de l&apos;application :</p>
 <p>IronTrack - Application de coaching sportif</p>
 <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-BE')}</p>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">2. Responsable du traitement des données</h2>
 <p>
 Conformément au Règlement Général sur la Protection des Données (RGPD),
 l&apos;éditeur de l&apos;application IronTrack est responsable du traitement de vos données personnelles.
 </p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">3. Données collectées</h2>
 <div className="space-y-4">
 <div>
 <h3 className="font-medium text-foreground">Données d&apos;inscription :</h3>
 <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
 <li>Adresse e-mail</li>
 <li>Nom d&apos;utilisateur (pseudo)</li>
 <li>Mot de passe (chiffré)</li>
 </ul>
 </div>
 <div>
 <h3 className="font-medium text-foreground">Données de profil :</h3>
 <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
 <li>Informations de profil (nom, prénom si renseignés)</li>
 <li>Photo de profil (optionnelle)</li>
 <li>Données physiques : poids, taille, âge, genre (optionnels)</li>
 <li>Préférences d&apos;entraînement et objectifs</li>
 </ul>
 </div>
 <div>
 <h3 className="font-medium text-foreground">Données d&apos;activité :</h3>
 <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
 <li>Séances d&apos;entraînement et exercices réalisés</li>
 <li>Métriques de performance (poids, répétitions, durée, fréquence cardiaque…)</li>
 <li>Données nutritionnelles : journaux alimentaires, recettes, objectifs caloriques</li>
 <li>Photos d&apos;exercices uploadées (stockage Supabase Storage)</li>
 <li>Progression, statistiques et objectifs personnels</li>
 </ul>
 </div>
 <div>
 <h3 className="font-medium text-foreground">Données de partage (Training Partners) :</h3>
 <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
 <li>Pseudo et pseudo uniquement — l&apos;e-mail n&apos;est jamais exposé aux partenaires</li>
 <li>Séances partagées explicitement via le contrôle de partage par partenaire</li>
 <li>Données nutritionnelles partagées uniquement si vous l&apos;activez</li>
 </ul>
 </div>
 <div>
 <h3 className="font-medium text-foreground">Données techniques et analytics :</h3>
 <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
 <li>Pages visitées et temps de navigation</li>
 <li>Performances techniques (temps de chargement)</li>
 <li>Interactions avec l&apos;interface (clics, navigation)</li>
 <li>Données agrégées et anonymisées d&apos;utilisation</li>
 </ul>
 <p className="text-sm text-muted-foreground mt-2 italic">
 Ces données sont collectées de manière anonyme pour améliorer l&apos;expérience utilisateur.
 </p>
 </div>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">4. Finalités du traitement</h2>
 <ul className="list-disc list-inside space-y-2">
 <li>Création et gestion de votre compte utilisateur</li>
 <li>Fourniture des services de coaching sportif</li>
 <li>Suivi de votre progression et personnalisation</li>
 <li>Amélioration des services proposés</li>
 <li>Communication technique et informative</li>
 </ul>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">5. Base légale du traitement</h2>
 <p>Le traitement de vos données personnelles est basé sur :</p>
 <ul className="list-disc list-inside space-y-2 mt-2">
 <li><strong className="text-foreground">L&apos;exécution d&apos;un contrat</strong> : pour la fourniture des services</li>
 <li><strong className="text-foreground">Votre consentement</strong> : pour les données optionnelles</li>
 <li><strong className="text-foreground">L&apos;intérêt légitime</strong> : pour l&apos;amélioration des services</li>
 </ul>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">6. Durée de conservation</h2>
 <ul className="list-disc list-inside space-y-2">
 <li>Données de compte : conservées tant que le compte est actif</li>
 <li>Données d&apos;entraînement : conservées pendant 3 ans après la dernière utilisation</li>
 <li>Données de connexion : conservées 1 an maximum</li>
 </ul>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">7. Vos droits</h2>
 <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
 <ul className="list-disc list-inside space-y-2">
 <li><strong className="text-foreground">Droit d&apos;accès</strong> : connaître les données traitées</li>
 <li><strong className="text-foreground">Droit de rectification</strong> : corriger vos données</li>
 <li><strong className="text-foreground">Droit à l&apos;effacement</strong> : supprimer vos données</li>
 <li><strong className="text-foreground">Droit à la portabilité</strong> : récupérer vos données</li>
 <li><strong className="text-foreground">Droit d&apos;opposition</strong> : vous opposer au traitement</li>
 <li><strong className="text-foreground">Droit à la limitation</strong> : limiter le traitement</li>
 </ul>
 <p className="mt-4 text-sm bg-muted border border-border p-2 rounded-lg">
 Pour exercer ces droits, contactez-nous. Nous répondrons dans un délai de 30 jours calendaires.
 </p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">8. Sous-traitants et transferts de données</h2>
 <p className="mb-3">Vos données sont traitées par les sous-traitants suivants, tous conformes au RGPD :</p>
 <div className="space-y-3">
 <div className="bg-muted border border-border p-3 rounded-lg">
 <p className="font-medium text-foreground">Supabase Inc. (États-Unis)</p>
 <p className="text-sm mt-1">Base de données PostgreSQL, authentification, stockage de fichiers. Données hébergées dans la région de votre choix (UE disponible). Accord de traitement des données (DPA) en vigueur.</p>
 </div>
 <div className="bg-muted border border-border p-3 rounded-lg">
 <p className="font-medium text-foreground">Vercel Inc. (États-Unis)</p>
 <p className="text-sm mt-1">Hébergement de l&apos;application. Analytics et Speed Insights anonymisés. Conforme RGPD via mécanismes de transfert adéquats.</p>
 </div>
 </div>
 <p className="text-sm mt-3 italic">
 Aucune vente de vos données à des tiers. Aucun partage à des fins publicitaires.
 </p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">9. Logs administrateur</h2>
 <p>
 Les actions des administrateurs de l&apos;application (consultation, modification de rôles, bannissement, exports)
 sont enregistrées dans un journal d&apos;audit interne à des fins de sécurité et de traçabilité.
 Ces logs sont accessibles uniquement aux administrateurs et super-administrateurs.
 Ils sont conservés <strong className="text-foreground">30 jours</strong> maximum.
 </p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">10. Sécurité des données</h2>
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
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">11. Cookies et Analytics</h2>
 <div className="space-y-4">
 <div>
 <h3 className="font-semibold text-foreground mb-2">11.1 Cookies techniques essentiels</h3>
 <p>
 Notre application utilise des cookies techniques essentiels pour son fonctionnement,
 notamment pour l&apos;authentification et la sauvegarde de vos préférences.
 </p>
 </div>
 <div>
 <h3 className="font-semibold text-foreground mb-2">11.2 Analytics et amélioration des performances</h3>
 <p>Nous utilisons <strong className="text-foreground">Vercel Analytics</strong> et <strong className="text-foreground">Speed Insights</strong> pour :</p>
 <ul className="list-disc ml-6 mt-2 space-y-1">
 <li>Analyser l&apos;utilisation de l&apos;application de manière anonymisée</li>
 <li>Mesurer les performances (temps de chargement, réactivité)</li>
 <li>Améliorer l&apos;expérience utilisateur</li>
 </ul>
 <div className="mt-2 text-sm bg-muted border border-border p-2 rounded-lg space-y-1">
 <p><strong className="text-foreground">Base légale :</strong> Intérêts légitimes (amélioration du service)</p>
 <p><strong className="text-foreground">Données collectées :</strong> Pages visitées, temps de navigation, performances techniques</p>
 <p><strong className="text-foreground">Conservation :</strong> 24 mois maximum</p>
 <p><strong className="text-foreground">Droit d&apos;opposition :</strong> Contactez-nous à l&apos;adresse ci-dessous</p>
 </div>
 </div>
 <div>
 <h3 className="font-semibold text-foreground mb-2">11.3 Aucun cookie publicitaire</h3>
 <p>Nous n&apos;utilisons aucun cookie publicitaire, de profilage ou de tracking à des fins commerciales.</p>
 </div>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">12. Modifications</h2>
 <p>Cette politique peut être mise à jour. Nous vous informerons de tout changement significatif.</p>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">13. Contact</h2>
 <div className="bg-muted border border-border p-2 sm:p-4 rounded-lg">
 <p className="font-medium text-foreground mb-2">Pour toute question concernant cette politique :</p>
 <div className="flex items-center gap-2 text-sm">
 <Mail className="h-4 w-4 text-primary" />
 <span>contact@irontrack.app</span>
 </div>
 </div>
 </section>

 <section>
 <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">14. Réclamations</h2>
 <p>
 Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l&apos;Autorité de Protection des Données (APD) en Belgique.
 </p>
 <div className="bg-muted border border-border p-2 sm:p-4 rounded-lg mt-4">
 <p className="font-medium text-foreground">Autorité de Protection des Données (APD)</p>
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
