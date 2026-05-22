export const DEFAULT_EXPERIMENT_KEY = import.meta.env.VITE_DEFAULT_EXPERIMENT_KEY?.trim() || 'checkout_button_color';
export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '';
export const DEFAULT_ADMIN_TOKEN = import.meta.env.VITE_DEFAULT_ADMIN_TOKEN?.trim() || (import.meta.env.DEV ? 'local-admin-token' : '');
export const DEFAULT_REQUEST_TIMEOUT_MS = parsePositiveInteger(import.meta.env.VITE_REQUEST_TIMEOUT_MS, 15_000, 1_000, 60_000);

function parsePositiveInteger(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (!raw?.trim()) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

function isLocalHttpUrl(url: URL): boolean {
  return url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
}

/**
 * Normalizes and validates backend API base URLs entered in the settings page.
 * Production builds reject plain HTTP except localhost, so operators do not accidentally
 * send admin tokens or user IDs over an unencrypted network.
 */
export function normalizeApiBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('API base URL must be a valid absolute URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('API base URL must use http or https.');
  }
  if (import.meta.env.PROD && parsed.protocol !== 'https:' && !isLocalHttpUrl(parsed)) {
    throw new Error('Production API base URL must use HTTPS, except localhost development targets.');
  }

  parsed.pathname = parsed.pathname.replace(/\/$/, '');
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return 'not configured';
  if (trimmed.length <= 8) return '••••';
  return `${trimmed.slice(0, 3)}••••${trimmed.slice(-3)}`;
}
