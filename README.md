# A/B Testing Platform Console

Production-grade React 19.2 + TypeScript frontend for the Spring WebFlux **Experimentation / A-B Testing Platform** backend.

## Stack decision

- React `19.2.6` and React DOM `19.2.6`.
- Vite `8.0.13` for fast local development and optimized production builds.
- TypeScript `6.0.3` with strict compiler settings.
- React Router `7.15.1` in declarative mode.
- Native `fetch` with a small typed API layer instead of Axios or heavy server-state dependencies.
- Playwright `1.60.0` for essential E2E coverage.
- Vitest `4.1.6` for fast unit tests.

## Implemented production improvements

- Cancellable dashboard requests to avoid stale response races.
- Request correlation ID header: `X-Request-Id`.
- Strict JSON response handling and response-size safety limit.
- Error boundary for UI recovery.
- Safe JSON parser blocks prototype-pollution keys such as `__proto__`, `prototype`, and `constructor`.
- Metadata sanitizer now redacts sensitive keys and obvious sensitive string values.
- Production URL policy rejects plain HTTP API targets except localhost.
- Baked admin token removed from production builds. Dev builds still use `local-admin-token` when no env override is supplied.
- Accessibility skip link for keyboard navigation.
- Additional unit tests for HTTP client, runtime config, JSON safety, and metadata privacy.
- CI uses `npm ci`, typecheck, build, unit tests, production audit, and Playwright.

## Features

- Banking-style layout with header, sidebar, footer, cards, status badges, and central workspace.
- Dashboard for backend health, seeded experiment lookup, assignment tester, production-readiness controls, and metrics summary.
- Experiment creation form with dynamic variants, duplicate-key validation, weight validation, and safe JSON parsing.
- Assignment tester for deterministic user-to-variant checks.
- Event tracking form with metadata redaction before sending.
- Metrics page with raw counters, summary view, exposure counts, total values, and conversion-rate bars.
- In-memory runtime settings for API base URL and admin token.
- Secure-by-default UI choices: no raw user ID persistence, no `dangerouslySetInnerHTML`, no localStorage for admin token, strict CSP template, request timeouts, and user-safe error rendering.

## Local run

Start backend first:

```bash
cd ../ab-testing-platform
docker compose up -d
gradle bootRun
```

Start frontend:

```bash
npm ci
npm run dev
```

Open:

```text
http://localhost:5173
```

By default Vite proxies `/api` and `/actuator` to `http://localhost:8080`.

## Build and tests

```bash
npm run typecheck
npm run build
npm run test
npm run audit:prod
npx playwright install chromium
npm run test:e2e
```

If a locked-down CI/sandbox cannot download Playwright browsers, configure an existing Chromium executable:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

## Environment

Copy `.env.example` to `.env.local` when needed:

```text
VITE_API_BASE_URL=https://api.example.com
VITE_DEFAULT_EXPERIMENT_KEY=checkout_button_color
VITE_DEFAULT_ADMIN_TOKEN=
VITE_REQUEST_TIMEOUT_MS=15000
```

Leave `VITE_API_BASE_URL` empty for same-origin requests or local Vite proxy mode. For production remote APIs, prefer same-origin reverse proxy/BFF or update CSP `connect-src` for the exact API origin.

## Backend endpoints used

- `GET /actuator/health`
- `GET /api/v1/experiments/{key}`
- `POST /api/v1/experiments`
- `GET /api/v1/flags/{experimentKey}/assignment` with `X-User-Id`
- `POST /api/v1/events`
- `GET /api/v1/metrics/{experimentKey}`
- `GET /api/v1/metrics/{experimentKey}/summary`

## Security notes

- The admin token exists only in React memory. Refreshing the page clears it.
- Assignment user IDs are sent only to the backend and never stored in browser storage.
- Metadata keys and values that look like PII or secrets are redacted before tracking submission.
- Error messages are rendered as text, never as HTML.
- Production Nginx config adds `nosniff`, `DENY` frame protection, no-referrer policy, restrictive permissions policy, and CSP.
- Run `npm audit --omit=dev` in CI before production releases.
