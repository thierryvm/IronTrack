# Lighthouse Guardrails

Last validated: 7 April 2026

## Purpose

This project includes a production Lighthouse guardrail script to protect the public discovery flows that matter most for acquisition, sharing, and trust:

- `/auth`
- `/support`
- `/faq`

The script builds the production bundle, starts a local production server, runs Lighthouse in mobile mode, and writes JSON reports to `.tmp-lighthouse/`.

## Commands

```bash
npm run perf:lighthouse
```

Optional strict mode for aspirational perfect scores on every enabled category:

```bash
LIGHTHOUSE_STRICT_PERFECT=1 npm run perf:lighthouse
```

## Current thresholds

Default mode is intentionally honest and stable:

- `/auth`
  - performance: 90
  - accessibility: 100
  - best-practices: 100
- `/support`
  - performance: 95
  - accessibility: 100
  - best-practices: 100
  - seo: 100
- `/faq`
  - performance: 95
  - accessibility: 100
  - best-practices: 100
  - seo: 100

`/auth` does not enforce SEO because it is intentionally `noindex`.

## Validated scores

Validated locally on 7 April 2026:

| Page | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| `/auth` | 95 | 100 | 100 | n/a |
| `/support` | 96 | 100 | 100 | 100 |
| `/faq` | 96 | 100 | 100 | 100 |

## Notes

- The script is mobile-first because mobile is the strictest Lighthouse profile for this app.
- A Windows-specific Chrome temp cleanup `EPERM` can happen after the audit. The runner now treats that as a non-blocking cleanup warning instead of a false failure.
- `LIGHTHOUSE_STRICT_PERFECT=1` is available when we want to push toward 100 on every enabled category without breaking the baseline guardrail in day-to-day work.
