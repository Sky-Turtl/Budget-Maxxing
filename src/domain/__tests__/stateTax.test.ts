import { describe, it, expect } from 'vitest';
import { computeStateTax } from '../tax/stateTax';

describe('computeStateTax', () => {
  it('returns 0 for no-income-tax states', () => {
    expect(computeStateTax(100_000, 'TX')).toBe(0);
    expect(computeStateTax(100_000, 'WA')).toBe(0);
  });

  it('applies a flat rate for flat-tax states', () => {
    expect(computeStateTax(100_000, 'PA')).toBeCloseTo(100_000 * 0.0307, 2);
  });

  it('applies progressive brackets minus standard deduction for progressive states', () => {
    const tax = computeStateTax(50_000, 'VA');
    // taxable = 50,000 - 8,500 = 41,500 -> 3000@2% + 2000@3% + 17000@5% + (41500-22000)@5.75%
    const taxable = 41_500;
    const expected = 3_000 * 0.02 + 2_000 * 0.03 + 12_000 * 0.05 + (taxable - 17_000) * 0.0575;
    expect(tax).toBeCloseTo(expected, 2);
  });

  it('applies a manual override rate for unsupported states', () => {
    expect(computeStateTax(100_000, 'ZZ', 0.05)).toBeCloseTo(5_000, 2);
    expect(computeStateTax(100_000, 'ZZ')).toBe(0);
  });
});
