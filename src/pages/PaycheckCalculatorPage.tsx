import { useEffect, useState } from 'react';
import { usePaycheckConfig } from '../hooks/usePaycheckConfig';
import { useUserProfile } from '../contexts/UserProfileContext';
import { computePaycheck } from '../domain/paycheck/computePaycheck';
import { TAX_YEAR } from '../domain/tax/constants';
import { getStateTaxEntry } from '../domain/tax/stateTaxData';
import { TierEditor } from '../components/forms/TierEditor';
import { formatMoney } from '../utils/money';
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
      <h1>Paycheck Calculator</h1>

      <section>
        <h2>Income</h2>
        <label>
          Pretax base pay ($/yr)
          <input
            type="number"
            min={0}
            value={form.pretaxBasePay}
            onChange={(e) => update('pretaxBasePay', Number(e.target.value))}
          />
        </label>
        <label>
          Sign-on bonus ($)
          <input
            type="number"
            min={0}
            value={form.signOnBonus}
            onChange={(e) => update('signOnBonus', Number(e.target.value))}
          />
        </label>
        <label>
          Relocation ($)
          <input
            type="number"
            min={0}
            value={form.relocation}
            onChange={(e) => update('relocation', Number(e.target.value))}
          />
        </label>
        <label>
          Other ($)
          <input
            type="number"
            min={0}
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
        <p>{formatMoney(result.federalTaxableIncome)}</p>

        <h2>Taxes</h2>
        <ul>
          <li>Social Security: {formatMoney(result.socialSecurityTax)}</li>
          <li>Medicare: {formatMoney(result.medicareTax)}</li>
          <li>Federal income tax: {formatMoney(result.federalTax)}</li>
          <li>State income tax: {formatMoney(result.stateTax)}</li>
        </ul>

        <h2>401k</h2>
        <ul>
          <li>Your traditional contribution: {formatMoney(result.employee401kTraditional)}</li>
          <li>Your Roth contribution: {formatMoney(result.employee401kRoth)}</li>
          <li>Employer match: {formatMoney(result.employerMatch401k)}</li>
          <li>Total 401k: {formatMoney(result.total401k)}</li>
        </ul>

        <h2>Total income</h2>
        <p>Annual net: {formatMoney(result.netAnnual)}</p>
        <p>Monthly net: {formatMoney(result.netMonthly)}</p>
      </section>

      <button onClick={handleSave}>Save</button>
    </div>
  );
}
