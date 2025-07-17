# 📋 Cahier des Charges UX - IronTrack
**Amélioration de l'expérience utilisateur basée sur l'audit Claude 4**

---

## 🎯 CONTEXTE ET OBJECTIFS

### Score UX Actuel
- **Score global** : 4/10
- **Cible** : 8/10 en 3 mois
- **Priorité** : Réduction du taux d'abandon (60-70% dans les 24h)

### Architecture Actuelle
```
Navigation existante:
├── 🏠 Accueil (page simple)
├── 🏋️ Exercices (catalogue)
├── 📅 Calendrier (planning)
├── 💪 Séances (historique)
├── 👥 Partenaires (social)
├── 📈 Progression (stats)
├── 🥗 Nutrition (alimentation)
└── 👤 Profil (paramètres)
```

---

## 🚨 PROBLÈMES CRITIQUES IDENTIFIÉS

### 1. Onboarding Inexistant
- **Impact** : 60-70% abandon première session
- **État** : Aucun processus d'accueil
- **Priorité** : CRITIQUE

### 2. Page d'Accueil Non Personnalisée
- **Impact** : Utilisateurs perdus dès l'arrivée
- **État** : Interface générique
- **Priorité** : URGENT

### 3. Manque de Gamification
- **Impact** : Faible motivation et rétention
- **État** : Aucun élément motivationnel
- **Priorité** : ÉLEVÉ

### 4. Navigation Confuse
- **Impact** : Friction utilisateur
- **État** : Hiérarchie peu claire
- **Priorité** : MOYEN

---

## 📐 PLAN D'ACTION PRIORISÉ

### Phase 1 - Fixes Critiques (2-4 semaines)
**Objectif** : Passer de 4/10 à 6/10

#### 1.1 Page d'Accueil Améliorée 🏠
- **Statut** : 🔄 EN COURS
- **Délai** : 1-2 jours
- **Éléments** :
  - [ ] Section "Séance du jour" prédominante
  - [ ] Widget "Progression de la semaine"
  - [ ] CTA principal "Commencer ma séance"
  - [ ] Aperçu des prochaines séances
  - [ ] Statistiques motivantes (streak, total séances)

#### 1.2 Onboarding Express 👋
- **Statut** : 📋 PLANIFIÉ
- **Délai** : 2-3 jours
- **Éléments** :
  - [ ] Écran 1 : Objectifs (perte poids, muscle, forme)
  - [ ] Écran 2 : Niveau (débutant, intermédiaire, avancé)
  - [ ] Écran 3 : Disponibilité (fréquence séances)
  - [ ] Sauvegarde préférences utilisateur
  - [ ] Personnalisation immédiate

#### 1.3 Gamification Basique 🎯
- **Statut** : 📋 PLANIFIÉ
- **Délai** : 2-3 jours
- **Éléments** :
  - [ ] Système de badges simples
  - [ ] Compteur de streak (jours consécutifs)
  - [ ] Progression visuelle
  - [ ] Célébrations d'accomplissements
  - [ ] Objectifs hebdomadaires

### Phase 2 - Optimisations (4-8 semaines)
- **Recommandations IA** personnalisées
- **Mode coach** avec guidage vocal
- **Optimisation mobile** avancée
- **Minuteur intégré** pour séances

### Phase 3 - Innovation (8-12 semaines)
- **Communauté** et défis entre amis
- **Coach IA adaptatif**
- **Intégrations** wearables
- **Contenu premium**

---

## 🔧 SPÉCIFICATIONS TECHNIQUES

### Sécurité
- **Authentification** : Supabase Auth (existant)
- **Données** : Chiffrement en transit et au repos
- **Validation** : Sanitisation des entrées utilisateur
- **Permissions** : Contrôle d'accès par utilisateur

### Responsive Design
- **Mobile First** : Priorité iOS/Android
- **Breakpoints** : 
  - Mobile : < 640px
  - Tablet : 640px - 1024px
  - Desktop : > 1024px
- **Tests** : iPhone 14, Galaxy S23, iPad

### Performance
- **Temps de chargement** : < 3 secondes
- **Bundle size** : Optimisation des imports
- **Images** : Compression et lazy loading
- **Cache** : Stratégie de mise en cache

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs Phase 1
- **Taux de complétion onboarding** : > 85%
- **Temps passé sur l'accueil** : > 30 secondes
- **CTR "Commencer ma séance"** : > 40%
- **Rétention J7** : > 30% (vs 20% actuel)

### Outils de Mesure
- **Analytics** : À implémenter
- **Heatmaps** : Hotjar (suggéré)
- **Tests utilisateurs** : 5 utilisateurs par phase
- **A/B Testing** : Onboarding variants

---

## 🎨 DESIGN SYSTEM

### Couleurs Motivationnelles
- **Progression** : Vert (#10B981)
- **Défis** : Orange (#F59E0B)
- **Accomplissements** : Bleu (#3B82F6)
- **Erreurs** : Rouge (#EF4444)

### Composants Prioritaires
- **Button** : CTA principal + secondaire
- **Card** : Conteneur d'information
- **Badge** : Accomplissements
- **ProgressBar** : Progression visuelle
- **Modal** : Onboarding et confirmations

---

## 🧪 TESTS ET VALIDATION

### Tests Obligatoires
- **Fonctionnels** : Tous les nouveaux flows
- **Responsive** : iPhone 14, iPad, Desktop
- **Sécurité** : Validation des entrées
- **Performance** : Temps de chargement
- **Accessibilité** : Contraste et navigation clavier

### Checklist Déploiement
- [ ] Build sans erreurs
- [ ] Tests unitaires passés
- [ ] Tests responsive validés
- [ ] Audit sécurité OK
- [ ] Performance acceptable
- [ ] Backup base de données

---

## 📝 JOURNAL DE PROGRESSION

### 17 Juillet 2025
- **Audit UX** : Réalisé par Claude 4
- **Score initial** : 4/10
- **Cahier des charges** : Créé
- **Priorité Phase 1** : Définie
- **Statut** : Démarrage amélioration page d'accueil

#### Améliorations page d'accueil réalisées :
- ✅ **Section "Séance du jour"** : Ajoutée en haut avec CTA principal
- ✅ **CTA "Commencer ma séance"** : Bouton proéminent avec design attractif
- ✅ **Progression motivante** : Section objectif hebdomadaire améliorée
- ✅ **Hiérarchie visuelle** : Réorganisation des sections par priorité
- ✅ **Build et tests** : Compilation réussie sans erreurs
- ✅ **Responsive design** : Adaptation mobile/desktop intégrée

#### Prochaines étapes :
- 📋 **Onboarding express** : 3 étapes d'accueil
- 📋 **Gamification** : Badges et système de récompenses
- 📋 **Tests utilisateurs** : Validation des améliorations

### [À COMPLÉTER AU FUR ET À MESURE]

---

## 🚀 ACTIONS IMMÉDIATES

### Prochaines Étapes
1. **Améliorer la page d'accueil** (EN COURS)
2. **Créer l'onboarding express**
3. **Implémenter la gamification basique**
4. **Optimiser la navigation mobile**

### Ressources Nécessaires
- **Temps estimé Phase 1** : 1-2 semaines
- **Outils** : Figma (prototypage), Hotjar (analytics)
- **Tests** : 5 utilisateurs pour validation

---

*Dernière mise à jour : 17 juillet 2025*
*Document évolutif - À mettre à jour à chaque session*