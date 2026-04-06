# IronTrack

IronTrack is a fitness, strength training, nutrition, and coaching platform built with Next.js, Supabase, and Vercel.

Production: [iron-track-dusky.vercel.app](https://iron-track-dusky.vercel.app)

## Current Status

This repository is actively being hardened and redesigned in iterative PRs.

- security hardening baseline delivered in the `feature-security-hardening-phase1` line
- UX/UI overhaul roadmap tracked through GitHub Epic `#4`
- accessibility target upgraded to `WCAG 2.2 AA`
- current product priorities: mobile-first navigation, calendar/workouts UX, onboarding, admin mobile workflows, dark mode consistency, Belgian nutrition relevance

## Core Modules

| Module | Scope |
| --- | --- |
| Authentication | Supabase Auth, protected routes, onboarding flows |
| Exercises | Exercise library, creation/edit flows, cardio-specific metrics |
| Workouts | Workout planning, creation, editing, progression tracking |
| Calendar | Monthly planning, mobile list view, shared sessions |
| Nutrition | Food logging, Belgian-oriented search improvements, recipes |
| Training Partners | Shared planning and partner collaboration |
| Progress | Metrics, charts, exercise history |
| Support | User tickets and internal handling workflows |
| Admin | Users, logs, tickets, exports, platform operations |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 App Router |
| Language | TypeScript strict |
| UI | React, Tailwind CSS, shadcn/ui |
| Motion | Framer Motion |
| Data | Supabase PostgreSQL + RLS |
| Auth | Supabase Auth |
| Deployment | Vercel |
| Testing | Jest, Playwright, contrast checks |

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENAI_API_KEY=<openai-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

E2E authentication credentials are no longer hardcoded. Use dedicated local variables such as:

```env
E2E_ADMIN_EMAIL=<test-admin-email>
E2E_ADMIN_PASSWORD=<test-admin-password>
E2E_USER_EMAIL=<test-user-email>
E2E_USER_PASSWORD=<test-user-password>
```

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run test:contrast
npm run test:regression
```

## Delivery Process

The repository follows a traceable GitHub workflow:

- issues for each phase and delivery slice
- focused feature branches
- draft PRs for preview and review
- required validation before merge: typecheck, build, accessibility/contrast, preview deployment

Recommended branch naming:

- `main` for protected production history
- `develop` for integration when used
- `feature/<scope>`
- `hotfix/<scope>`

Commit convention:

- `feat(scope): description`
- `fix(scope): description`
- `refactor(scope): description`
- `docs(scope): description`
- `security(scope): description`

## Quality & Security Baseline

- strict server-side validation on protected flows
- role-aware admin protections
- hardened middleware and security headers
- contrast validation in CI
- ongoing migration from WCAG 2.1 checks to `WCAG 2.2 AA`
- ongoing OWASP-focused hardening for auth, rate limiting, and operational surfaces

## Documentation

Start here:

- [docs/README.md](./docs/README.md)
- [docs/INDEX.md](./docs/INDEX.md)
- [docs/AUDIT_UX_UI_WCAG22_MOBILE_FIRST_5_AVRIL_2026.md](./docs/AUDIT_UX_UI_WCAG22_MOBILE_FIRST_5_AVRIL_2026.md)
- [docs/GUIDE_ADMINISTRATION_SYSTEME.md](./docs/GUIDE_ADMINISTRATION_SYSTEME.md)
- [docs/SECURITE_IRONTRACK.md](./docs/SECURITE_IRONTRACK.md)

## Notes

- The roadmap is intentionally incremental to keep previews reviewable and the repo clean.
- Some admin and shell files may be under active local work; avoid mixing unrelated edits in the same PR.
