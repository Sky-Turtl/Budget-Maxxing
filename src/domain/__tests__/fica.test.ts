import { describe, it, expect } from 'vitest';
import { computeSocialSecurityTax, computeMedicareTax, computeFICA } from '../tax/fica';
import { SS_WAGE_BASE_CAP } from '../tax/constants';

describe('computeSocialSecurityTax', () => {
  it('applies 6.2% below the wage base cap', () => {
    expect(computeSocialSecurityTax(100_000)).toBeCloseTo(6_200, 2);
  });

  it('caps at the wage base', () => {
    expect(computeSocialSecurityTax(300_000)).toBeCloseTo(SS_WAGE_BASE_CAP * 0.062, 2);
  });
});

describe('computeMedicareTax', () => {
  it('applies 1.45% with no cap below the additional-medicare threshold', () => {
    expect(computeMedicareTax(100_000)).toBeCloseTo(1_450, 2);
  });

  it('adds 0.9% on wages over $200k for single filers', () => {
    // 220,000 * 0.0145 + (220,000-200,000) * 0.009
    expect(computeMedicareTax(220_000)).toBeCloseTo(220_000 * 0.0145 + 20_000 * 0.009, 2);
  });
});

describe('computeFICA', () => {
  it('sums SS + Medicare', () => {
    const result = computeFICA(220_000);
    expect(result.total).toBeCloseTo(result.socialSecurity + result.medicare, 6);
    expect(result.socialSecurity).toBeCloseTo(SS_WAGE_BASE_CAP * 0.062, 2);
  });
});
