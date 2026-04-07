# SEO, OpenGraph & GEO Guardrails

Updated: 7 April 2026
Scope: frontend discovery layer, social sharing, private route indexing boundaries

## Goal

Give IronTrack a stable discovery baseline that is:

- safe for public indexing
- explicit for private authenticated areas
- consistent for Open Graph / social previews
- reusable as a source-of-truth for future RAG workflows

## Route classification

### Public and indexable

These routes are intended for discovery, search and product sharing:

- `/`
- `/faq`
- `/support`
- `/pwa-guide`
- `/legal/privacy`
- `/legal/terms`

Expected rules:

- canonical URL present
- `index: true`
- `follow: true`
- Open Graph image present
- concise description aligned with real product value

### Public but not indexable

These routes can be reached publicly, but should not compete in search results:

- `/auth`
- `/auth/login`
- `/auth/reset-password`
- `/auth/auth-code-error`

Expected rules:

- canonical URL still present
- `index: false`
- `follow: false`
- Open Graph metadata can remain product-branded, but must not imply a public landing page

### Private authenticated areas

These routes must stay outside search indexing:

- `/onboarding`
- `/calendar`
- `/exercises`
- `/workouts`
- `/profile`
- `/nutrition`
- `/notifications`
- `/progress`
- `/training-partners`

Expected rules:

- canonical URL present for consistency
- `index: false`
- `follow: false`
- no search positioning work on private route copy

## Open Graph rules

Reference baseline:

- `og:title`, `og:type`, `og:image`, `og:url` are required by the Open Graph protocol
- `og:description`, `og:locale`, `og:site_name` are strongly recommended
- `og:image:alt` should be provided when an image is defined

Applied principles for IronTrack:

- primary product preview stays on the homepage
- one branded image source-of-truth is better than multiple inconsistent variants
- route metadata must describe the real route intent, not generic fitness buzzwords
- avoid misleading social previews on private routes

## GEO principles

For IronTrack, GEO is treated as "Generative Engine Optimization" and not only classic SEO.

That means:

- descriptions must remain factual and compact
- JSON-LD should describe the product without overclaiming unsupported features
- support and FAQ pages should remain answer-oriented and structurally clean
- the public copy should help both classic engines and answer engines understand the product quickly

## RAG usage

This document is intended to be consumed by future agents and internal retrieval flows.

Useful retrieval anchors:

- public discovery routes
- private noindex boundaries
- social metadata guardrails
- GEO wording principles

Recommended future extension:

- keep one table per route family with owner, issue number, validation date and screenshots

