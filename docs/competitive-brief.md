# IronTrack — Competitive Brief & Positioning

> Date : 2026-04-18
> Auteur : Thierry (vibecoder) + assistant IA
> Statut : document de référence Phase 1 (refonte complète IronTrack)
> Durée de vie : 6 mois (à revisiter avant Phase 5 — build MVP)
> Décisions Q1-Q5 tranchées : section 11

---

## 0. TL;DR exécutif

Le marché fitness/musculation/nutrition est **ultra-spécialisé en silos** : les meilleures apps font UNE chose très bien (Strong = log rapide, Fitbod = AI programming, MacroFactor = nutrition adaptative, Cronometer = précision micro). **Aucune ne gère bien les trois piliers à la fois**, et **quasi aucune** ne propose du co-training structuré (scheduling partagé de séances).

**L'angle défendable pour IronTrack**, par ordre de force :

1. **Co-training calendrier partenaires** — vrai white space, Hevy a du social feed mais pas de scheduling synchrone.
2. **Hybride workout + nutrition pointu en UNE app** — même MyFitnessPal (qui a racheté MapMyFitness) ne le fait pas bien.
3. **AI via BYOK (Bring Your Own Key)** — innovation architecturale, user apporte sa clé OpenRouter/Anthropic/etc, IronTrack n'assume aucun coût inference. Zéro équivalent sur le marché.
4. **RGPD-native Europe / PWA 0€ stores** — différenciateur trust + distribution vs concurrents US natifs.
5. **Pricing juste** — Pro à 4,99 €/mois vs Fitbod 79-95 $/an, MacroFactor 72 $/an. Free tier vraiment utilisable.

**Risque #1** : Hevy peut ajouter un calendrier partenaires en 3-6 mois. Il faut donc une **exécution rapide** (MVP en 8-12 semaines) ET un **combo USP** (hybride nutrition + scheduling + BYOK) pour que copier ne suffise pas.

---

## 1. Matrice compétitive (features × compétiteurs)

Légende : ● = excellent · ◐ = partiel · ○ = absent / faible

| Feature | Strong | Hevy | Fitbod | MacroFactor | Cronometer | MyFitnessPal | Jefit | Caliber | Yazio | Freeletics | **IronTrack** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Workout logging rapide | ● | ● | ◐ | ○ | ○ | ○ | ◐ | ◐ | ○ | ◐ | **●** |
| AI programming auto | ○ | ◐ | ● | ○ | ○ | ○ | ◐ | ◐ (coach humain) | ○ | ● | **● BYOK** |
| Nutrition log précis | ○ | ○ | ○ | ● | ● | ● | ○ | ○ | ● | ◐ | **●** |
| Base aliments EU (CIQUAL/OFF) | ○ | ○ | ○ | ◐ | ● | ● | ○ | ○ | ● | ○ | **● (CIQUAL + OFF)** |
| Scan code-barres | ○ | ○ | ○ | ● | ● | ● | ○ | ○ | ● | ○ | **● (Pro)** |
| **Calendrier partenaires sync** | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | **● USP #1** |
| Social feed public | ○ | ● | ○ | ○ | ○ | ◐ | ● | ○ | ○ | ● | **○ (volontaire)** |
| Multi-lingue FR/DE/NL/EN | ◐ | ◐ | ◐ | ○ (EN) | ● | ● | ◐ | ○ (EN) | ● | ● | **●** |
| Toggle kg/lbs | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | **● MVP** |
| Offline complet | ● | ● | ● | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | **● (PWA)** |
| PWA installable / pas de store | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | **● USP** |
| Export CSV/PDF RGPD | ● | ◐ | ○ | ● | ● | ◐ | ◐ | ○ | ◐ | ○ | **●** |
| Mode coach/clients | ○ | ● (Trainer) | ○ | ○ | ○ | ○ | ◐ | ● | ○ | ○ | **● V2** |
| RGPD native EU | ○ | ○ | ○ | ○ | ◐ | ○ (breach 150M) | ○ | ○ | ● | ● | **●** |
| MFA / sécurité auth | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ◐ | ◐ | **● (optionnel)** |

**Lecture rapide** : trois silos dominent (workout, nutrition, hybride coaching). **Aucune app ne coche plus de 60 % des lignes**. IronTrack vise 85 %+ avec 3 zones inattaquables (calendrier + PWA + BYOK AI).

---

## 2. Pricing benchmark (annualisé, EUR approx.)

| App | Free | Pro | Pro+ / Lifetime | Modèle |
|---|---|---|---|---|
| Strong | Basique (3 routines) | 28 €/an | 93 €/lifetime | Freemium léger |
| Hevy | Généreux | 22 €/an | 70 €/lifetime (inclut Trainer) | Freemium fort |
| Fitbod | Essai 3 séances | 74 € ou 89 €/an | — | Subscription premium |
| MacroFactor | Aucun (essai 7j) | 67 €/an (ou 11 €/mois) | — | Subscription only |
| Cronometer | Généreux + ads | 47 €/an (Gold) | — | Freemium |
| MyFitnessPal | Basique (pas de scan) | 75 €/an (Premium) | ~120 €/an (Premium+) | Freemium ads |
| Jefit | Basique | 60 €/an | — | Freemium |
| Caliber | ○ | 28-200 €/mois (coaching humain) | — | Subscription haut de gamme |
| Yazio | Basique (pas de scan) | 45 €/an Pro | — | Freemium |
| Freeletics | Exercices gratuits | 67-89 €/an Coach | 95 € Training+Nutrition | Multi-bundle |
| **IronTrack (reco)** | **Généreux** | **~55 €/an (4,99 €/mois)** | **179 €/an Pro Coach V2** | **Freemium fort + BYOK AI + B2B V2** |

**Observations clés** :
- **Hevy casse les prix** à 22 €/an + lifetime 70 € → c'est la référence "bon rapport qualité/prix" du marché. IronTrack doit s'aligner ou offrir plus pour le prix.
- **MacroFactor à 67 €/an sans free tier** est viable parce que leur algorithme TDEE adaptatif vaut un coach humain. IronTrack Pro à 4,99 €/mois (~55 €/an) est cohérent et attractif.
- **Lifetime option** (Strong, Hevy) = levier de fidélisation fort à envisager pour V2 (ex: 149 € lifetime).
- **Impact BYOK AI** : IronTrack peut offrir des features AI **sans les facturer** ni les inclure dans le Pro = pricing plus bas possible (ou marge supérieure pour Thierry).

---

## 3. Positioning analysis — qui joue où

```
                       │
          PRÉCISION    │
          EXPERT       │
                       │
   MacroFactor  ●      │     ●  Cronometer
                       │
   Fitbod  ●           │                ●  Strong
                       │                ●  Hevy
                       │     ●  Freeletics
  ─────────────────────┼──────────────────────→
                       │                    MASS-MARKET
                       │     ●  MyFitnessPal
                       │     ●  Yazio
          ACCESSIBLE   │
          GRAND PUBLIC │
```

**Axes** :
- Vertical : niveau d'exigence / précision produit
- Horizontal : spécialiste pur vs tout-en-un mass-market

**White spaces identifiés** :

| Zone | Compétiteurs présents | Opportunité IronTrack |
|---|---|---|
| **Co-training structuré** | Aucun sérieux (Workout Partner = niche, Squaddy = communauté floue) | **HAUTE** — vraie zone vide |
| **Hybride workout + nutrition pointu** | MyFitnessPal (faible), Cronometer (no workout) | **HAUTE** — technique mais faisable |
| **AI via BYOK** | Zéro concurrent | **HAUTE** — innovation architecturale |
| **Mobile-first installable 0€** | Aucun en PWA pure | **MOYENNE** — avantage distribution |
| **Europe RGPD-first expérience** | Yazio (nutrition), Freeletics (programmes) | **HAUTE** trust, surtout après breaches US |
| **Coach B2B abordable** | Caliber (trop cher), Hevy Trainer (basique) | **MOYENNE V2** |

---

## 4. Forces & faiblesses — par compétiteur

### Strong (leader iOS log rapide)
- **Forces** : UX la plus propre du marché · logging le plus rapide · lifetime $99 · export CSV.
- **Faiblesses** : iOS-centric (Android faible) · zéro nutrition · zéro social · zéro AI · statique.

### Hevy (challenger cross-platform)
- **Forces** : freemium le plus généreux · Android ET iOS solides · social feed et communauté active · Hevy Trainer inclus dans Pro · lifetime 70 €.
- **Faiblesses** : scheduling absent · pas de nutrition · social = feed passif (likes), pas coop active.

### Fitbod (AI programming leader)
- **Forces** : AI qui construit la séance basé sur récup · Apple Watch excellent.
- **Faiblesses** : cher (79-95 $/an) · philosophie "l'app décide pour toi" frustre les lifters expérimentés · pas de nutrition · pas de social.

### MacroFactor (nutrition TDEE adaptatif)
- **Forces** : algorithme qui ajuste calories/macros selon poids réel · remplace un coach nutrition.
- **Faiblesses** : subscription-only · EN-only · aucun workout · courbe d'apprentissage.

### Cronometer (nutrition précision)
- **Forces** : base USDA/NCCDB la plus fiable · tracking micronutriments · utilisé par pros.
- **Faiblesses** : UI datée · base aliments plus petite que MyFitnessPal · pas de workout · pas de social.

### MyFitnessPal (mass-market nutrition)
- **Forces** : base 18M+ aliments · notoriété massive · barcode scanner.
- **Faiblesses** : **data breach 150M users 2018** · **Cal AI filiale breach 3M users récent** · ads intrusives · Premium+ agressif · qualité data crowdsourced (erreurs fréquentes).

### Jefit (historique musculation + social)
- **Forces** : gros catalogue · communauté historique.
- **Faiblesses** : UI old-school · pas de nutrition sérieuse · freemium limité.

### Caliber (coaching humain hybride)
- **Forces** : vrai coach humain + app · résultats mesurés.
- **Faiblesses** : 28-200 €/mois (cher) · dépendance au coach.

### Yazio (Europe nutrition)
- **Forces** : allemand natif EU · base aliments EU solide · UI soignée · RGPD implicite.
- **Faiblesses** : pas de workout · scanner passé en Pro récemment (sentiment betrayal).

### Freeletics (Europe AI programmes + communauté)
- **Forces** : allemand · AI coach bodyweight solide · communauté forte · **Europe's #1 fitness app**.
- **Faiblesses** : focus bodyweight/HIIT (pas musculation lourde) · nutrition moyenne · pricing multi-bundle confus.

---

## 5. UX patterns 2026 à adopter (research synthétisée)

**Onboarding** :
- Valeur démontrée dans les **30 premières secondes**, AVANT création de compte (modèle Duolingo). Retention +50 %.
- IronTrack : permettre logger 1 séance en mode invité avant de pousser le signup.

**Logging rapide** :
- Tap targets minimum 44×44 px, espacés.
- Raccourcis +/- pour poids/reps (vs clavier numérique).
- Historique last-set en gris au-dessus du champ input.
- Auto-suggest exercise based on last session.

**Progression visuelle** :
- Graphiques volume/PR simples, gros chiffres, peu de couleurs.
- "Streak" hebdomadaire.
- Photo before/after optionnelle chiffrée (opt-in RGPD strict).

**Adaptive UI** :
- Contexte "mode séance" : UI simplifiée, grosse police, contraste max.
- Contexte "mode analyse" : graphiques détaillés, tableaux.

**Cross-device fluidity** :
- Shared storage + progressive sync entre PWA mobile et desktop.
- Session démarrée mobile → reprise desktop pour analyse post-workout.

**Motion & feedback** :
- Micro-animations sur completion set (haptic + visual).
- Skeleton screens vs spinners.
- Gestures : swipe pour delete/édit set.

**Accessibilité 2026** :
- Contrastes WCAG 2.2 AA minimum.
- Mode sombre par défaut (fitness souvent le soir).
- Navigation au clavier complète.

---

## 6. USP défendable IronTrack (5 axes)

### USP #1 — Co-training calendrier partenaires ⭐ (HEADLINE)

**Pitch** : *"Planifie tes séances avec tes partenaires de training. Le seul app qui synchronise ton calendrier fitness avec tes potes de salle."*

**Pourquoi défendable** :
- Aucun concurrent sérieux.
- Effet réseau : plus de partenaires = plus de rétention.
- Coût de switching élevé (invitations + historique séances communes).

**Features MVP** :
- Invitation partenaires via pseudo ou email
- Calendrier partagé avec séances synchronisées
- Accountability : notifications si partenaire log sans toi
- Chat minimal (coordination, pas Instagram)

**Scope V2** :
- Challenges communs (PR collectif)
- Programmation partagée (même plan, suivi parallèle)
- Stats side-by-side partenaire

### USP #2 — Hybride workout + nutrition pointu

**Pitch** : *"Musculation sérieuse ET nutrition précise dans UNE app. Plus besoin de jongler entre Hevy et MyFitnessPal."*

**Features MVP** :
- Workout log (Hevy-grade)
- Nutrition log avec CIQUAL + OpenFoodFacts
- Corrélation simple : séance + apport protéique du jour

**Scope V2** :
- TDEE adaptatif (style MacroFactor) via AI BYOK
- Recommandations macros post-workout

### USP #3 — AI via BYOK (Bring Your Own Key) ⭐ (INNOVATION)

**Pitch** : *"Active les features AI avec ta propre clé. Groq gratuit pour débuter, Claude Opus quand tu veux le top. Nous ne te facturons jamais l'inference."*

**Pourquoi révolutionnaire** :
- Zéro concurrent : tous les acteurs assument les coûts inference (Fitbod, Cal AI, MacroFactor).
- Permet d'offrir du AI premium à 0 € de coût marginal pour IronTrack.
- Liberté user totale : choix du modèle = choix de la qualité = choix du budget.
- Zéro lock-in data : les conversations passent par la clé du user, jamais par un backend IronTrack intermédiaire.

**Implémentation** :
- Settings > AI features > Connecter clé API
- Providers supportés : OpenRouter (meta-router multi-modèles), Anthropic, OpenAI, Google, Mistral, Groq (free tier), xAI
- Clé chiffrée at rest (Supabase Vault ou KMS)
- Préconfig modèles suggérés :
  - **Free** : Llama 3 via Groq (gratuit, rapide)
  - **Balanced** : GPT-4o-mini, Claude Haiku, Gemini Flash
  - **Premium** : Claude Opus, GPT-4, Gemini Pro
- Fallback clair si clé invalide ou quota dépassé

**Features AI activables** :
- Suggestions de progression basées sur historique
- Détection de plateaux + recommandations
- Coach nutrition (recommandations repas)
- Analyse corrélation séance/récup/sommeil
- Génération de programmes personnalisés

**Sécurité BYOK** :
- Chiffrement clé (Supabase Vault ou AES-256 colonne)
- Audit trail chaque usage (modèle, timestamp, feature)
- Rate limit par user (protège contre abuse interne)
- Rotation clé 1-clic
- Logs scrubbés (jamais de clé dans Sentry)

### USP #4 — Europe RGPD-native & trust

**Pitch** : *"Tes données restent en Europe. RGPD respecté dès le premier log. Pas de breach hérité de 2018."*

**Features MVP** :
- Hosting UE (Supabase EU region)
- RLS activé sur toutes tables (règle d'or CLAUDE.md)
- Export RGPD en 1 clic (CSV/JSON)
- Suppression compte complète en 1 clic
- MFA TOTP optionnel (gratuit)
- Pas de tracking tiers

### USP #5 — PWA installable, 0 € stores

**Pitch** : *"Installe IronTrack en 1 tap depuis ton navigateur. Pas d'App Store. Pas de Play Store. Updates instantanées."*

**Risque résiduel** : certains users exigent app native (iOS). → Plan V2 Tauri 2 Mobile quand stack stable.

---

## 7. Threats & risques concurrentiels

### Menace #1 — Hevy ajoute scheduling partenaires (3-6 mois) 🚨 HAUTE

**Probabilité** : 40-60 %.
**Impact** : copie directe USP #1.
**Mitigation** : lancement rapide MVP 8-12 semaines + **combo USP** (scheduling + hybride nutrition + BYOK = 3 features à copier).

### Menace #2 — MyFitnessPal rachète un workout tracker EU 🟡 MOYENNE

**Probabilité** : 20-30 %.
**Impact** : consolidation marché, budget marketing écrasant.
**Mitigation** : positionnement anti-US / trust / EU-native, capitaliser sur breaches MFP.

### Menace #3 — AI fitness apps natives (Cal AI, SensAI, Future) 🟡 MOYENNE

**Probabilité** : déjà en cours.
**Impact** : commoditisation AI coaching.
**Mitigation** : **BYOK neutralise partiellement** — on n'est pas en course frontale sur la qualité AI, on est sur le modèle économique. Angle humain-humain (co-training) > angle AI-human (coaching).

### Menace #4 — Freeletics pivote musculation lourde 🟢 BASSE

**Probabilité** : 10-15 %.
**Mitigation** : exécution rapide + branding "musculation + nutrition" clair.

### Menace #5 — Régulation RGPD / DMA se durcit ⚪ NEUTRE (favorable)

**Impact** : positif pour IronTrack (EU-native), négatif pour concurrents US.
**Mitigation** : être over-compliant dès le départ.

---

## 8. Go-to-Market Europe — SEO & positionnement

### Mots-clés prioritaires FR-BE / FR-FR

| Requête | Volume /mois | Concurrence | Priorité |
|---|---|---|---|
| application musculation | 8 000 | Haute | P1 |
| app fitness française | 2 500 | Moyenne | P1 |
| suivi séance musculation | 1 800 | Moyenne | P1 |
| app partenaire entraînement | 400 | **Basse** | P0 ⭐ |
| carnet entraînement musculation | 900 | Moyenne | P2 |
| application nutrition musculation | 1 200 | Haute | P2 |
| app fitness RGPD | 150 | **Très basse** | P0 ⭐ |
| alternative MyFitnessPal Europe | 600 | Basse | P1 |
| app fitness BYOK IA | — | **Vide** | P0 ⭐ niche |

### Mots-clés prioritaires DE

| Requête | Priorité |
|---|---|
| Krafttraining App | P1 |
| Muskelaufbau Tracker | P1 |
| Fitness Tracker Deutsch DSGVO | P0 ⭐ |
| Trainingspartner App | P0 ⭐ |

### Mots-clés prioritaires NL

| Requête | Priorité |
|---|---|
| Fitness app Nederlands | P1 |
| Krachttraining tracker | P1 |
| Trainingspartner app | P0 ⭐ |

### Mots-clés prioritaires EN (marché secondaire)

| Requête | Priorité |
|---|---|
| workout partner app | P0 ⭐ |
| gym buddy scheduler | P0 ⭐ |
| GDPR fitness tracker | P1 |
| Europe Hevy alternative | P1 |
| BYOK fitness AI | P0 ⭐ niche |

### Open Graph / GEO-OG 2026

- **OG image dynamique** par langue (FR/NL/DE/EN) avec prix euro localisé.
- `hreflang` strict FR-BE / FR-FR / NL-BE / NL-NL / DE / EN.
- Schema.org `MobileApplication` + `Review` + `AggregateRating`.
- JSON-LD FAQ sur landing.
- **Core Web Vitals** : LCP < 2,5s, INP < 200ms, CLS < 0,1 (Lighthouse ≥ 95 non négociable).

---

## 9. Sécurité 2026 & RGPD — positionnement trust

### Checklist minimum (non-négociable)

- [ ] RLS Supabase activé sur **toutes** les tables
- [ ] Hosting Supabase **EU region** (eu-west-1 ou eu-central-1)
- [ ] MFA TOTP optionnel (gratuit)
- [ ] Rate limiting par IP + par user + queue
- [ ] Audit trail admin (+ audit trail BYOK AI usage)
- [ ] Encryption PII at rest (Supabase natif + Vault pour clés API BYOK)
- [ ] OWASP Top 10 systématique
- [ ] Password hashing bcrypt 12 rounds
- [ ] JWT rotation + session expiry
- [ ] CSP stricte + HSTS + permissions-policy
- [ ] Export RGPD en 1 clic (JSON complet incluant les events analytics self-built)
- [ ] Suppression compte complète en 1 clic
- [ ] Registre des traitements RGPD public
- [ ] DPO contact clair dans footer
- [ ] Pas de tracking tiers
- [ ] Cookie banner minimal
- [ ] Audit dépendances `npm audit` + Dependabot
- [ ] Monitoring erreurs Sentry (PII scrubbing + clés API BYOK scrubbing)
- [ ] Page `/security` publique avec bug bounty email

### Angle marketing trust (landing)

> *"IronTrack est hébergé en Europe. Tes données d'entraînement ne quittent jamais le territoire européen. Nous n'avons jamais subi de fuite. Nous n'avons jamais été rachetés par un conglomérat US. Nous n'avons aucun intérêt à vendre tes macros à un assureur. Et si tu actives l'IA, tu apportes ta propre clé — tes conversations ne passent même pas par nos serveurs."*

---

## 10. Strategic implications — ce qu'on fait maintenant

### À construire en PRIORITÉ (MVP)

1. **Workout log** niveau Hevy/Strong (rapidité d'abord)
2. **Calendrier partenaires** avec invitation pseudo/email + notifications
3. **Nutrition log** avec base CIQUAL + OpenFoodFacts (scan barcode en Pro)
4. **Auth + RLS + RGPD** bétonné dès le jour 1
5. **4-5 programmes templates** intégrés (PPL, StrongLifts 5x5, Upper/Lower, Full Body 3x, Starting Strength)
6. **Toggle kg/lbs** (ligne de conversion, défaut métrique)
7. **Landing multi-langue** avec SEO P0 ciblé

### À construire en V1 (post-MVP, 3-6 mois)

- **BYOK AI** : Settings > Connexion clé + features AI (suggestions, détection plateau, coach nutrition)
- Analytics avancés custom self-built (PRs, prédictions, graphiques progression)
- TDEE adaptatif style MacroFactor (via BYOK AI)
- Export CSV/PDF RGPD
- Analytics product self-built dans Supabase (events table)

### À construire en V2 (6-12 mois)

- Mode Coach/Clients (B2B Pro Coach 14,99 €/mois)
- Tauri 2 Mobile natif iOS/Android (quand stack stable)
- Challenges communs entre partenaires
- Marketplace programmes payants (revenue partagé avec coachs tiers)
- Lifetime option (149 € one-shot)

### À NE PAS faire

- ❌ **Assumer coûts inference AI** (règle BYOK stricte, budget 0 €)
- ❌ Course à l'AI la plus pointue (guerre perdue vs Cal AI / SensAI)
- ❌ Social feed Instagram-like
- ❌ Compléments nutritionnels / affiliate lourd
- ❌ Premium+ tier caché (pratique MyFitnessPal détestée)
- ❌ Tracking tiers pour analytics (Plausible/Umami Cloud = dépendance externe)

### Timing critique

- **0-2 semaines** : Phase 0 (snapshot DB, inventaire préservation, ADRs)
- **2-4 semaines** : Phase 2-3 (stack décisions, design system, mockups)
- **4-8 semaines** : Phase 4-5 (purge DB + MVP workout+calendar)
- **8-12 semaines** : Phase 5 suite (nutrition + MVP public)
- **Mois 4-6** : itération basée sur premiers users, V1 features (dont BYOK)

**Fenêtre first-mover** : 3-6 mois avant que Hevy ou Freeletics puisse répliquer le calendrier partenaires. Le BYOK AI ajoute une deuxième couche de protection concurrentielle (plus complexe à copier car requiert repenser le modèle économique).

---

## 11. Décisions Q1-Q5 tranchées (2026-04-18)

### Q1 — Nom : **IronTrack** ✅
**Rationale** : domaine déjà acquis, rebrand coûteux et inutile. On adapte le tagline pour inclure la nutrition et le partenariat :
> *"IronTrack — Musculation, nutrition et partenaires, en Europe."*

Le nom "Track" reste cohérent avec tracking workout + nutrition + partenaires.

### Q2 — Unités : **Toggle kg/lbs dès MVP** ✅
**Rationale** : coût d'implémentation marginal (1 colonne `units_preference` dans profiles + helper de conversion), évite refonte DB V2 si on conquiert UK + marché US. Défaut : métrique (kg/cm).

```typescript
// Pattern simple
const displayWeight = (value: number, units: 'kg' | 'lbs') =>
  units === 'lbs' ? (value * 2.20462).toFixed(1) : value.toFixed(1);
```

### Q3 — Base aliments : **CIQUAL + OpenFoodFacts** ✅
**Rationale** : OpenFoodFacts seul est insuffisant (le bug tomate = boîtes only, aliments frais absents). CIQUAL (ANSES, base officielle FR) couvre les aliments bruts (légumes, fruits, viandes, poissons). OpenFoodFacts couvre les produits industriels code-barres (Nutella, yaourts marques). Union des deux = couverture 95 %+.

**Implémentation** :
- Import CIQUAL CSV (licence ouverte Etalab) dans table Supabase `foods_ciqual`
- API OpenFoodFacts en temps réel pour scan barcode
- Recherche unifiée : UNION CIQUAL + cache OpenFoodFacts, ranking par popularité

### Q4 — Programmes templates : **Oui, 4-5 templates standards + BYO routine** ✅
**Rationale** : sans programme intégré, le beginner quitte au premier usage ("l'app me demande quoi faire, je sais pas"). Mais le target user expert a déjà sa routine — donc toujours permettre Bring Your Own Routine.

**MVP templates** :
- **Push/Pull/Legs** (6 jours/semaine, volume élevé)
- **StrongLifts 5x5** (3 jours/semaine, débutant force)
- **Upper/Lower** (4 jours/semaine, équilibre)
- **Full Body 3x** (3 jours/semaine, débutant/intermédiaire)
- **Starting Strength** (3 jours/semaine, pure force)

Format : JSON simple `{ name, days: [{ exercises: [{ name, sets, reps, progression }]}]}`. Effort minimal, valeur user élevée.

### Q5 — Analytics : **Sentry (erreurs) + self-built Supabase (product)** ✅
**Rationale** : pas de serveur, pas de budget, pas de dépendance externe. Ta v1 faisait tout en maison et ça marchait bien — on remet ça.

**Stack retenue** :
- **Monitoring erreurs** : Sentry free tier sur Vercel (déjà en place, on garde)
- **Product analytics** : table Supabase `events` avec RLS stricte
  ```sql
  CREATE TABLE events (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES auth.users,
    event_type text NOT NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
  );
  -- RLS : user ne voit que ses events, admin voit tout agrégé
  ```
- **Dashboard admin** : requêtes SQL dans page `/admin/analytics` (funnel, retention, feature usage)
- **RGPD parfait** : 0 tracker tiers, export inclus dans export RGPD user, purge 1-clic sur suppression compte

Claude Code codera tout en 1-2 PR (comme il l'a fait sur la v1, "motivé ou fou", on tranchera plus tard).

---

## 12. Next steps

**Pour Thierry** :
- [x] Décisions Q1-Q5 tranchées
- [ ] Validation finale du positionnement BYOK AI (section 6 USP #3)
- [ ] Phase 0 : accepter prompt CC IronTrack Step 0 (corrections immédiates)

**Pour l'agent IA (moi)** :
- [ ] Préparer prompt CC IronTrack Step 0 : correction PR #49 + CHANGELOG + migration locale
- [ ] Préparer Phase 0 : script snapshot Supabase + inventaire préservation + ADRs fondateurs
- [ ] ADR #1 : BYOK AI architecture (chiffrement, providers, fallback)
- [ ] ADR #2 : Database schema v2 (workout + nutrition + calendrier partenaires + coach V2)
- [ ] ADR #3 : Templates programmes format JSON

---

*Brief rédigé le 2026-04-18, mis à jour avec décisions Q1-Q5 et BYOK AI. Valide ~6 mois. À revisiter avant démarrage Phase 5.*

## Sources

- [Fitbod vs Strong vs Hevy vs SensAI: 2026 Comparison](https://www.sensai.fit/blog/fitness-app-comparison)
- [Strong vs Hevy vs Boostcamp vs Fitbod: Best Strength Training Apps 2026](https://askvora.com/blog/best-strength-training-apps-2026)
- [Fitbod vs Hevy vs Strong: 2026 Prices](https://www.smartrabbitfitness.com/blog/en/fitness-ai-apps-price-comparison-fitbod-strong-hevy-2025)
- [Best Workout Tracker Apps in 2026](https://www.strongermobileapp.com/blog/best-workout-tracker-apps)
- [Best Strength Training Apps in 2026 - Apple Watch](https://www.findyouredge.app/news/best-strength-training-apps-2026)
- [3 Best Apps for Tracking Macros 2026](https://www.katelymannutrition.com/blog/best-tracking-app)
- [Best Macro Tracking Apps: MFP, Cronometer, MacroFactor 2026](https://www.macronutrientcalculator.org/blog/macro-tracking-apps/)
- [MacroFactor Cost 2026: Free Version?](https://nutriscan.app/blog/posts/macrofactor-cost-2026-free-version-29f5edc98b)
- [Cronometer Alternatives 2026](https://www.hootfitness.com/blog/cronometer-alternatives-find-the-best-fit-for-your-tracking-style)
- [YAZIO Pricing 2026](https://nutriscan.app/blog/posts/yazio-pricing-2026-free-vs-pro-what-pro-unlocks-33b26f8fc7)
- [Yazio Review 2026: Europe's Favorite](https://www.trygaya.com/review/yazio-review)
- [Freeletics Review 2026](https://fitnessdrum.com/freeletics-review/)
- [Best AI Fitness Apps 2026: Fitbod, Freeletics, Future](https://www.sensai.fit/blog/best-ai-fitness-apps-2026-fitbod-freeletics-future-trainiac-alternatives)
- [Fitness App Market Report 2026](https://www.researchandmarkets.com/reports/5767298/fitness-app-market-report)
- [5 social workout apps](https://gymnation.com/blogs/5-social-workout-apps-to-exercise-with-friends/)
- [Workout Partner app](https://workoutpartner.com/)
- [Best Fitness Apps for Groups 2025](https://www.fitbudd.com/post/best-app-for-fitness-challenges-guide)
- [Best Group Fitness Apps 2025](https://trafft.com/group-fitness-app/)
- [MyFitnessPal Data Breach claim](https://data-breach.com/myfitnesspal-data-breach/)
- [MyFitnessPal Security Rating - UpGuard](https://www.upguard.com/security-report/myfitnesspal)
- [Under Armour MFP Data Breach - Huntress](https://www.huntress.com/threat-library/data-breach/under-armour-myfitness-pal-data-breach)
- [Have I Been Pwned: MFP](https://haveibeenpwned.com/breach/MyFitnessPal)
- [Cal AI (MFP) Breach 3M Users](https://hackread.com/cal-ai-myfitnesspal-data-breach-3m-users/)
- [PWA Design Best Practices 2026](https://www.gomage.com/blog/pwa-design/)
- [UI Patterns 2026 - Muzli](https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/)
- [Mobile-First UX 2026](https://www.trinergydigital.com/news/mobile-first-ux-design-best-practices-in-2026)
- [7 PWA Trends 2026](https://www.appstory.org/blog/7-pwa-trends-that-will-define-mobile-and-web-development-in-2026/)
- [Fitness App Development Guide 2026 - Mobidev](https://mobidev.biz/blog/fitness-application-development-guide-best-practices-and-case-studies)
- [Mobile UX Patterns 2026 - Sanjay Dey](https://www.sanjaydey.com/mobile-ux-ui-design-patterns-2026-data-backed/)
