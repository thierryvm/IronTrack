'use client'

import { useState} from'react'
import { Users, Dumbbell, Calendar, HelpCircle, ChevronDown, ChevronUp, Search, TrendingUp} from'lucide-react'
import Link from'next/link'

interface FAQItem {
 id: string
 question: string
 answer: string
 category:'partners' |'workouts' |'general' |'technical' |'progression'
}

const faqData: FAQItem[] = [
 // Training Partners
 {
 id:'partners-1',
 question:'Comment inviter quelqu\'un comme partenaire d\'entraînement ?',
 answer:'Allez dans"Training Partners" → onglet"Rechercher" → tapez le pseudo, nom ou email de la personne → cliquez"Inviter". L\'invitation sera envoyée et la personne pourra l\'accepter ou la refuser.',
 category:'partners'
},
 {
 id:'partners-2',
 question:'Mes partenaires peuvent-ils voir toutes mes séances ?',
 answer:'Non, vos partenaires ne voient que vos séances si vous activez le bouton"Partenaires" dans le calendrier. De plus, vous pouvez gérer finement les paramètres de partage pour chaque partenaire.',
 category:'partners'
},
 {
 id:'partners-3',
 question:'Comment supprimer un partenaire ?',
 answer:'Dans"Training Partners" → onglet"Mes Partenaires" → cliquez sur l\'icône poubelle à côté du partenaire. Le partenariat sera supprimé définitivement.',
 category:'partners'
},
 {
 id:'partners-4',
 question:'Que se passe-t-il si je refuse une invitation ?',
 answer:'L\'invitation est simplement supprimée. La personne qui vous a invité ne recevra pas de notification de refus, l\'invitation disparaîtra juste de sa liste.',
 category:'partners'
},
 {
 id:'partners-5',
 question:'Puis-je annuler une invitation que j\'ai envoyée ?',
 answer:'Oui, dans l\'onglet"Invitations" → section"Invitations Envoyées" → cliquez sur le X à côté de l\'invitation. Elle sera annulée immédiatement.',
 category:'partners'
},
 {
 id:'partners-6',
 question:'Puis-je partager mes données nutritionnelles avec mes partenaires ?',
 answer:'Oui, vous pouvez partager vos données nutritionnelles (recettes, objectifs, progression) avec vos partenaires acceptés. Allez dans"Partenaires" →"Mes Partenaires" → paramètres de partage pour activer le partage de nutrition.',
 category:'partners'
},

 // Workouts
 {
 id:'workouts-1',
 question:'Comment créer une nouvelle séance d\'entraînement ?',
 answer:'Cliquez sur"Nouvelle séance" dans le calendrier ou allez dans"Séances" →"Ajouter". Remplissez les informations : nom, type, exercices, date/heure, puis sauvegardez.',
 category:'workouts'
},
 {
 id:'workouts-2',
 question:'Puis-je modifier une séance déjà créée ?',
 answer:'Oui, cliquez sur la séance dans le calendrier ou la liste des séances, puis modifiez les informations et sauvegardez.',
 category:'workouts'
},
 {
 id:'workouts-3',
 question:'Comment marquer une séance comme terminée ?',
 answer:'Cliquez sur la séance et changez son statut vers"Terminé" ou"Réalisé". Vous pouvez aussi ajouter des notes sur votre performance.',
 category:'workouts'
},
 {
 id:'workouts-4',
 question:'Quels types d\'exercices puis-je ajouter ?',
 answer:'IronTrack supporte tous types d\'exercices : Musculation, Cardio, Étirement, Yoga, Pilates, Natation, Crossfit, Gainage, Cours collectifs, etc.',
 category:'workouts'
},
 {
 id:'workouts-5',
 question:'Comment utiliser le wizard de création d\'exercices ?',
 answer:'Allez dans"Exercices" →"Nouveau" → Le wizard vous guide : 1) Choisissez le type (Musculation/Cardio), 2) Sélectionnez un exercice suggéré ou créez le vôtre, 3) Ajoutez vos performances. L\'IA vous propose des exercices adaptés à votre niveau.',
 category:'workouts'
},
 {
 id:'workouts-6',
 question:'Quelles métriques puis-je saisir pour le cardio ?',
 answer:'Pour le cardio, vous pouvez saisir : distance (km/m selon l\'exercice), durée, calories, vitesse. Métriques spécialisées - Rameur : SPM (coups/minute), watts (puissance), rythme cardiaque. Course/Tapis : rythme cardiaque, inclinaison (%). Vélo : cadence (RPM), résistance, rythme cardiaque. Toutes les métriques sont adaptées aux standards belges.',
 category:'workouts'
},
 {
 id:'workouts-7',
 question:'Quelles métriques avancées puis-je suivre en musculation ?',
 answer:'En musculation, vous pouvez saisir : poids, répétitions, séries (de base) + temps de repos entre séries, temps sous tension (durée de la série), RPE (effort perçu de 6 à 10), et notes personnalisées sur votre ressenti.',
 category:'workouts'
},
 {
 id:'workouts-8',
 question:'Comment modifier un exercice ou une performance existante ?',
 answer:'Depuis la page Exercices, cliquez sur l\'icône œil pour voir les détails →"Modifier l\'exercice" pour changer les infos de base, ou"Nouvelle performance" pour ajouter des résultats. Pour modifier une performance existante, utilisez l\'icône crayon dans l\'historique. Toutes vos modifications incluent les nouvelles métriques cardio avancées.',
 category:'workouts'
},
 {
 id:'workouts-9',
 question:'Comment utiliser la mascotte IronBuddy pendant mes entraînements ?',
 answer:'IronBuddy est votre coach personnel accessible via le bouton flottant orange en bas à droite. Deux modes :"Support" pour l\'aide technique,"Coach" pour motivation/conseils. La mascotte s\'adapte à votre niveau de punchlines choisi dans Profil (Discret/Normal/Ambianceur) et propose 30+ blagues, conseils, motivations et défis par catégorie.',
 category:'workouts'
},

 // General
 {
 id:'general-1',
 question:'Comment changer mon pseudo ?',
 answer:'Allez dans"Profil" → modifiez le champ"Pseudo". C\'est ce nom que vos partenaires verront quand ils vous chercheront.',
 category:'general'
},
 {
 id:'general-2',
 question:'Comment activer le thème sombre ?',
 answer:'Dans le menu de navigation, cliquez sur l\'icône lune/soleil pour basculer entre les thèmes clair et sombre.',
 category:'general'
},
 {
 id:'general-3',
 question:'Mes données sont-elles sécurisées ?',
 answer:'Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Seuls vos partenaires acceptés peuvent voir les séances que vous choisissez de partager.',
 category:'general'
},
 {
 id:'general-4',
 question:'Comment supprimer mon compte ?',
 answer:'Dans"Profil" → section"Actions" →"Supprimer le compte". Cette action est irréversible et supprimera toutes vos données.',
 category:'general'
},
 {
 id:'general-5',
 question:'L\'application fonctionne-t-elle hors ligne ?',
 answer:'L\'application peut afficher une page hors ligne personnalisée, mais vous avez besoin d\'une connexion internet pour synchroniser vos données et voir les séances de vos partenaires.',
 category:'general'
},
 {
 id:'general-6',
 question:'Comment personnaliser ma mascotte IronBuddy ?',
 answer:'Dans"Profil" → section"Mascotte IronBuddy" → choisissez votre mascotte (IronBuddy, Félix, RoboCoach, SuperStar) et votre niveau de punchlines (Discret, Normal, Ambianceur). Le niveau détermine l\'intensité des blagues et motivations. Chaque mascotte a sa personnalité unique !',
 category:'general'
},

 // Technical
 {
 id:'technical-1',
 question:'Je ne peux pas me connecter, que faire ?',
 answer:'Vérifiez votre connexion internet, puis vos identifiants. Si le problème persiste, essayez de réinitialiser votre mot de passe ou contactez le support.',
 category:'technical'
},
 {
 id:'technical-2',
 question:'Le calendrier ne se charge pas, pourquoi ?',
 answer:'Essayez de rafraîchir la page (F5). Si le problème persiste, vérifiez votre connexion internet ou essayez de vous déconnecter/reconnecter.',
 category:'technical'
},
 {
 id:'technical-3',
 question:'Les notifications ne fonctionnent pas',
 answer:'Vérifiez que vous avez autorisé les notifications dans votre navigateur et dans vos paramètres de profil. Rechargez la page après avoir activé les notifications.',
 category:'technical'
},
 {
 id:'technical-4',
 question:'Comment signaler un bug ?',
 answer:'Vous pouvez signaler les bugs dans la section Support ou en contactant l\'équipe de développement avec une description détaillée du problème.',
 category:'technical'
},

 // Progression & Badges
 {
 id:'progression-1',
 question:'Quelle est la différence entre"poids initial" et"poids actuel" ?',
 answer:'Le poids initial est votre poids de référence pour calculer votre progression (gain/perte de poids depuis le début). Le poids actuel est votre poids corporel utilisé pour calculer l\'IMC. Définissez votre poids initial dans votre profil pour suivre votre évolution.',
 category:'progression'
},
 {
 id:'progression-2',
 question:'Comment ajouter des performances d\'entraînement ?',
 answer:'Les performances s\'ajoutent automatiquement quand vous complétez vos séances d\'entraînement. Allez dans"Séances" → créez ou modifiez une séance → marquez-la comme"Terminée" en ajoutant vos résultats (poids, répétitions, etc.).',
 category:'progression'
},
 {
 id:'progression-3',
 question:'Pourquoi mes statistiques de progression sont vides ?',
 answer:'Vos statistiques se basent sur vos performances d\'entraînement. Si elles sont vides, c\'est que vous n\'avez pas encore terminé de séances ou ajouté de performances. Complétez quelques séances d\'entraînement pour voir vos statistiques.',
 category:'progression'
},
 {
 id:'progression-4',
 question:'Comment créer un objectif personnalisé ?',
 answer:'Dans"Progression" → cliquez"Ajouter" dans la section Objectifs → choisissez un exercice → sélectionnez le type d\'objectif (kg, reps, durée, distance) → définissez votre cible. L\'app vous proposera des suggestions selon l\'exercice.',
 category:'progression'
},
 {
 id:'badges-1',
 question:'Comment fonctionnent les badges ?',
 answer:'Les badges se débloquent automatiquement quand vous atteignez vos objectifs. Créez un objectif → un badge"En cours" est généré → complétez l\'objectif → le badge passe à"Validé" et apparaît dans votre profil.',
 category:'progression'
},
 {
 id:'badges-2',
 question:'Où voir mes badges débloqués ?',
 answer:'Vos badges validés apparaissent dans votre profil dans la section"Badges & Récompenses". Les badges en cours de validation sont visibles dans"Progression" → section"Badges à valider".',
 category:'progression'
},
 {
 id:'badges-3',
 question:'Un badge peut-il être retiré ?',
 answer:'Oui, si vous ne maintenez plus le niveau requis pour un objectif, le badge repasse automatiquement en"En cours". Le système vérifie constamment vos performances pour maintenir la cohérence.',
 category:'progression'
},
 {
 id:'progression-5',
 question:'Comment sont calculés mes records personnels ?',
 answer:'Vos records personnels sont calculés automatiquement à partir de toutes vos performances d\'entraînement. Le système trouve le poids maximal et le nombre de répétitions maximal pour chaque exercice.',
 category:'progression'
},
]

const categories = [
 { id:'all', label:'Toutes les questions', icon: HelpCircle, count: faqData.length},
 { id:'partners', label:'Training Partners', icon: Users, count: faqData.filter(f => f.category ==='partners').length},
 { id:'workouts', label:'Séances & Exercices', icon: Dumbbell, count: faqData.filter(f => f.category ==='workouts').length},
 { id:'progression', label:'Progression & Badges', icon: TrendingUp, count: faqData.filter(f => f.category ==='progression').length},
 { id:'general', label:'Général & Mascotte', icon: Calendar, count: faqData.filter(f => f.category ==='general').length}
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
 const matchesCategory = selectedCategory ==='all' || item.category === selectedCategory
 const matchesSearch = searchQuery ==='' || 
 item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.answer.toLowerCase().includes(searchQuery.toLowerCase())
 
 return matchesCategory && matchesSearch
})

 return (
 <div className="min-h-screen bg-background py-8">
 <div className="max-w-6xl mx-auto px-4">
 {/* Header */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6 mb-6">
 <div className="flex items-center space-x-4">
 <div className="p-2 bg-primary/10 rounded-xl">
 <HelpCircle className="h-8 w-8 text-safe-primary" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-foreground">Questions Fréquentes (FAQ)</h1>
 <p className="text-muted-foreground">Trouvez rapidement les réponses à vos questions</p>
 </div>
 </div>
 </div>

 {/* Search */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6 mb-6">
 <div className="relative">
 <Search className="absolute left-2 top-2 h-5 w-5 text-foreground" />
 <input
 type="text"
 placeholder="Rechercher dans les questions..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 {/* Categories Sidebar */}
 <div className="lg:col-span-1">
 <div className="bg-card border border-border rounded-xl shadow-md p-4">
 <h3 className="font-semibold text-foreground mb-4">Catégories</h3>
 <nav className="space-y-2">
 {categories.map((category) => {
 const Icon = category.icon
 const isActive = selectedCategory === category.id
 return (
 <button
 key={category.id}
 onClick={() => setSelectedCategory(category.id)}
 className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
 isActive
 ?'bg-primary/10 text-primary border border-primary/20'
 :'hover:bg-muted text-foreground'
}`}
 aria-label={`Filtrer par catégorie ${category.label}`}
 aria-pressed={isActive}
 type="button"
 >
 <div className="flex items-center space-x-2">
 <Icon className="h-5 w-5" />
 <span className="font-medium">{category.label}</span>
 </div>
 <span className={`text-xs px-2 py-1 rounded-full ${
 isActive 
 ?'bg-primary/10 text-primary'
 :'bg-muted text-muted-foreground'
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
 <div className="bg-card border border-border rounded-xl shadow-md p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-foreground">
 {selectedCategory ==='all' ?'Toutes les questions' : categories.find(c => c.id === selectedCategory)?.label}
 </h2>
 <span className="text-sm text-muted-foreground">
 {filteredFAQ.length} question{filteredFAQ.length > 1 ?'s' :''}
 </span>
 </div>

 {filteredFAQ.length === 0 ? (
 <div className="text-center py-8">
 <HelpCircle className="h-12 w-12 text-foreground mx-auto mb-4" />
 <p className="text-muted-foreground mb-4">
 {searchQuery ?'Aucune question trouvée pour votre recherche' :'Aucune question dans cette catégorie'}
 </p>
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="text-primary hover:text-primary font-medium"
 aria-label="Effacer la recherche et afficher toutes les questions"
 type="button"
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
 <div key={item.id} className="border border-border rounded-lg overflow-hidden">
 <button
 onClick={() => toggleItem(item.id)}
 className="w-full text-left p-4 hover:bg-muted transition-colors flex items-center justify-between"
 aria-expanded={isOpen}
 aria-controls={`faq-answer-${item.id}`}
 aria-label={`${isOpen ?'Masquer' :'Afficher'} la réponse pour: ${item.question}`}
 type="button"
 >
 <span 
 className="font-medium text-foreground pr-4" 
 id={`faq-question-${item.id}`}
 >
 {item.question}
 </span>
 {isOpen ? (
 <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
 ) : (
 <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
 )}
 </button>
 {isOpen && (
 <div 
 className="px-4 pb-4 border-t border-border"
 id={`faq-answer-${item.id}`}
 role="region"
 aria-labelledby={`faq-question-${item.id}`}
 >
 <div className="pt-2 text-foreground leading-relaxed">
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
 <div className="mt-8 bg-primary rounded-xl shadow-md p-6 text-white">
 <div className="text-center">
 <h3 className="text-xl font-bold mb-2">Vous ne trouvez pas votre réponse ?</h3>
 <p className="text-white/90 mb-4">
 Consultez notre guide complet ou contactez directement notre équipe de support
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link 
 href="/support"
 className="bg-card border border-border text-accent-foreground px-6 py-2 rounded-lg font-semibold hover:bg-accent transition-colors"
 >
 Guide Complet
 </Link>
 <Link 
 href="/support/contact"
 className="bg-primary/80 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/60 transition-colors border border-primary/40"
 >
 ✉️ Contacter le Support
 </Link>
 </div>
 </div>
 </div>

 </div>
 </div>
 )
}