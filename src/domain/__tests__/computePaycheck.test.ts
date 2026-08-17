import { describe, it, expect } from 'vitest';
import { computePaycheck } from '../paycheck/computePaycheck';
import { computeFICA } from '../tax/fica';
import { computeFederalTax } from '../tax/federalTax';
import { computeStateTax } from '../tax/stateTax';

describe('computePaycheck', () => {
  const baseInput = {
    pretaxBasePay: 100_000,
    signOnBonus: 5_000,
    relocation: 0,
    otherIncome: 0,
    employee401kTraditional: { mode: 'percent' as const, value: 6 },
    employee401kRoth: { mode: 'dollar' as const, value: 0 },
    employerMatchTiers: [
      { upToPercentOfBase: 3, matchRate: 1.0 },
      { upToPercentOfBase: 5, matchRate: 0.5 },
    ],
    stateCode: 'TX',
  };

  it('computes gross as the sum of all income components', () => {
    const result = computePaycheck(baseInput);
    expect(result.grossAnnual).toBe(105_000);
  });

  it('reduces federal/state taxable income by traditional 401k only, not FICA wages', () => {
    const result = computePaycheck(baseInput);
    expect(result.ficaWages).toBe(105_000);
    expect(result.federalTaxableIncome).toBeCloseTo(105_000 - 6_000, 2);
    expect(result.stateTaxableIncome).toBeCloseTo(105_000 - 6_000, 2);
  });

  it('matches independently-computed FICA/federal/state tax amounts', () => {
    const result = computePaycheck(baseInput);
    const fica = computeFICA(105_000);
    expect(result.socialSecurityTax).toBeCloseTo(fica.socialSecurity, 2);
    expect(result.medicareTax).toBeCloseTo(fica.medicare, 2);
    expect(result.federalTax).toBeCloseTo(computeFederalTax(99_000), 2);
    expect(result.stateTax).toBeCloseTo(computeStateTax(99_000, 'TX'), 2);
  });

  it('computes employer match off combined traditional+roth contribution percent', () => {
    const result = computePaycheck(baseInput);
    // 6% contribution -> tier1 3%@100% + tier2 2%@50% = 3000+1000 = 4000
    expect(result.employerMatch401k).toBeCloseTo(4_000, 2);
    expect(result.total401k).toBeCloseTo(6_000 + 0 + 4_000, 2);
  });

  it('net annual is gross minus 401k employee contributions and all taxes', () => {
    const result = computePaycheck(baseInput);
    const expectedNet =
      105_000 - 6_000 - 0 - result.socialSecurityTax - result.medicareTax - result.federalTax - result.stateTax;
    expect(result.netAnnual).toBeCloseTo(expectedNet, 2);
    expect(result.netMonthly).toBeCloseTo(expectedNet / 12, 2);
  });
});
