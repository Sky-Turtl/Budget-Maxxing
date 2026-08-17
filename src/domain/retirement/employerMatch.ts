export interface MatchTier {
  /** Cumulative percent-of-base breakpoint this tier extends up to, e.g. 3 means "up to 3% of base". */
  upToPercentOfBase: number;
  /** Match rate applied to the slice of employee contribution % within this tier, e.g. 1.0 = 100%, 0.5 = 50%. */
  matchRate: number;
}

/**
 * Computes employer 401k match dollars given tiered, cumulative-percent breakpoints.
 *
 * Example: tiers = [{upToPercentOfBase: 3, matchRate: 1.0}, {upToPercentOfBase: 5, matchRate: 0.5}],
 * basePay = 100,000, employeeContributionPercentOfBase = 6:
 *   tier 1: min(6,3) - 0 = 3% matched at 100% -> $3,000
 *   tier 2: min(6,5) - 3 = 2% matched at 50%  -> $1,000
 *   remainder (6-5=1%) has no matching tier -> $0
 *   total match = $4,000
 */
export function computeEmployerMatch(
  basePay: number,
  employeeContributionPercentOfBase: number,
  tiers: MatchTier[]
): number {
  let matchDollars = 0;
  let previousUpTo = 0;
  for (const tier of tiers) {
    const sliceWidth = Math.max(
      0,
      Math.min(employeeContributionPercentOfBase, tier.upToPercentOfBase) - previousUpTo
    );
    matchDollars += (sliceWidth / 100) * basePay * tier.matchRate;
    previousUpTo = tier.upToPercentOfBase;
  }
  return matchDollars;
}

export interface ContributionInput {
  mode: 'dollar' | 'percent';
  value: number;
}

/** Resolves a dollar/percent employee contribution input to an annual $ amount. */
export function resolveContributionDollars(basePay: number, input: ContributionInput): number {
  return input.mode === 'dollar' ? input.value : (input.value / 100) * basePay;
}

/** Resolves a dollar/percent employee contribution input to a % of base pay (needed for match tiers). */
export function resolveContributionPercent(basePay: number, input: ContributionInput): number {
  if (basePay <= 0) return 0;
  return input.mode === 'percent' ? input.value : (input.value / basePay) * 100;
}
