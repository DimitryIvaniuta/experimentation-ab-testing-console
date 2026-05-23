import type { JsonRecord, JsonValue } from '../types/api';

const REDACTED = '[REDACTED_BY_UI]';
const SENSITIVE_KEY_PATTERN = /(email|phone|ip|address|token|secret|cookie|session|password|userid|user_id|rawuser|jwt|authorization)/i;
const EMAIL_VALUE_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const JWT_VALUE_PATTERN = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const LONG_SECRET_VALUE_PATTERN = /^[A-Za-z0-9_\-.=+/]{32,}$/;

function sanitizeValue(value: JsonValue): JsonValue {
  if (typeof value === 'string') {
    if (EMAIL_VALUE_PATTERN.test(value) || JWT_VALUE_PATTERN.test(value) || LONG_SECRET_VALUE_PATTERN.test(value)) {
      return REDACTED;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === 'object' && value !== null) {
    return sanitizeMetadata(value);
  }
  return value;
}

/**
 * Defense-in-depth client-side metadata sanitizer.
 * Backend remains the source of truth, but the UI avoids sending obvious PII/secrets
 * by sensitive key names and obvious sensitive string value patterns.
 */
export function sanitizeMetadata(metadata: JsonRecord): JsonRecord {
  return Object.entries(metadata).reduce<JsonRecord>((acc, [key, value]) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      acc[key] = REDACTED;
      return acc;
    }
    acc[key] = sanitizeValue(value);
    return acc;
  }, {});
}
