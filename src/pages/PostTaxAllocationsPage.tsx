import { useEffect, useState } from 'react';
import { usePostTaxAllocations, usePaycheckConfig } from '../hooks/usePaycheckConfig';
import { useUserProfile } from '../contexts/UserProfileContext';
import { computePaycheck } from '../domain/paycheck/computePaycheck';
import { formatMoney } from '../utils/money';
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

  const netMonthly = config
    ? computePaycheck({
        ...config,
        stateCode: profile?.state ?? '',
      }).netMonthly
    : 0;

  const totalAllocations =
    form.otherPersonalContributions + form.setAsideSavings + form.rothIRA + form.gifts + form.debtPayments;
  const spendableMonthly = netMonthly - totalAllocations;

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
      <h1>Post-Tax Allocations</h1>
      <p>Monthly net income: {formatMoney(netMonthly)}</p>

      <section>
        {fields.map(({ key, label }) => (
          <label key={key}>
            {label} ($/month)
            <input
              type="number"
              min={0}
              value={form[key]}
              onChange={(e) => update(key, Number(e.target.value))}
            />
          </label>
        ))}
      </section>

      <section className="results">
        <h2>Spendable monthly income</h2>
        <p>{formatMoney(spendableMonthly)}</p>
      </section>

      <button onClick={handleSave}>Save</button>
    </div>
  );
}
