import { DEFAULT_REQUEST_TIMEOUT_MS } from '../config/runtime';
import type { ProblemDetails } from '../types/api';

const MAX_RESPONSE_BYTES = 1_000_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly problem?: ProblemDetails,
    readonly requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions<TBody> {
  method?: 'GET' | 'POST';
  body?: TBody;
  adminToken?: string;
  userId?: string;
  signal?: AbortSignal | undefined;
  timeoutMs?: number | undefined;
}

export function buildUrl(apiBaseUrl: string, path: string): string {
  const base = apiBaseUrl || window.location.origin;
  return new URL(path, base.endsWith('/') ? base : `${base}/`).toString();
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `ui-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readJsonBody<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text.trim()) return undefined;
  if (text.length > MAX_RESPONSE_BYTES) {
    throw new ApiError('Backend response is too large for the console safety limit.', response.status);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError('Backend returned invalid JSON.', response.status);
  }
}

async function readProblem(response: Response): Promise<ProblemDetails | undefined> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined;
  }

  try {
    return await readJsonBody<ProblemDetails>(response);
  } catch {
    return undefined;
  }
}

function apiErrorMessage(status: number, problem?: ProblemDetails): string {
  return problem?.detail || problem?.message || problem?.error || problem?.title || `Request failed with HTTP ${status}`;
}

function linkAbortSignals(source: AbortSignal | undefined, target: AbortController): void {
  if (!source) return;
  if (source.aborted) {
    target.abort();
    return;
  }
  source.addEventListener('abort', () => target.abort(), { once: true });
}

/**
 * Small typed fetch wrapper.
 * Adds timeouts, request correlation IDs, strict JSON reads, no-store cache behavior,
 * and safe plain-text error messages.
 */
export async function requestJson<TResponse, TBody = unknown>(
  apiBaseUrl: string,
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const controller = new AbortController();
  const requestId = createRequestId();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS);
  linkAbortSignals(options.signal, controller);

  const headers = new Headers({
    Accept: 'application/json',
    'X-Request-Id': requestId,
    'X-Client-Name': 'ab-testing-platform-console'
  });
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.adminToken?.trim()) {
    headers.set('X-Admin-Token', options.adminToken.trim());
  }
  if (options.userId?.trim()) {
    headers.set('X-User-Id', options.userId.trim());
  }

  try {
    const init: RequestInit = {
      method: options.method ?? 'GET',
      headers,
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error'
    };
    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }

    const response = await fetch(buildUrl(apiBaseUrl, path), init);

    if (!response.ok) {
      const problem = await readProblem(response);
      throw new ApiError(apiErrorMessage(response.status, problem), response.status, problem, requestId);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new ApiError('Backend returned a non-JSON response.', response.status, undefined, requestId);
    }

    const data = await readJsonBody<TResponse>(response);
    return data as TResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out or was cancelled. Check backend availability and CORS/proxy configuration.', 0, undefined, requestId);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
