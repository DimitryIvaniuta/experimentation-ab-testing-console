import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, buildUrl, requestJson } from './http';

describe('http client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds same-origin URLs when base URL is empty', () => {
    expect(buildUrl('', '/api/test')).toBe('http://localhost:3000/api/test');
  });

  it('sends request correlation headers', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', {
      status: 200,
      headers: { 'content-type': 'application/json' }
    }));

    await expect(requestJson<{ ok: boolean }>('', '/api/test')).resolves.toEqual({ ok: true });
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get('X-Request-Id')).toBeTruthy();
    expect(headers.get('X-Client-Name')).toBe('ab-testing-platform-console');
  });

  it('rejects non-json success responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('html', {
      status: 200,
      headers: { 'content-type': 'text/html' }
    }));

    await expect(requestJson('', '/api/test')).rejects.toBeInstanceOf(ApiError);
  });
});
