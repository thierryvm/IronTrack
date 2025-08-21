# 🚀 PLAN D'ACTION WCAG 2.1 AA - IRONTRACK

**Priorité**: URGENT - Corrections critiques avant production  
**Objectif**: Passer de 35/100 à 85/100 (conforme WCAG 2.1 AA)

---

## 🚨 PHASE 1 - CORRECTIONS CRITIQUES (48H)

### 1.1 **CONTRASTE EmailAuthForm.tsx** - 47 violations

**Fichier**: `src/components/auth/EmailAuthForm.tsx`

#### 🔧 Corrections ligne par ligne:

```typescript
// ❌ AVANT (lignes 114, 136, 172)
className="block text-sm font-medium text-white/90 mb-2"

// ✅ APRÈS - Utiliser contraste sécurisé
className="block text-sm font-medium text-white dark:text-gray-100 mb-2"
```

```typescript
// ❌ AVANT (lignes 118, 141, 176) - Icons à faible contraste
className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5"

// ✅ APRÈS
className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 dark:text-gray-300 w-5 h-5"
```

```typescript
// ❌ AVANT (lignes 156, 195) - Boutons toggle password
className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"

// ✅ APRÈS - Ajouter gestion clavier + contraste
className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white focus:text-white focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none transition-colors"
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setShowPassword(!showPassword);
  }
}}
tabIndex={0}
role="button"
aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
```

```typescript
// ❌ AVANT (ligne 162) - Texte d'aide faible contraste
className="text-xs text-white/70 mt-1"

// ✅ APRÈS
className="text-xs text-white/90 dark:text-gray-200 mt-1"
```

#### 🏷️ Ajouter ARIA pour erreurs:

```typescript
// ❌ AVANT (lignes 84-94) - Messages d'erreur sans ARIA
{error && (
  <motion.div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-4 backdrop-blur-md">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
      <p className="text-red-200 text-sm">{error}</p>
    </div>
  </motion.div>
)}

// ✅ APRÈS - ARIA compliant
{error && (
  <motion.div 
    role="alert"
    aria-live="polite"
    className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-4 backdrop-blur-md"
  >
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-red-100 text-sm font-medium">{error}</p>
    </div>
  </motion.div>
)}
```

```typescript
// Inputs avec ARIA pour erreurs
<input
  id="email"
  name="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-md text-white placeholder-white/70"
  placeholder="ton-email@exemple.com"
  required
  autoComplete={isSignUp ? 'email' : 'username'}
  aria-describedby={error ? "email-error" : undefined}
  aria-invalid={!!error}
/>
```

### 1.2 **BOUTONS Button.tsx** - 23 violations

**Fichier**: `src/components/ui/button.tsx`

#### 🔧 Corrections contraste et tailles:

```typescript
// ❌ AVANT (ligne 17) - Bouton secondaire faible contraste  
secondary: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"

// ✅ APRÈS
secondary: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:bg-gray-300 dark:focus:bg-gray-600"
```

```typescript
// ❌ AVANT (ligne 22) - Ghost button contraste
ghost: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"

// ✅ APRÈS  
ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
```

```typescript
// ✅ Ajouter tailles tactiles sécurisées
size: {
  sm: "h-10 px-3 py-2 text-xs", // Augmenté de h-9 à h-10 (40px min)
  default: "h-11 px-4 py-2",    // Augmenté de h-10 à h-11 (44px min)  
  md: "h-12 px-5 py-3",         // Augmenté de h-11 à h-12 (48px)
  lg: "h-14 px-6 py-3 text-base", // Augmenté de h-12 à h-14 (56px)
  xl: "h-16 px-8 py-4 text-lg",   // Augmenté de h-14 à h-16 (64px)
  icon: "h-11 w-11",            // Augmenté de h-10 w-10 à h-11 w-11
},
```

### 1.3 **TOUCH TARGETS Globaux** - 156 violations

#### 🔍 Rechercher et remplacer dans tous les fichiers:

```bash
# Commandes de recherche/remplacement
find src/ -name "*.tsx" -exec sed -i 's/h-8 w-8/h-11 w-11/g' {} +
find src/ -name "*.tsx" -exec sed -i 's/h-6 w-6/h-10 w-10/g' {} +
find src/ -name "*.tsx" -exec sed -i 's/p-1 /p-3 /g' {} +
find src/ -name "*.tsx" -exec sed -i 's/p-2 /p-3 /g' {} +
```

#### 🎯 Fichiers prioritaires à corriger:
1. `src/components/auth/InAppBrowserWarning.tsx` - 5 violations
2. `src/components/exercises/*Form*.tsx` - 34 violations  
3. `src/components/ui/Modal2025.tsx` - 12 violations

---

## ⚠️ PHASE 2 - AMÉLIORATIONS IMPORTANTES (1 SEMAINE)

### 2.1 **MODE SOMBRE Boutons Orange**

#### 🔧 Optimisations dégradés:

```typescript
// ❌ AVANT - Boutons orange en mode sombre trop vifs
default: "bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400"

// ✅ APRÈS - Contraste adapté mode sombre
default: "bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-400 dark:hover:to-red-300"
```

### 2.2 **NAVIGATION CLAVIER Complète**

#### 🎯 Focus Management Modal:

```typescript
// Dans Modal2025.tsx - Ajouter focus trap
useEffect(() => {
  if (isOpen) {
    const modal = modalRef.current;
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements?.length) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }
}, [isOpen]);
```

### 2.3 **STRUCTURE HEADINGS**

#### 🏷️ Pages sans h1:
1. `src/app/exercises/[id]/page.tsx`
2. `src/app/notifications/page.tsx`  
3. `src/app/support/tickets/[id]/page.tsx`

```tsx
// Ajouter h1 principal à chaque page
<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
  {/* Titre descriptif de la page */}
</h1>
```

---

## 💡 PHASE 3 - OPTIMISATIONS AVANCÉES (2-3 SEMAINES)

### 3.1 **ANIMATIONS ACCESSIBLES**

#### 🎭 Respect prefers-reduced-motion:

```css
/* Ajouter dans globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 3.2 **TESTS AUTOMATISÉS**

#### 🧪 Script de validation continue:

```javascript
// scripts/accessibility-validation.js
const { execSync } = require('child_process');

const runAccessibilityChecks = () => {
  console.log('🧪 Running accessibility checks...');
  
  // 1. Contraste automatique
  execSync('node agents/accessibility-agent.js --contrast-check');
  
  // 2. Tests composants
  execSync('npm run test src/components/ui/__tests__/accessibility.test.tsx');
  
  // 3. Validation markup
  execSync('npx pa11y-ci http://localhost:3000');
};

runAccessibilityChecks();
```

---

## 📊 MÉTRIQUES DE SUIVI

### 🎯 Objectifs chiffrés:

| Phase | Score WCAG | Violations | Délai |
|-------|------------|------------|-------|
| **Phase 1** | 35 → 65 | 537 → 150 | 48h |
| **Phase 2** | 65 → 80 | 150 → 50 | 1 semaine |  
| **Phase 3** | 80 → 90+ | 50 → 0 | 3 semaines |

### 📈 KPIs de monitoring:

```bash
# Commandes validation quotidienne
node agents/accessibility-agent.js --audit
echo "Score: $(grep 'SCORE ACCESSIBILITÉ' accessibility-audit-report.md)"

# Alertes critiques
grep -c "CRITICAL\|HIGH" accessibility-audit-report.md
```

---

## 🏆 VALIDATION FINALE

### ✅ Checklist Pre-Release:

- [ ] **Score WCAG ≥ 85/100** 
- [ ] **0 violations critiques contraste**
- [ ] **Tous boutons ≥ 44px × 44px**
- [ ] **Navigation clavier 100% fonctionnelle**
- [ ] **Messages erreur avec ARIA**
- [ ] **Structure h1-h6 logique**
- [ ] **Images avec alt descriptif**
- [ ] **Tests lecteurs d'écran OK**
- [ ] **Zoom 200% sans casse**
- [ ] **Mode sombre conforme**

### 🧪 **Tests de validation**:

```bash
# Suite complète
npm run test:accessibility
node agents/accessibility-agent.js --audit
npx lighthouse --accessibility --view

# Tests manuels requis
# 1. Navigation clavier complète (Tab/Shift+Tab)
# 2. Lecteur d'écran (NVDA/VoiceOver)  
# 3. Zoom browser 200%
# 4. Contraste device settings
```

---

**Responsable**: Équipe Dev Frontend  
**Review**: Lead UX/UI  
**Timeline**: 3-4 semaines  
**Budget estimé**: 1-2 sprints développement