# 🚀 Guide BMAD pour IronTrack

## 📦 Installation Complète

BMAD nécessite une installation interactive. Pour terminer l'installation :

1. **Dans ton terminal**, lance :
   ```bash
   npx bmad-method@alpha install
   ```

2. **Réponds aux questions** :
   - Installation directory : `Entrée` (confirme le répertoire actuel)
   - Select tools : **Espace** sur `Claude Code ⭐` puis `Entrée`
   - TTS : `Yes` ou `No` (selon préférence)
   - Modules : **Espace** sur `BMM: BMad Method` puis `Entrée`
   - Custom module : `No` (on peut l'ajouter plus tard)
   - Name : `Thierry (IronTrack)`
   - Language : `Français`
   - Document language : `French`
   - Output folder : `_bmad-output` (ou `Entrée` pour défaut)

## 🎯 Utilisation de BMAD dans IronTrack

### Commandes Principales

#### 1. Initialiser un Workflow
```
*workflow-init
```
Analyse ton projet IronTrack et recommande le workflow approprié.

#### 2. Agents Disponibles

**Agent Architecte** :
```
*agent-architect
```
Pour l'architecture, la structure et les décisions techniques.

**Agent Développeur** :
```
*agent-developer
```
Pour le développement, le code et les implémentations.

**Agent Testeur** :
```
*agent-tester
```
Pour les tests, la qualité et les validations.

**Agent Chef de Produit** :
```
*agent-product-manager
```
Pour les fonctionnalités, les priorités et la roadmap.

### 📋 Workflows Recommandés pour IronTrack

#### Workflow : Amélioration du Design System
```
*workflow-design-system
```
Utilise avec ton `irontrack_validator.py` pour corriger automatiquement les violations.

#### Workflow : Optimisation Performance
```
*workflow-performance
```
Pour améliorer les scores Lighthouse et optimiser le bundle.

#### Workflow : Accessibilité WCAG
```
*workflow-accessibility
```
Pour corriger les problèmes d'accessibilité détectés.

#### Workflow : Tests et Qualité
```
*workflow-testing
```
Pour améliorer la couverture de tests.

## 🔧 Intégration avec tes Outils Existants

### Avec `irontrack_validator.py`

1. Lance ton validateur :
   ```bash
   python irontrack_validator.py
   ```

2. Utilise BMAD pour corriger automatiquement :
   ```
   *agent-developer
   *workflow-design-system
   ```
   Puis demande : "Corrige toutes les violations détectées par irontrack_validator.py"

### Avec tes Agents Existants

Tes fichiers dans `agents/` peuvent être intégrés comme références :
- `agents/accessibility.md` → Workflow accessibilité
- `agents/architecture.md` → Agent architecte
- `agents/performance.md` → Workflow performance
- `agents/security.md` → Agent sécurité
- `agents/ui-ux.md` → Workflow design system

## 📁 Structure BMAD

Après installation, tu auras :

```
irontrack/
├── .bmad/                    # Configuration BMAD
│   ├── agents/               # Agents spécialisés
│   ├── workflows/            # Flux de travail
│   └── config.json           # Configuration
├── _bmad-output/             # Fichiers générés
│   ├── reports/              # Rapports
│   ├── docs/                 # Documentation générée
│   └── code/                 # Code généré
└── ...
```

## 🎓 Exemples d'Utilisation

### Exemple 1 : Corriger les Violations du Design System

```bash
# 1. Lancer le validateur
python irontrack_validator.py > violations.txt

# 2. Dans Claude Code, charger l'agent développeur
*agent-developer

# 3. Demander la correction
"Analyse violations.txt et corrige toutes les violations du design system détectées. Utilise les tokens CSS et respecte WCAG AA."
```

### Exemple 2 : Améliorer l'Accessibilité

```
*workflow-accessibility
*agent-tester

"Audite l'accessibilité de tous les composants React dans src/components/. Corrige les problèmes ARIA, contraste et navigation clavier."
```

### Exemple 3 : Optimiser les Performances

```
*workflow-performance
*agent-architect

"Analyse le bundle Next.js et propose des optimisations. Cible un score Lighthouse > 90."
```

## 🔄 Workflow Complet Type

1. **Analyse** : `*workflow-init` pour comprendre le projet
2. **Planification** : `*agent-product-manager` pour prioriser
3. **Architecture** : `*agent-architect` pour la structure
4. **Développement** : `*agent-developer` pour l'implémentation
5. **Tests** : `*agent-tester` pour la validation
6. **Documentation** : Les agents génèrent automatiquement dans `_bmad-output/`

## 📚 Ressources

- **Documentation BMAD** : http://docs.bmad-method.org/
- **GitHub** : https://github.com/bmad-code-org/BMAD-METHOD/
- **YouTube** : https://www.youtube.com/@BMadCode

## 💡 Astuces

1. **Utilise les workflows** plutôt que les agents seuls pour des tâches complexes
2. **Garde `_bmad-output/` dans `.gitignore`** (fichiers générés)
3. **Intègre BMAD dans tes scripts npm** si besoin
4. **Les agents parlent français** grâce à ta configuration !

## 🚨 Dépannage

### BMAD ne répond pas ?
- Vérifie que `.bmad/` existe
- Relance `*workflow-init`

### Erreurs d'installation ?
- Supprime `.bmad/` et réinstalle
- Vérifie Node.js version (>= 18)

### Agents ne trouvent pas les fichiers ?
- Vérifie que tu es dans le bon répertoire
- Utilise des chemins relatifs depuis la racine du projet

---

**Bon développement avec BMAD et IronTrack ! 🎯**
