import { useEffect, useState } from 'react';
import { usePostTaxAllocations, usePaycheckConfig } from '../hooks/usePaycheckConfig';
import { useUserProfile } from '../contexts/UserProfileContext';
import { computePaycheck } from '../domain/paycheck/computePaycheck';
import { Money } from '../components/Money';
import { PageHeader } from '../components/layout/PageHeader';
import type { PostTaxAllocations } from '../types/models';

const DEFAULT: PostTaxAllocations = {
  otherPersonalContributions: 0,
  setAsideSavings: 0,
  rothIRA: 0,
  gifts: 0,
  debtPayments: 0,
  updatedAt: 0,
};

export function PostTaxAllocationsPage() {
  const { allocations, loading, save } = usePostTaxAllocations();
  const { config } = usePaycheckConfig();
  const { profile } = useUserProfile();
  const [form, setForm] = useState<PostTaxAllocations>(DEFAULT);

  useEffect(() => {
    if (allocations) setForm(allocations);
  }, [allocations]);

  if (loading) return <div className="page-loading">Loading…</div>;

  const netAnnual = config
    ? computePaycheck({
        ...config,
        stateCode: profile?.state ?? '',
      }).netAnnual
    : 0;

  const totalAllocations =
    form.otherPersonalContributions + form.setAsideSavings + form.rothIRA + form.gifts + form.debtPayments;
  const spendableAnnual = netAnnual - totalAllocations;
  const spendableMonthly = spendableAnnual / 12;

  function update<K extends keyof PostTaxAllocations>(key: K, value: PostTaxAllocations[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    await save({ ...form, updatedAt: Date.now() });
  }

  const fields: { key: keyof Omit<PostTaxAllocations, 'updatedAt'>; label: string }[] = [
    { key: 'otherPersonalContributions', label: 'Other personal contributions' },
    { key: 'setAsideSavings', label: 'Set aside / savings' },
    { key: 'rothIRA', label: 'Roth IRA' },
    { key: 'gifts', label: 'Gifts' },
    { key: 'debtPayments', label: 'Debt payments' },
  ];

  return (
    <div className="allocations-page">
      <PageHeader
        title="Post-Tax Allocations"
        description="What comes out of your net income before it's yours to spend — savings, Roth IRA, gifts, debt payments. Enter each as an annual amount."
      />
      <p className="eyebrow-line">
        Annual net income <Money value={netAnnual} />
      </p>

      <section>
        {fields.map(({ key, label }) => (
          <label key={key} className="field-row">
            <span className="field-label">
              {label}
              <span className="field-unit">$/year</span>
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              value={form[key] || ''}
              onChange={(e) => update(key, Number(e.target.value))}
            />
          </label>
        ))}
      </section>

      <section className="results">
        <div className="stat-block">
          <span className="stat-label">Spendable annual income</span>
          <Money className="stat-figure" value={spendableAnnual} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Spendable monthly income</span>
          <Money className="stat-figure" value={spendableMonthly} />
        </div>
      </section>

      <button className="btn btn-primary" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
