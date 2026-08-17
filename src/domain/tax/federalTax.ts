import { FEDERAL_BRACKETS_SINGLE, FEDERAL_STANDARD_DEDUCTION_SINGLE, type TaxBracket } from './constants';

/** Applies a marginal-bracket schedule to already-deduction-reduced taxable income. */
export function applyBrackets(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let lowerBound = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= lowerBound) break;
    const amountInBracket = Math.min(taxableIncome, bracket.upTo) - lowerBound;
    tax += amountInBracket * bracket.rate;
    lowerBound = bracket.upTo;
  }
  return tax;
}

/**
 * Computes federal income tax for a single filer.
 * @param grossTaxableWages wages after pretax (traditional 401k) deferrals, before standard deduction
 */
export function computeFederalTax(
  grossTaxableWages: number,
  standardDeduction: number = FEDERAL_STANDARD_DEDUCTION_SINGLE,
  brackets: TaxBracket[] = FEDERAL_BRACKETS_SINGLE
): number {
  const taxableIncome = Math.max(0, grossTaxableWages - standardDeduction);
  return applyBrackets(taxableIncome, brackets);
}
