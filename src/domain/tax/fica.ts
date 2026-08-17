import {
  SS_WAGE_BASE_CAP,
  SS_RATE,
  MEDICARE_RATE,
  ADDL_MEDICARE_RATE,
  ADDL_MEDICARE_THRESHOLD_SINGLE,
} from './constants';

/** Social Security tax applies to gross wages up to the annual wage base cap. */
export function computeSocialSecurityTax(eligibleWages: number): number {
  return Math.min(eligibleWages, SS_WAGE_BASE_CAP) * SS_RATE;
}

/** Medicare tax has no cap, plus an additional 0.9% on wages over the single-filer threshold. */
export function computeMedicareTax(eligibleWages: number): number {
  const base = eligibleWages * MEDICARE_RATE;
  const additional = Math.max(0, eligibleWages - ADDL_MEDICARE_THRESHOLD_SINGLE) * ADDL_MEDICARE_RATE;
  return base + additional;
}

export interface FicaResult {
  socialSecurity: number;
  medicare: number;
  total: number;
}

/**
 * FICA (Social Security + Medicare) is computed on gross wages regardless of 401k
 * deferral type — traditional and Roth 401k contributions both remain subject to FICA.
 */
export function computeFICA(eligibleWages: number): FicaResult {
  const socialSecurity = computeSocialSecurityTax(eligibleWages);
  const medicare = computeMedicareTax(eligibleWages);
  return { socialSecurity, medicare, total: socialSecurity + medicare };
}
