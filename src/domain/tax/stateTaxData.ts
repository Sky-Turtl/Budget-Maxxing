import type { TaxBracket } from './constants';

// v1 scope: no-income-tax states + top-population taxed states get real (approximate,
// needs-yearly-verification) bracket data. Remaining states are marked "unsupported" and
// the UI should offer a manual effective-rate override for them.
export type StateTaxEntry =
  | { type: 'none' }
  | { type: 'flat'; rate: number }
  | { type: 'progressive'; brackets: TaxBracket[]; standardDeduction: number }
  | { type: 'unsupported' };

const NO_TAX_STATES = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'] as const;

export const STATE_TAX_DATA: Record<string, StateTaxEntry> = {
  ...Object.fromEntries(NO_TAX_STATES.map((code) => [code, { type: 'none' as const }])),

  CA: {
    type: 'progressive',
    standardDeduction: 5_363,
    brackets: [
      { upTo: 10_412, rate: 0.01 },
      { upTo: 24_684, rate: 0.02 },
      { upTo: 38_959, rate: 0.04 },
      { upTo: 54_081, rate: 0.06 },
      { upTo: 68_350, rate: 0.08 },
      { upTo: 349_137, rate: 0.093 },
      { upTo: 418_961, rate: 0.103 },
      { upTo: 698_271, rate: 0.113 },
      { upTo: Infinity, rate: 0.123 },
    ],
  },
  NY: {
    type: 'progressive',
    standardDeduction: 8_000,
    brackets: [
      { upTo: 8_500, rate: 0.04 },
      { upTo: 11_700, rate: 0.045 },
      { upTo: 13_900, rate: 0.0525 },
      { upTo: 80_650, rate: 0.055 },
      { upTo: 215_400, rate: 0.06 },
      { upTo: 1_077_550, rate: 0.0685 },
      { upTo: 5_000_000, rate: 0.0965 },
      { upTo: 25_000_000, rate: 0.103 },
      { upTo: Infinity, rate: 0.109 },
    ],
  },
  PA: { type: 'flat', rate: 0.0307 },
  IL: { type: 'flat', rate: 0.0495 },
  OH: {
    type: 'progressive',
    standardDeduction: 0,
    brackets: [
      { upTo: 26_050, rate: 0 },
      { upTo: 100_000, rate: 0.0275 },
      { upTo: Infinity, rate: 0.035 },
    ],
  },
  GA: { type: 'flat', rate: 0.0539 },
  NC: { type: 'flat', rate: 0.045 },
  MI: { type: 'flat', rate: 0.0425 },
  NJ: {
    type: 'progressive',
    standardDeduction: 0,
    brackets: [
      { upTo: 20_000, rate: 0.014 },
      { upTo: 35_000, rate: 0.0175 },
      { upTo: 40_000, rate: 0.035 },
      { upTo: 75_000, rate: 0.05525 },
      { upTo: 500_000, rate: 0.0637 },
      { upTo: 1_000_000, rate: 0.0897 },
      { upTo: Infinity, rate: 0.1075 },
    ],
  },
  VA: {
    type: 'progressive',
    standardDeduction: 8_500,
    brackets: [
      { upTo: 3_000, rate: 0.02 },
      { upTo: 5_000, rate: 0.03 },
      { upTo: 17_000, rate: 0.05 },
      { upTo: Infinity, rate: 0.0575 },
    ],
  },
  AZ: { type: 'flat', rate: 0.025 },
  MA: {
    type: 'progressive',
    standardDeduction: 0,
    brackets: [
      { upTo: 1_000_000, rate: 0.05 },
      { upTo: Infinity, rate: 0.09 },
    ],
  },
  IN: { type: 'flat', rate: 0.0305 },
  CO: { type: 'flat', rate: 0.044 },
};

export function getStateTaxEntry(stateCode: string): StateTaxEntry {
  return STATE_TAX_DATA[stateCode] ?? { type: 'unsupported' };
}
