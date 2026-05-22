import type { JsonRecord, JsonValue } from '../types/api';

const MAX_JSON_CHARS = 20_000;
const MAX_DEPTH = 8;
const MAX_ARRAY_ITEMS = 100;
const MAX_OBJECT_KEYS = 100;
const BLOCKED_OBJECT_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function isPlainJsonObject(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateJsonValue(value: unknown, depth: number, path: string): asserts value is JsonValue {
  if (depth > MAX_DEPTH) {
    throw new Error(`JSON is too deeply nested near ${path}. Maximum depth is ${MAX_DEPTH}.`);
  }
  if (value === null) return;

  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'boolean') return;
  if (valueType === 'number') {
    if (!Number.isFinite(value)) throw new Error(`JSON number near ${path} must be finite.`);
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ITEMS) throw new Error(`JSON array near ${path} is too large.`);
    value.forEach((item, index) => validateJsonValue(item, depth + 1, `${path}[${index}]`));
    return;
  }
  if (isPlainJsonObject(value)) {
    const entries = Object.entries(value);
    if (entries.length > MAX_OBJECT_KEYS) throw new Error(`JSON object near ${path} has too many keys.`);
    for (const [key, nestedValue] of entries) {
      if (BLOCKED_OBJECT_KEYS.has(key)) {
        throw new Error(`JSON key "${key}" is not allowed.`);
      }
      validateJsonValue(nestedValue, depth + 1, `${path}.${key}`);
    }
    return;
  }

  throw new Error(`Unsupported JSON value near ${path}.`);
}

export function parsePlainJsonObject(raw: string): JsonRecord {
  if (raw.length > MAX_JSON_CHARS) {
    throw new Error(`JSON payload is too large. Maximum length is ${MAX_JSON_CHARS} characters.`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('JSON is invalid. Check quotes, commas, and brackets.');
  }

  if (!isPlainJsonObject(parsed)) {
    throw new Error('JSON must be a plain object containing only JSON values.');
  }

  validateJsonValue(parsed, 0, '$');
  return parsed;
}

export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
