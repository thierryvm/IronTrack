> 🔗 Pour la gestion des secrets, fichiers sensibles et hygiène git, voir aussi : `REGLES_SECURITE_CLAUDE.md`

# Guide Sécurité IronTrack (à lire avant toute modification)

## 1. Objectif
Ce document explique les bonnes pratiques de sécurité à respecter sur IronTrack, l’état actuel de la sécurité, les points à surveiller, et les pièges à éviter (notamment : ne pas casser la récupération de données utilisateurs !).

---

## 2. État actuel de la sécurité

### Authentification & Autorisation
- Auth Supabase (JWT) avec 4 rôles : `user`, `moderator`, `admin`, `super_admin`.
- Middleware Next.js qui :
  - Redirige les non-authentifiés vers `/auth` pour toutes les routes protégées.
  - Vérifie le rôle pour l’accès `/admin` (table `user_roles`).
- Utilitaire `authenticateRequest` pour sécuriser les routes API (vérifie le token Bearer).

### Sécurité Backend & Données
- Row Level Security (RLS) activé sur toutes les tables sensibles.
- Validation MIME stricte pour les uploads.
- Validation côté client ET serveur (XSS, SQLi).
- Séparation des clés API (jamais de service key côté client !).
- Session sécurisée (JWT refresh).
- Audit trail/logs admin.
- Monitoring/logs structurés.

### Bonnes pratiques
- Aucun secret/token dans le repo.
- Variables d’environnement non versionnées.
- Séparation dev/prod dans `.env.local`.

### Limites du plan gratuit
- **Pas de protection HaveIBeenPwned (HIBP) native** sur les mots de passe (possible côté client, voir plus bas).
- Pas de backup/restauration automatique avancée.

---

## 3. Points à surveiller / à ne PAS casser

### ⚠️ Récupération de données utilisateurs
- **Ne JAMAIS** ajouter une règle de sécurité (RLS, middleware, etc.) qui empêcherait un utilisateur authentifié de récupérer ses propres données (profil, performances, tickets, etc.).
- Toujours tester la récupération de données utilisateur standard après tout changement de sécurité.
- En cas de doute, demander validation humaine avant de merger.

### ⚠️ RLS et accès API
- Les politiques RLS doivent permettre :
  - À chaque utilisateur d’accéder à ses propres données.
  - Aux admins/modérateurs d’accéder aux données nécessaires à leur rôle.
- **Ne pas** restreindre l’accès de façon trop large (ex : `user_id = auth.uid()` sur toutes les tables sans exception).

### ⚠️ Scripts globaux/interdits
- Interdiction de lancer des scripts de correction ou de sécurité globale sans validation humaine.
- Toute modification de sécurité doit être testée sur un cas réel (utilisateur standard, admin, etc.).

---

## 4. Améliorations possibles (mais à faire avec précaution)

- Ajouter un rate limiting côté serveur/API (ex : limiter les tentatives de login, d’upload, etc.).
- Ajouter des headers HTTP de sécurité (CSP, X-Frame-Options, etc.) dans Next.js.
- Ajouter une vérification HIBP côté client pour les mots de passe (voir exemple dans `docs/supabase_password_security.md`).
- Ajouter des alertes sur logs d’accès refusé ou d’échec d’authentification répétés.

---

## 5. Checklist sécurité à respecter
- [x] Authentification JWT, gestion des rôles, middleware Next.js
- [x] RLS sur toutes les tables sensibles
- [x] Validation côté client ET serveur
- [x] Séparation des clés API, pas de secrets dans le repo
- [x] Monitoring, audit trail, logs
- [x] Validation MIME uploads, accès restreint par RLS
- [ ] Rate limiting côté serveur/API (à ajouter si possible)
- [ ] Headers HTTP sécurisés (à ajouter si possible)
- [ ] Vérification HIBP côté client (à ajouter si possible)

---

## 6. Inspirations et ressources
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security)

---

## 7. En cas de doute
- **Ne jamais merger une PR de sécurité sans validation humaine.**
- Toujours tester la récupération de données utilisateur après tout changement.
- Documenter chaque modification de sécurité dans ce fichier ou dans la PR.

---

**En respectant ces règles, tu éviteras de casser la prod ou de bloquer les utilisateurs !**