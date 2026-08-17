import { describe, it, expect } from 'vitest';
import { applyBrackets, computeFederalTax } from '../tax/federalTax';
import { FEDERAL_BRACKETS_SINGLE, FEDERAL_STANDARD_DEDUCTION_SINGLE } from '../tax/constants';

describe('applyBrackets', () => {
  it('returns 0 for non-positive income', () => {
    expect(applyBrackets(0, FEDERAL_BRACKETS_SINGLE)).toBe(0);
    expect(applyBrackets(-100, FEDERAL_BRACKETS_SINGLE)).toBe(0);
  });

  it('taxes only within the first bracket when income is low', () => {
    expect(applyBrackets(10_000, FEDERAL_BRACKETS_SINGLE)).toBeCloseTo(10_000 * 0.1, 2);
  });

  it('applies marginal rates across multiple brackets', () => {
    // 60,000 taxable: 10% up to 11,925 + 12% up to 48,475 + 22% on remainder up to 60,000
    const expected =
      11_925 * 0.1 + (48_475 - 11_925) * 0.12 + (60_000 - 48_475) * 0.22;
    expect(applyBrackets(60_000, FEDERAL_BRACKETS_SINGLE)).toBeCloseTo(expected, 2);
  });
});

describe('computeFederalTax', () => {
  it('subtracts the standard deduction before applying brackets', () => {
    const gross = FEDERAL_STANDARD_DEDUCTION_SINGLE + 10_000;
    expect(computeFederalTax(gross)).toBeCloseTo(10_000 * 0.1, 2);
  });

  it('returns 0 when income is below the standard deduction', () => {
    expect(computeFederalTax(5_000)).toBe(0);
  });
});
