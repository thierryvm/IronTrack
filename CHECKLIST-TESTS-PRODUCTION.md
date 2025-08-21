# 🧪 CHECKLIST TESTS PRODUCTION - IronTrack 2025

> **Serveur lancé**: http://localhost:3000  
> **Mode**: Production (optimisé)  
> **Objectif**: Vérifier toutes les améliorations shadcn/ui + WCAG 2.1 AA

## 🎯 **TESTS PRIORITAIRES (10 minutes)**

### 1. 🏠 **PAGE D'ACCUEIL** - `/`
**Migration shadcn/ui + Touch Targets + Dark Mode**

#### ✅ **À vérifier immédiatement:**
- [ ] **Boutons shadcn/ui**: "Commencer ma séance" doit avoir le style moderne
- [ ] **Icônes agrandies**: Toutes les icônes font maintenant 24px minimum (plus grandes qu'avant)
- [ ] **Cards uniformes**: Design cohérent pour les statistiques et actions rapides
- [ ] **Responsive**: Teste sur mobile (F12 → mode mobile)

#### 🌙 **Test Dark Mode:**
1. Clique sur l'icône **lune/soleil** (coin supérieur droit)
2. Vérifie que **TOUT** devient sombre (pas de fond blanc éblouissant)
3. **Header**, **cards**, **boutons** doivent avoir des fonds sombres
4. Texte lisible en mode sombre

#### 📱 **Test Touch Targets Mobile:**
1. F12 → Mode mobile (iPhone/Android)
2. **Tous les boutons** doivent être faciles à toucher (44px+)
3. **Icônes** dans les actions rapides plus grandes qu'avant
4. **Navigation en bas** tactile agréable

### 2. 👤 **PAGE PROFIL** - `/profile`
**Formulaires accessibles + Composants migrés**

#### ✅ **À vérifier:**
- [ ] **Onglets modernes**: Style shadcn/ui pour les tabs (Informations/Statistiques/Paramètres)
- [ ] **Boutons uniformes**: "Changer le mot de passe", "Avatar", etc. style cohérent
- [ ] **Formulaires**: Inputs avec focus visibles et labels clairs
- [ ] **Dark mode**: Page entière compatible mode sombre

#### 🧪 **Tests spécifiques:**
1. **Navigation onglets**: Clique entre "Informations", "Statistiques", "Paramètres"
2. **Bouton avatar**: Hover et click responsive
3. **Toggle notifications**: Fonctionne et style moderne
4. **Mode sombre**: Bascule et vérifie que tout reste lisible

### 3. 🔐 **PAGE AUTH** - `/auth/login`
**EmailAuthForm WCAG-conforme**

#### ✅ **À vérifier:**
- [ ] **Formulaire moderne**: Inputs shadcn/ui avec borders et focus
- [ ] **Contraste parfait**: Texte lisible sur tous les backgrounds
- [ ] **Labels accessibles**: Chaque champ bien identifié
- [ ] **Boutons CTA**: Style cohérent et taille tactile

## 🔍 **TESTS APPROFONDIS (15 minutes)**

### 4. 📅 **CALENDRIER** - `/calendar`
**Touch targets + Mobile optimisé**

#### ✅ **Mobile First:**
1. Mode mobile (F12)
2. **Cases calendrier**: Doivent être faciles à toucher
3. **Navigation mois**: Flèches et sélecteurs agrandis
4. **Safe areas**: Respect des encoches iPhone

### 5. 💪 **EXERCICES** - `/exercises`
**Interface tactile améliorée**

#### ✅ **Tests boutons:**
- [ ] **Boutons d'action**: Plus grands et tactiles
- [ ] **Icônes**: 24px minimum (Edit, Delete, View)
- [ ] **Cards exercices**: Style uniforme
- [ ] **Touch friendly**: Mobile confortable

### 6. 🍎 **NUTRITION** - `/nutrition`
**Formulaires et interactions**

#### ✅ **UX améliorée:**
- [ ] **Recherche aliments**: Input moderne avec icône
- [ ] **Boutons ajout**: Taille tactile optimale  
- [ ] **Modals**: Style shadcn/ui cohérent
- [ ] **Dark mode**: Formulaires lisibles

### 7. 📈 **PROGRESSION** - `/progress`
**Touch targets graphiques**

#### ✅ **Interactivité:**
- [ ] **Boutons objectifs**: "Éditer"/"Supprimer" plus gros
- [ ] **Navigation graphiques**: Sélecteurs périodes tactiles
- [ ] **Responsive**: Graphiques adaptés mobile

## 🎨 **TESTS DESIGN SYSTEM**

### 8. 🔧 **COHÉRENCE GLOBALE**
**Navigation dans l'app**

#### ✅ **Parcours utilisateur:**
1. **Page d'accueil** → **Profil** → **Exercices** → **Retour**
2. Vérifie la **cohérence visuelle**:
   - [ ] Boutons même style partout
   - [ ] Cards uniformes
   - [ ] Icônes taille consistante
   - [ ] Typography harmonieuse

#### 🌙 **Dark Mode Global:**
1. Active le mode sombre
2. Navigue sur **5-6 pages** différentes
3. **Aucun flash blanc** ou élément éblouissant
4. **Lisibilité** préservée partout

### 9. 📱 **RESPONSIVE COMPLET**
**Tous formats d'écran**

#### ✅ **Test multi-device (F12):**
- [ ] **iPhone SE** (375px): Navigation tactile
- [ ] **iPad** (768px): Layout adapté
- [ ] **Desktop** (1200px+): Espacement optimal
- [ ] **Mode paysage**: Pas de débordement

## ⚡ **TESTS PERFORMANCE**

### 10. 🚀 **VITESSE & FLUIDITÉ**
**Production optimisée**

#### ✅ **À ressentir:**
- [ ] **Chargement initial**: < 3 secondes
- [ ] **Navigation**: Transitions fluides
- [ ] **Pas de CLS**: Éléments ne "sautent" pas au chargement
- [ ] **Images**: Chargement progressif optimisé

#### 🛠️ **Test DevTools:**
1. F12 → **Lighthouse** tab
2. Clique "Generate report" → **Mobile**
3. **Score attendu**: Accessibility > 90, Performance > 75

## 🚨 **TESTS CRITIQUES (À VÉRIFIER ABSOLUMENT)**

### ❌ **PROBLÈMES À CHERCHER:**

#### 🔍 **Régressions possibles:**
- [ ] **Fonctionnalité cassée**: Tout doit marcher comme avant
- [ ] **Erreurs console**: F12 → Console (pas d'erreurs rouges)
- [ ] **404 ou crashes**: Navigation ne doit pas planter
- [ ] **Données perdues**: Exercices, profils, stats intacts

#### 🎨 **Incohérences visuelles:**
- [ ] **Mix de styles**: Pas de mélange ancien/nouveau design
- [ ] **Icônes disparates**: Tailles cohérentes partout
- [ ] **Débordements**: Texte qui sort des containers
- [ ] **Mode sombre cassé**: Éléments blancs inattendus

## 📋 **RAPPORT DE TEST**

### ✅ **À noter pendant les tests:**

#### 🎯 **Points positifs observés:**
- Quelle amélioration te frappe le plus?
- Dark mode: confortable ou pas?
- Touch targets: plus agréable sur mobile?
- Performance: app plus rapide?

#### ⚠️ **Points négatifs/bizarres:**
- Quelque chose de cassé?
- Style incohérent quelque part?
- Difficulté d'utilisation?
- Performance dégradée?

## 🏁 **VALIDATION FINALE**

### ✅ **Critères de succès:**
- [ ] **App fonctionnelle**: Aucune régression majeure
- [ ] **Design cohérent**: Style shadcn/ui visible et harmonieux
- [ ] **Dark mode parfait**: Aucun éblouissement
- [ ] **Touch friendly**: Mobile agréable à utiliser
- [ ] **Performance OK**: Chargement fluide

---

### 🎯 **FOCUS TEST (2 minutes top chrono):**

**Le test le plus important:**
1. **Page d'accueil** → **Toggle dark mode** → **Page profil** → **Exercices**
2. **Mobile mode** (F12) → **Navigation tactile**
3. Si **tout marche** et **look moderne**: ✅ **SUCCÈS!**

---

**💬 Dis-moi ce que tu observes page par page!**