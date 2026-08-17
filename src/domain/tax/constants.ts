// NOTE: these are 2024/2025-ish figures for illustrative/planning purposes.
// Federal and state tax constants change yearly (IRS/state DOR inflation adjustments) —
// verify against IRS.gov / each state's Department of Revenue before relying on this
// for real tax filing decisions.

export const TAX_YEAR = 2025;

export const SS_WAGE_BASE_CAP = 176_100;
export const SS_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDL_MEDICARE_RATE = 0.009;
export const ADDL_MEDICARE_THRESHOLD_SINGLE = 200_000;

export const FEDERAL_STANDARD_DEDUCTION_SINGLE = 15_000;

export interface TaxBracket {
  upTo: number; // upper bound of this bracket (Infinity for the top bracket)
  rate: number;
}

export const FEDERAL_BRACKETS_SINGLE: TaxBracket[] = [
  { upTo: 11_925, rate: 0.1 },
  { upTo: 48_475, rate: 0.12 },
  { upTo: 103_350, rate: 0.22 },
  { upTo: 197_300, rate: 0.24 },
  { upTo: 250_525, rate: 0.32 },
  { upTo: 626_350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];
