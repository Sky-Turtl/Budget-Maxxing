export interface UserProfile {
  uid: string;
  email: string;
  filingStatus: 'single';
  state: string;
  fiscalYearStartMonth: number; // 1-12
  createdAt: number;
  updatedAt: number;
}

export interface ContributionInput {
  mode: 'dollar' | 'percent';
  value: number;
}

export interface MatchTier {
  upToPercentOfBase: number;
  matchRate: number;
}

export interface PaycheckConfig {
  pretaxBasePay: number;
  signOnBonus: number;
  relocation: number;
  otherIncome: number;
  employee401kTraditional: ContributionInput;
  employee401kRoth: ContributionInput;
  employerMatchTiers: MatchTier[];
  taxYear: number;
  updatedAt: number;
}

export interface PostTaxAllocations {
  otherPersonalContributions: number;
  setAsideSavings: number;
  rothIRA: number;
  gifts: number;
  debtPayments: number;
  updatedAt: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  monthlyBudget: number;
  color?: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDate: number; // 1-31
  categoryId: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Purchase {
  id: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  categoryId: string;
  location: string;
  notes?: string;
  createdAt: number;
}
