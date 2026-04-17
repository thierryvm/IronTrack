# IronTrack v2

**Train heavier, live lighter.** — Une app fitness éditoriale, précise, brutaliste. Belgique 🇧🇪.

Production : [iron-track-dusky.vercel.app](https://iron-track-dusky.vercel.app)

---

## Stack

| Couche | Techno |
|---|---|
| Framework | Next.js **16** (App Router, Turbopack) |
| UI | React 19 · Tailwind CSS **v4** (@theme CSS-first) · shadcn/ui new-york |
| Typo | Fraunces (display) · Manrope (body) · JetBrains Mono (data) |
| i18n | next-intl v3 — **FR** (défaut) / NL / EN |
| Backend | Supabase (Postgres + RLS + Auth SSR + Realtime + Storage) |
| Déploiement | Vercel (Fluid Compute, Node 22 LTS) |
| IA | Vercel AI SDK + AI Gateway (Gemini 2.0 Flash — free tier) |
| Observability | Sentry + Vercel Analytics |
| Tests | Playwright + Vitest (à venir) |

**Budget : 0 €** — chaque dépendance utilisée a un free tier durable.

---

## Roadmap v2 (13 PRs)

| # | Livrable | Status |
|---|---|---|
| 37 | Phase 1 — scaffold Next 16 + design system | ✅ mergé |
| **38** | **Phase 2a — `[locale]` routing + CI + agents + SEO/GEO baseline** | 🚧 en cours |
| 39 | Auth (login/signup/reset + OAuth Google + onboarding) | pending |
| 40 | Exercises (CRUD + Wizard + duplicate detection) | pending |
| 41 | Workouts (liste + détail + calendar) | pending |
| 42 | **Session live** ⭐ — écran signature | pending |
| 43 | Progress / stats / personal records | pending |
| 44 | Nutrition MVP (Open Food Facts + macros) | pending |
| 45 | Nutrition + recipes + barcode PWA | pending |
| 46 | Training partners + realtime | pending |
| 47 | Profile + settings | pending |
| 48 | **Admin panel** 🛡️ (santé + tickets bidir + notifs + exports) | pending |
| 49 | Gamification + notifications | pending |
| 50 | AI coach + PWA Serwist + cleanup src-legacy | pending |

---

## Qualité (gates à chaque PR)

- **Lighthouse ≥ 95** par catégorie (Performance / A11y / BP / SEO)
- **WCAG 2.2 AA** sur tout élément interactif
- **TypeScript strict** + `noUncheckedIndexedAccess`
- **CI GitHub Actions** : lint · typecheck · build · audit deps
- **Design review** obligatoire (agent `ui-ux`)
- **Security review** sur PR touchant auth / RLS / API (`cybersecurity-2026`)
- **SEO/GEO review** (agent `seo-geo-2026`) — llms.txt, JSON-LD, hreflang
- **Tests** sur features critiques (auth, session live, admin)

---

## Scripts

```bash
npm run dev         # Dev (port 3000, Turbopack)
npm run build       # Build production
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run format      # Prettier
npm run db:types    # Regen types Supabase
npm run db:push     # Push migrations
```

---

## Variables d'environnement

Voir `.env.example`. Requises :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
# Ajoutées au fil des PRs : SENTRY_DSN, UPSTASH_REDIS_*, AI_GATEWAY_API_KEY
```

---

## Structure

```
src/
├── app/
│   ├── [locale]/          # Toutes les pages localisées
│   ├── globals.css        # Design tokens Tailwind v4 @theme
│   ├── icon.svg           # Logo monogramme I
│   ├── sitemap.ts         # Sitemap multilingue avec hreflang
│   └── robots.ts          # Robots + whitelist crawlers IA
├── components/
│   ├── ui/                # shadcn primitives
│   └── lang-switcher.tsx  # FR / NL / EN
├── i18n/
│   ├── request.ts
│   └── messages/{fr,nl,en}.json
├── lib/supabase/          # Clients typés <Database>
└── middleware.ts          # Routing i18n + session

.claude/agents/            # Agents spécialisés (orchestrator, ui-ux,
                           # security, seo-geo-2026, supabase-expert,
                           # observability, nutrition-data, i18n-translator,
                           # rate-limiting, code-review, performance,
                           # accessibility, testing, devops, architecture)

src-legacy/                # Ancienne version — référence migration (à retirer en PR #50)
```

---

## Principes

- Zéro dépendance runtime payante
- Tutoiement partout (ton d'atelier, pas corporate)
- Système métrique uniquement (user belge)
- Dark mode via variables CSS (pas de `dark:bg-*` éparpillé)
- RLS activé sur **toutes** les tables exposées
- Pas de `console.log` en prod

---

🇧🇪 Made in Belgium · MIT
