import { applyBrackets } from './federalTax';
import { getStateTaxEntry } from './stateTaxData';

/**
 * Computes state income tax for a single filer.
 * @param grossTaxableWages wages after pretax (traditional 401k) deferrals, before state standard deduction
 * @param manualEffectiveRate used only when the state is "unsupported" in stateTaxData —
 *   caller/UI should prompt for a manual override rate in that case.
 */
export function computeStateTax(
  grossTaxableWages: number,
  stateCode: string,
  manualEffectiveRate = 0
): number {
  const entry = getStateTaxEntry(stateCode);
  switch (entry.type) {
    case 'none':
      return 0;
    case 'flat':
      return Math.max(0, grossTaxableWages) * entry.rate;
    case 'progressive': {
      const taxableIncome = Math.max(0, grossTaxableWages - entry.standardDeduction);
      return applyBrackets(taxableIncome, entry.brackets);
    }
    case 'unsupported':
      return Math.max(0, grossTaxableWages) * manualEffectiveRate;
  }
}
