# ✅ Plan d’action Claude Code – Correctifs Auth & Sécurité (IronTrack)

Thierry a constaté des régressions après la refonte des formulaires. Voici la liste claire, actionnable et testable des corrections à effectuer.

## 🎯 Objectif
Rendre l’authentification stable, cohérente et sécurisée, avec une UX unifiée et des contrôles d’accès alignés.

## 📌 Contexte rapide
- Deux flux de formulaires coexistent: `src/app/auth/page.tsx` vs `src/components/auth/EmailAuthForm.tsx` + `src/hooks/useInAppBrowserAuth.ts`.
- Vérification des rôles incohérente entre `profiles.role` et `user_roles`.
- Cookies SSR marqués `httpOnly: false` (à évaluer).
- Redirections auth doublées (middleware + effets client).
- Page reset password manquante alors qu’un redirect y pointe.

Docs utiles:
- `docs/CORRECTIONS_PAGES_AUTH_2025.md`
- `docs/GUIDE_PERMISSIONS_ROLES.md`

---

## 1) Unifier le formulaire d’authentification
Deux options (choisir A ou B – A recommandé):

- A. Remplacer le formulaire inline dans `src/app/auth/page.tsx` par l’utilisation du composant `EmailAuthForm`.
  - Avantages: logique sign in / sign up / forgot + validations cohérentes (via `useInAppBrowserAuth`), UX unifiée.
  - Action: importer `EmailAuthForm` et afficher ce composant, supprimer les champs/états dupliqués de la page.

- B. Si on conserve le formulaire inline, factoriser pour réutiliser les méthodes/validations de `useInAppBrowserAuth`.
  - Harmoniser les messages d’erreur et le min de mot de passe (≥ 8) avec `src/utils/security.ts`.

Critères d’acceptation:
- Un seul composant/formulaire d’auth visible côté UI.
- Validation et messages identiques entre modes login/signup/forgot.

Fichiers clés:
- `src/app/auth/page.tsx`
- `src/components/auth/EmailAuthForm.tsx`
- `src/hooks/useInAppBrowserAuth.ts`
- `src/utils/security.ts`

---

## 2) Créer la page de réinitialisation de mot de passe
Le flux forgot utilise `redirectTo: /auth/reset-password`, mais la page n’existe pas.

Action:
- Créer `src/app/auth/reset-password/page.tsx` (client component)
  - Récupérer le session hash Supabase (PKCE) depuis l’URL et permettre la saisie du nouveau mot de passe (et confirmation), puis `supabase.auth.updateUser({ password })`.
  - Afficher succès/erreurs, lien retour `/auth`.

Critères d’acceptation:
- Reset fonctionnel depuis l’email Supabase jusqu’à la mise à jour du mot de passe.

---

## 3) Aligner la vérification des rôles Admin
Incohérence actuelle:
- Middleware: vérifie `user_roles`
- Routes Admin: parfois `profiles.role`

Décision:
- Standardiser sur `profiles.role` (référence documentaire: `docs/GUIDE_PERMISSIONS_ROLES.md`).

Actions:
- Dans `src/middleware.ts`: remplacer le check `user_roles` par un `select profiles.role` pour l’utilisateur courant, puis valider contre `['moderator', 'admin', 'super_admin']` + vérifier ban/expiry si requis.
- Dans les routes Admin (`src/app/api/admin/**/route.ts`): s’assurer que la même source et la même liste de rôles sont utilisées partout.

Critères d’acceptation:
- Accès Admin cohérent (mêmes résultats via middleware et API).
- Logs d’erreurs homogènes.

Fichiers clés:
- `src/middleware.ts`
- `src/app/api/admin/*/route.ts`

---

## 4) Cookies SSR – Sécurité
Constat:
- `httpOnly: false` dans `src/utils/supabase/server.ts` et `src/utils/supabase/route-handler.ts`.

Action (à évaluer/valider via tests):
- Étudier le passage à `httpOnly: true` pour les cookies côté serveur, tout en gardant le flux PKCE côté client (`src/utils/supabase/client.ts`).
- Vérifier que l’auto-refresh et la persistance de session restent fonctionnels.

Critères d’acceptation:
- Aucune régression d’auth.
- Cookies plus stricts en prod (`secure: true`, `sameSite: 'lax'` ou mieux si compatible).

Fichiers clés:
- `src/utils/supabase/server.ts`
- `src/utils/supabase/route-handler.ts`

---

## 5) Redirections – éviter les doublons
Constat:
- `middleware.ts` gère déjà les routes protégées.
- Des effets client (ex: `src/app/page.tsx`) refont un `router.push('/auth')` → flicker.

Action:
- Supprimer les redirections client superflues quand le middleware couvre le cas.

Critères d’acceptation:
- Navigation fluide sans double redirection.

Fichier clé:
- `src/app/page.tsx` (et autres pages qui répliquent ce pattern)

---

## 6) OAuth + navigateurs in‑app
Actions:
- S’assurer que `InAppBrowserWarning` est affiché sur la page Auth (déjà intégré) et que les messages d’erreur OAuth (Google) sont compréhensibles.
- Vérifier les URLs de redirection dans Supabase (`supabase/config.toml` → `site_url`, `additional_redirect_urls`) pour dev/prod.

Critères d’acceptation:
- Connexion Google robuste y compris hors navigateurs in‑app.

Fichiers clés:
- `src/app/auth/page.tsx`
- `src/components/auth/InAppBrowserWarning.tsx`
- `supabase/config.toml`

---

## 7) Harmonisation des focus/inputs
Actions:
- Vérifier que tous les champs de formulaire “raw” utilisent les styles focus unifiés:
  - `focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500`
- Préférer les composants UI centralisés (`src/components/ui/form/Input.tsx`) quand possible.

Critères d’acceptation:
- Aspect focus cohérent, conforme à `docs/CORRECTIONS_PAGES_AUTH_2025.md`.

---

## 8) Tests E2E minimaux à ajouter
- Flow login (mauvais credentials → erreur lisible → bons credentials → accès OK).
- Flow signup (email déjà existant → message approprié ; nouveau compte → mail de confirmation).
- Flow forgot/reset (envoi email → reset page → nouveau mot de passe → login OK).
- Routes protégées (redirigé quand non connecté, OK quand connecté).
- Accès Admin selon rôle (user → 403 ; moderator/admin/super_admin → OK selon matrice).

Localisation:
- `tests/e2e/auth.spec.ts` (ou fichiers dédiés par flow)

---

## 🔎 Points à relire après corrections
- Messages d’erreur uniformes FR (pas d’anglais brut “Invalid login credentials”).
- Les mêmes rôles et mêmes listes utilisées partout (middleware + API).
- Aucune régression d’auto‑refresh Supabase (PKCE).

---

## ✅ Definition of Done
- Auth et rôles cohérents et testés.
- UX unifiée (un seul système de formulaire).
- Redirections sans flicker.
- Cookies sécurisés en prod (si validé par tests).

Merci Claude. Fais chauffer les octets, mais pas les utilisateurs 😉


