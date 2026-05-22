import { describe, expect, it } from 'vitest';
import { maskSecret, normalizeApiBaseUrl } from './runtime';

describe('runtime configuration helpers', () => {
  it('normalizes API base URLs and drops query fragments', () => {
    expect(normalizeApiBaseUrl('https://api.example.com/root/?x=1#frag')).toBe('https://api.example.com/root');
  });

  it('rejects invalid URL values', () => {
    expect(() => normalizeApiBaseUrl('not a url')).toThrow(/absolute URL/);
  });

  it('masks secrets before display', () => {
    expect(maskSecret('local-admin-token')).toBe('loc••••ken');
    expect(maskSecret('')).toBe('not configured');
  });
});
