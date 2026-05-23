import { expect, it } from 'vitest';
import { sanitizeMetadata } from './metadataSanitizer';

it('redacts obvious PII and secret metadata keys recursively', () => {
  expect(sanitizeMetadata({ email: 'a@b.com', nested: { sessionToken: 'abc', plan: 'pro' } })).toEqual({
    email: '[REDACTED_BY_UI]',
    nested: { sessionToken: '[REDACTED_BY_UI]', plan: 'pro' }
  });
});

it('redacts obvious sensitive string values even when key is generic', () => {
  expect(sanitizeMetadata({ contact: 'person@example.com', raw: 'eyJabc.def.ghi' })).toEqual({
    contact: '[REDACTED_BY_UI]',
    raw: '[REDACTED_BY_UI]'
  });
});
