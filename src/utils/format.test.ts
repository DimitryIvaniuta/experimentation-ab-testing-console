import { expect, it } from 'vitest';
import { formatBasisPoints, toPercent } from './format';

it('formats basis points and conversion rates', () => {
  expect(formatBasisPoints(2500)).toBe('25.00%');
  expect(toPercent(0.125)).toBe('12.50%');
});
