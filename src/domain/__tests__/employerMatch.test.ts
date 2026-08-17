import { describe, it, expect } from 'vitest';
import {
  computeEmployerMatch,
  resolveContributionDollars,
  resolveContributionPercent,
} from '../retirement/employerMatch';

describe('computeEmployerMatch', () => {
  it('matches the plan-doc worked example: 100% up to 3%, 50% up to 5%, employee at 6%', () => {
    const tiers = [
      { upToPercentOfBase: 3, matchRate: 1.0 },
      { upToPercentOfBase: 5, matchRate: 0.5 },
    ];
    expect(computeEmployerMatch(100_000, 6, tiers)).toBeCloseTo(4_000, 2);
  });

  it('caps at the employee contribution when it is below all tier thresholds', () => {
    const tiers = [
      { upToPercentOfBase: 3, matchRate: 1.0 },
      { upToPercentOfBase: 5, matchRate: 0.5 },
    ];
    expect(computeEmployerMatch(100_000, 2, tiers)).toBeCloseTo(2_000, 2);
  });

  it('returns 0 for no tiers', () => {
    expect(computeEmployerMatch(100_000, 6, [])).toBe(0);
  });
});

describe('resolveContributionDollars / resolveContributionPercent', () => {
  it('resolves dollar mode directly', () => {
    expect(resolveContributionDollars(100_000, { mode: 'dollar', value: 5_000 })).toBe(5_000);
    expect(resolveContributionPercent(100_000, { mode: 'dollar', value: 5_000 })).toBeCloseTo(5, 2);
  });

  it('resolves percent mode against base pay', () => {
    expect(resolveContributionDollars(100_000, { mode: 'percent', value: 6 })).toBeCloseTo(6_000, 2);
    expect(resolveContributionPercent(100_000, { mode: 'percent', value: 6 })).toBe(6);
  });
});
