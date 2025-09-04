# 🤖 Guide des Agents Spécialisés IronTrack

## 🚀 Comment utiliser les agents

### Dans Cursor IDE

Les agents sont configurés pour être invoqués directement dans Cursor IDE :

```bash
# Invoquer un agent spécialisé
@agents/security.md "Audite la sécurité de ce composant"
@agents/accessibility.md "Vérifie l'accessibilité de cette page"
@agents/performance.md "Optimise les performances de ce code"
@agents/ui-ux.md "Améliore l'UX de ce formulaire"
@agents/architecture.md "Refactorise selon les principes SOLID"
```

### Dans Claude Code (terminal)

```bash
# Référencer un agent dans vos questions
"En tant qu'expert sécurité (voir agents/security.md), audite ce code"
"Selon les standards accessibility (agents/accessibility.md), que manque-t-il ?"
"Applique les principes performance (agents/performance.md) à cette page"
```

## 📚 Agents Disponibles

### 🔒 Security Agent
**Fichier** : `agents/security.md`  
**Expertise** : OWASP, authentification, validation, RLS Supabase  
**Utilisation** :
```bash
@agents/security.md "Vérifie la sécurité du formulaire de login"
@agents/security.md "Audite les politiques RLS de cette table"
@agents/security.md "Sécurise l'upload de photos d'exercices"
```

### ♿ Accessibility Agent  
**Fichier** : `agents/accessibility.md`  
**Expertise** : WCAG 2.2, lecteurs d'écran, navigation clavier  
**Utilisation** :
```bash
@agents/accessibility.md "Rends ce modal accessible"
@agents/accessibility.md "Vérifie les contrastes de couleur"
@agents/accessibility.md "Optimise pour les lecteurs d'écran"
```

### ⚡ Performance Agent
**Fichier** : `agents/performance.md`  
**Expertise** : Core Web Vitals, Lighthouse, optimisation Next.js  
**Utilisation** :
```bash
@agents/performance.md "Optimise le LCP de la page d'accueil"
@agents/performance.md "Analyse la taille du bundle"
@agents/performance.md "Implémente le lazy loading"
```

### 🎨 UI/UX Agent
**Fichier** : `agents/ui-ux.md`  
**Expertise** : Design system, micro-interactions, UX mobile  
**Utilisation** :
```bash
@agents/ui-ux.md "Améliore l'UX de ce formulaire"
@agents/ui-ux.md "Crée un composant cohérent avec le design system"
@agents/ui-ux.md "Optimise pour mobile"
```

### 🏗️ Architecture Agent
**Fichier** : `agents/architecture.md`  
**Expertise** : Clean Code, SOLID, patterns, scalabilité  
**Utilisation** :
```bash
@agents/architecture.md "Refactorise selon SOLID"
@agents/architecture.md "Implémente le pattern Repository"
@agents/architecture.md "Améliore l'architecture de ce module"
```

## 🎯 Cas d'Usage Concrets

### Exemple 1 : Audit Sécurité Complet
```bash
@agents/security.md "Effectue un audit sécurité complet du composant ExerciseWizard. Vérifie :
- La validation des entrées utilisateur
- La sanitisation des données
- Les failles XSS potentielles  
- Les politiques RLS Supabase
- La gestion des erreurs sensibles"
```

### Exemple 2 : Optimisation Performance
```bash
@agents/performance.md "Optimise les Core Web Vitals de la page /exercises. Focus sur :
- LCP < 1.2s (images d'exercices)
- CLS < 0.05 (layout shifts)
- Bundle size (code splitting)
- Lazy loading des composants lourds"
```

### Exemple 3 : Accessibilité WCAG
```bash
@agents/accessibility.md "Rends la page de progression accessible WCAG 2.2 AA :
- Contrastes couleurs suffisants
- Navigation clavier complète
- Support lecteurs d'écran
- Touch targets 44px minimum
- Focus management dans les modals"
```

## 📋 Templates de Questions

### Pour Security Agent
- "Audite la sécurité de [composant/page]"
- "Vérifie les politiques RLS pour [table]"
- "Sécurise l'upload de [type de fichier]"
- "Valide et sanitise les entrées de [formulaire]"

### Pour Accessibility Agent
- "Rends [composant] accessible WCAG 2.2"
- "Vérifie les contrastes de [page/section]"
- "Optimise [modal/formulaire] pour lecteurs d'écran"
- "Améliore la navigation clavier de [interface]"

### Pour Performance Agent
- "Optimise les Core Web Vitals de [page]"
- "Analyse et réduis le bundle de [module]"
- "Implémente le lazy loading pour [composants]"
- "Optimise les requêtes database de [service]"

### Pour UI/UX Agent
- "Améliore l'UX de [formulaire/interface]"
- "Crée un [composant] cohérent avec le design system"
- "Optimise [page] pour l'expérience mobile"
- "Ajoute des micro-interactions à [interface]"

### Pour Architecture Agent
- "Refactorise [module] selon les principes SOLID"
- "Implémente le pattern [Repository/Factory] pour [domaine]"
- "Améliore l'architecture de [service/composant]"
- "Sépare les responsabilités dans [module]"

## 🔧 Configuration Avancée

### Variables d'Environnement Agents
```bash
# .env.local
AGENTS_ENABLED=true
AGENTS_LOG_LEVEL=info
AGENTS_CACHE_TTL=300
```

### Intégration CI/CD
```yaml
# .github/workflows/agents-check.yml
- name: Security Audit
  run: npx claude-code "@agents/security.md audit all components"
  
- name: Accessibility Check  
  run: npx claude-code "@agents/accessibility.md check all pages"
```

## 🎓 Bonnes Pratiques

### ✅ Utilisation Optimale
- Soyez spécifique dans vos demandes
- Référencez le contexte du code
- Demandez des exemples concrets
- Utilisez les checklists intégrées

### ❌ À Éviter
- Questions trop générales
- Demandes sans contexte
- Ignorez les recommandations
- Mélangez les domaines d'expertise

## 📞 Support

Si un agent ne répond pas comme attendu :
1. Vérifiez la syntaxe de votre demande
2. Soyez plus spécifique dans le contexte
3. Référencez directement le fichier agent
4. Consultez les exemples dans ce guide

---

**🚀 Les agents sont vos experts personnels - utilisez-les efficacement !**