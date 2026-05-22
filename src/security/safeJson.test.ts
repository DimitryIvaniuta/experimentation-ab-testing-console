import { describe, expect, it } from 'vitest';
import { parsePlainJsonObject } from './safeJson';

describe('parsePlainJsonObject', () => {
  it('accepts JSON objects', () => {
    expect(parsePlainJsonObject('{"a":1,"b":[true,null]}')).toEqual({ a: 1, b: [true, null] });
  });

  it('rejects arrays as root payload', () => {
    expect(() => parsePlainJsonObject('[1,2]')).toThrow(/plain object/);
  });

  it('rejects prototype pollution keys', () => {
    expect(() => parsePlainJsonObject('{"__proto__":{"polluted":true}}')).toThrow(/not allowed/);
    expect(() => parsePlainJsonObject('{"constructor":{"prototype":{"polluted":true}}}')).toThrow(/not allowed/);
  });

  it('rejects very large payloads before parsing', () => {
    expect(() => parsePlainJsonObject(`{"value":"${'x'.repeat(20_001)}"}`)).toThrow(/too large/);
  });
});
