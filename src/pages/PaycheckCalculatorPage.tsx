import { useEffect, useState } from 'react';
import { usePaycheckConfig } from '../hooks/usePaycheckConfig';
import { useUserProfile } from '../contexts/UserProfileContext';
import { computePaycheck } from '../domain/paycheck/computePaycheck';
import { TAX_YEAR } from '../domain/tax/constants';
import { getStateTaxEntry } from '../domain/tax/stateTaxData';
import { TierEditor } from '../components/forms/TierEditor';
import { Money } from '../components/Money';
import { PageHeader } from '../components/layout/PageHeader';
import type { ContributionInput, MatchTier, PaycheckConfig } from '../types/models';

const DEFAULT_CONFIG: PaycheckConfig = {
  pretaxBasePay: 0,
  signOnBonus: 0,
  relocation: 0,
  otherIncome: 0,
  employee401kTraditional: { mode: 'percent', value: 0 },
  employee401kRoth: { mode: 'percent', value: 0 },
  employerMatchTiers: [],
  taxYear: TAX_YEAR,
  updatedAt: 0,
};

function ContributionInputEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ContributionInput;
  onChange: (v: ContributionInput) => void;
}) {
  return (
    <label>
      {label}
      <div className="contribution-input">
        <input
          type="number"
          min={0}
          step={0.01}
          value={value.value}
          onChange={(e) => onChange({ ...value, value: Number(e.target.value) })}
        />
        <select
          value={value.mode}
          onChange={(e) => onChange({ ...value, mode: e.target.value as 'dollar' | 'percent' })}
        >
          <option value="percent">% of base pay</option>
          <option value="dollar">$ / year</option>
        </select>
      </div>
    </label>
  );
}

export function PaycheckCalculatorPage() {
  const { config, loading, save } = usePaycheckConfig();
  const { profile } = useUserProfile();
  const [form, setForm] = useState<PaycheckConfig>(DEFAULT_CONFIG);
  const [manualStateRate, setManualStateRate] = useState(0);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  if (loading) return <div className="page-loading">Loading…</div>;

  const stateEntry = profile ? getStateTaxEntry(profile.state) : { type: 'unsupported' as const };

  const result = computePaycheck({
    pretaxBasePay: form.pretaxBasePay,
    signOnBonus: form.signOnBonus,
    relocation: form.relocation,
    otherIncome: form.otherIncome,
    employee401kTraditional: form.employee401kTraditional,
    employee401kRoth: form.employee401kRoth,
    employerMatchTiers: form.employerMatchTiers,
    stateCode: profile?.state ?? '',
    manualStateEffectiveRate: manualStateRate,
  });

  function update<K extends keyof PaycheckConfig>(key: K, value: PaycheckConfig[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    await save({ ...form, taxYear: TAX_YEAR, updatedAt: Date.now() });
  }

  return (
    <div className="paycheck-page">
      <PageHeader
        title="Paycheck Calculator"
        description="Enter your gross pay and 401k setup to see FICA, federal, and state tax withholding, and what actually lands as net income."
      />

      <section>
        <h2>Income</h2>
        <label className="field-row">
          <span className="field-label">
            Pretax base pay
            <span className="field-unit">$/yr</span>
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.pretaxBasePay}
            onChange={(e) => update('pretaxBasePay', Number(e.target.value))}
          />
        </label>
        <label className="field-row">
          <span className="field-label">
            Sign-on bonus
            <span className="field-unit">$</span>
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.signOnBonus}
            onChange={(e) => update('signOnBonus', Number(e.target.value))}
          />
        </label>
        <label className="field-row">
          <span className="field-label">
            Relocation
            <span className="field-unit">$</span>
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.relocation}
            onChange={(e) => update('relocation', Number(e.target.value))}
          />
        </label>
        <label className="field-row">
          <span className="field-label">
            Other
            <span className="field-unit">$</span>
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.otherIncome}
            onChange={(e) => update('otherIncome', Number(e.target.value))}
          />
        </label>
      </section>

      <section>
        <h2>401k</h2>
        <ContributionInputEditor
          label="Your traditional (pretax) contribution"
          value={form.employee401kTraditional}
          onChange={(v) => update('employee401kTraditional', v)}
        />
        <ContributionInputEditor
          label="Your Roth contribution"
          value={form.employee401kRoth}
          onChange={(v) => update('employee401kRoth', v)}
        />
        <h3>Employer match tiers</h3>
        <TierEditor
          tiers={form.employerMatchTiers}
          onChange={(tiers: MatchTier[]) => update('employerMatchTiers', tiers)}
        />
      </section>

      {stateEntry.type === 'unsupported' && (
        <section>
          <h2>State tax (manual override)</h2>
          <p>
            We don't have bracket data for {profile?.state} yet. Enter an estimated effective
            state tax rate.
          </p>
          <label>
            Effective rate (%)
            <input
              type="number"
              min={0}
              max={100}
              value={manualStateRate * 100}
              onChange={(e) => setManualStateRate(Number(e.target.value) / 100)}
            />
          </label>
        </section>
      )}

      <section className="results">
        <h2>Pre-tax total (before federal/state tax)</h2>
        <p className="eyebrow-line">
          <Money value={result.federalTaxableIncome} />
        </p>

        <h2>Taxes</h2>
        <ul className="ledger-list">
          <li>
            <span>Social Security</span>
            <Money value={-result.socialSecurityTax} />
          </li>
          <li>
            <span>Medicare</span>
            <Money value={-result.medicareTax} />
          </li>
          <li>
            <span>Federal income tax</span>
            <Money value={-result.federalTax} />
          </li>
          <li>
            <span>State income tax</span>
            <Money value={-result.stateTax} />
          </li>
        </ul>

        <h2>401k</h2>
        <ul className="ledger-list">
          <li>
            <span>Your traditional contribution</span>
            <Money value={result.employee401kTraditional} />
          </li>
          <li>
            <span>Your Roth contribution</span>
            <Money value={result.employee401kRoth} />
          </li>
          <li>
            <span>Employer match</span>
            <Money value={result.employerMatch401k} />
          </li>
          <li>
            <span>Total 401k</span>
            <Money value={result.total401k} />
          </li>
        </ul>

        <h2>Total income</h2>
        <div className="stat-grid">
          <div className="stat-block">
            <span className="stat-label">Annual net</span>
            <Money className="stat-figure" value={result.netAnnual} />
          </div>
          <div className="stat-block">
            <span className="stat-label">Monthly net</span>
            <Money className="stat-figure" value={result.netMonthly} />
          </div>
        </div>
      </section>

      <button className="btn btn-primary" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
