import { computeFICA } from '../tax/fica';
import { computeFederalTax } from '../tax/federalTax';
import { computeStateTax } from '../tax/stateTax';
import {
  computeEmployerMatch,
  resolveContributionDollars,
  resolveContributionPercent,
  type ContributionInput,
  type MatchTier,
} from '../retirement/employerMatch';

export interface PaycheckInput {
  pretaxBasePay: number;
  signOnBonus: number;
  relocation: number;
  otherIncome: number;
  employee401kTraditional: ContributionInput;
  employee401kRoth: ContributionInput;
  employerMatchTiers: MatchTier[];
  stateCode: string;
  manualStateEffectiveRate?: number;
}

export interface PaycheckResult {
  grossAnnual: number;
  employee401kTraditional: number;
  employee401kRoth: number;
  employerMatch401k: number;
  total401k: number;
  ficaWages: number;
  socialSecurityTax: number;
  medicareTax: number;
  federalTaxableIncome: number;
  federalTax: number;
  stateTaxableIncome: number;
  stateTax: number;
  netAnnual: number;
  netMonthly: number;
}

/**
 * Orchestrates gross income -> FICA -> 401k (traditional + Roth, tiered employer match)
 * -> federal/state tax -> net income.
 *
 * Key rules:
 * - FICA (Social Security + Medicare) applies to full gross wages regardless of 401k type.
 * - Only the EMPLOYEE's traditional 401k contribution reduces federal/state taxable income.
 *   Roth contributions and employer match are never pretax-deductible from current income.
 * - Employer match is computed off the employee's contribution % of base pay (traditional + Roth combined),
 *   matching how most real-world plans define "match" — it doesn't distinguish contribution type.
 */
export function computePaycheck(input: PaycheckInput): PaycheckResult {
  const grossAnnual =
    input.pretaxBasePay + input.signOnBonus + input.relocation + input.otherIncome;

  const employee401kTraditional = resolveContributionDollars(
    input.pretaxBasePay,
    input.employee401kTraditional
  );
  const employee401kRoth = resolveContributionDollars(input.pretaxBasePay, input.employee401kRoth);

  const employeeContributionPercentOfBase =
    resolveContributionPercent(input.pretaxBasePay, input.employee401kTraditional) +
    resolveContributionPercent(input.pretaxBasePay, input.employee401kRoth);

  const employerMatch401k = computeEmployerMatch(
    input.pretaxBasePay,
    employeeContributionPercentOfBase,
    input.employerMatchTiers
  );

  const total401k = employee401kTraditional + employee401kRoth + employerMatch401k;

  const ficaWages = grossAnnual;
  const { socialSecurity: socialSecurityTax, medicare: medicareTax } = computeFICA(ficaWages);

  const federalTaxableIncome = grossAnnual - employee401kTraditional;
  const federalTax = computeFederalTax(federalTaxableIncome);

  const stateTaxableIncome = grossAnnual - employee401kTraditional;
  const stateTax = computeStateTax(
    stateTaxableIncome,
    input.stateCode,
    input.manualStateEffectiveRate ?? 0
  );

  const netAnnual =
    grossAnnual -
    employee401kTraditional -
    employee401kRoth -
    socialSecurityTax -
    medicareTax -
    federalTax -
    stateTax;

  return {
    grossAnnual,
    employee401kTraditional,
    employee401kRoth,
    employerMatch401k,
    total401k,
    ficaWages,
    socialSecurityTax,
    medicareTax,
    federalTaxableIncome,
    federalTax,
    stateTaxableIncome,
    stateTax,
    netAnnual,
    netMonthly: netAnnual / 12,
  };
}
