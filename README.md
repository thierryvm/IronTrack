# IronTrack

Application de suivi de fitness et musculation moderne avec React et Next.js.

## 🚀 Fonctionnalités

- **Gestion d'exercices** : Créez et suivez vos exercices personnalisés
- **Suivi de performances** : Historique détaillé de vos progressions
- **Nutrition** : Suivi alimentaire et calculs nutritionnels
- **Calendrier** : Planification de vos séances d'entraînement
- **Partenaires d'entraînement** : Partagez vos programmes avec d'autres utilisateurs
- **Interface responsive** : Optimisée pour mobile et desktop
- **PWA** : Installation possible comme application native

## 🛠️ Stack Technique

- **Framework** : Next.js 15.3.5 avec App Router
- **Frontend** : React 18, TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Déploiement** : Vercel
- **Tests** : Jest + Playwright

## 🏗️ Installation

```bash
# Installation des dépendances
npm install

# Variables d'environnement
cp .env.example .env.local
# Configurez vos clés Supabase dans .env.local

# Démarrage du serveur de développement
npm run dev
```

## 📦 Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Vérification ESLint
npm run test     # Tests unitaires
npm run test:e2e # Tests end-to-end
```

## 🌐 Déploiement

L'application est automatiquement déployée sur Vercel lors des push sur la branche `main`.

## 🔧 Configuration

### Supabase

1. Créez un projet Supabase
2. Configurez les tables selon le schéma dans `/supabase/migrations/`
3. Ajoutez les variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Vercel

Variables d'environnement requises :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📱 PWA

L'application supporte l'installation Progressive Web App :
- Icônes adaptives pour tous les appareils
- Mode hors ligne partiel
- Notifications push (à venir)

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Validation des données avec Zod
- Sanitisation des entrées utilisateur
- Protection CSRF intégrée

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**IronTrack** - Votre compagnon fitness intelligent 💪