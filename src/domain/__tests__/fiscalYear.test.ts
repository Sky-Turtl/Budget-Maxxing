import { describe, it, expect } from 'vitest';
import { getFiscalMonthIndex, getFiscalYearBounds, getElapsedFiscalMonths } from '../spending/fiscalYear';

describe('getFiscalMonthIndex', () => {
  it('is 0 for the fiscal start month itself', () => {
    expect(getFiscalMonthIndex(new Date(2025, 3, 15), 4)).toBe(0); // April, FY starts April
  });

  it('wraps around the calendar year', () => {
    expect(getFiscalMonthIndex(new Date(2025, 1, 15), 4)).toBe(10); // Feb, FY starts April -> index 10
  });
});

describe('getElapsedFiscalMonths', () => {
  it('counts the current month as elapsed', () => {
    expect(getElapsedFiscalMonths(new Date(2025, 3, 1), 4)).toBe(1);
    expect(getElapsedFiscalMonths(new Date(2025, 4, 1), 4)).toBe(2);
  });
});

describe('getFiscalYearBounds', () => {
  it('computes correct start/end when reference date is after fiscal start month', () => {
    const { start, end } = getFiscalYearBounds(new Date(2025, 5, 1), 4); // June, FY starts April
    expect(start).toEqual(new Date(2025, 3, 1));
    expect(end).toEqual(new Date(2026, 3, 1));
  });

  it('computes correct start/end when reference date is before fiscal start month', () => {
    const { start, end } = getFiscalYearBounds(new Date(2025, 1, 1), 4); // Feb, FY starts April
    expect(start).toEqual(new Date(2024, 3, 1));
    expect(end).toEqual(new Date(2025, 3, 1));
  });
});
