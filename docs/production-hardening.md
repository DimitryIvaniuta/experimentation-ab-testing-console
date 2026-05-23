# Production hardening notes

## Implemented in this frontend

- Strict TypeScript configuration with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and `noImplicitOverride`.
- Small typed fetch client instead of heavy server-state dependencies.
- Request timeouts, request correlation IDs, strict JSON response checks, no-store cache mode, and redirect blocking.
- Cancellable dashboard requests to prevent stale responses after route/API target changes.
- Error boundary to avoid full white-screen failures.
- No raw user ID persistence in browser storage.
- No admin token persistence in localStorage/sessionStorage.
- Production API base URL validation: HTTPS is required except localhost.
- Safe JSON parser rejects oversized payloads, excessive nesting, arrays as root payloads, and prototype-pollution keys.
- Metadata sanitizer redacts obvious PII/secrets by key and by suspicious value pattern before event submission.
- CSP, referrer policy, frame protection, nosniff, and permissions policy in static HTML/Nginx.
- Playwright E2E tests for dashboard, assignment, event tracking, and metrics flows.

## Recommended real production additions

- Replace demo `X-Admin-Token` with OIDC/OAuth2 Authorization Code + PKCE.
- Keep APIs same-origin behind an API gateway or BFF to simplify CSP and avoid browser CORS drift.
- Serve deployment-specific CSP headers from Nginx or gateway rather than editing `index.html` per environment.
- Add SSO role mapping for experiment owners, release managers, and read-only analysts.
- Add real observability: frontend error reporting, Web Vitals, and audit logs for admin actions.
- Add visual regression tests before broad UI changes.
