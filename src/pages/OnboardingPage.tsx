import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { setDoc } from 'firebase/firestore';
import { userProfileRef } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { StatePicker } from '../components/forms/StatePicker';
import { PageHeader } from '../components/layout/PageHeader';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function OnboardingPage() {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const [state, setState] = useState('');
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && profile) return <Navigate to="/paycheck" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const now = Date.now();
    await setDoc(userProfileRef(user.uid), {
      uid: user.uid,
      email: user.email ?? '',
      filingStatus: 'single',
      state,
      fiscalYearStartMonth,
      createdAt: now,
      updatedAt: now,
    });
    setSubmitting(false);
  }

  return (
    <div className="onboarding-page">
      <PageHeader
        title="Welcome — let's set up your budget"
        description="A one-time setup: your state determines your income tax brackets, and your fiscal year start month anchors every monthly and year-to-date figure you'll see later."
      />
      <form onSubmit={handleSubmit}>
        <label>
          Filing status
          <input value="Single" disabled />
        </label>
        <label>
          State (for state income tax)
          <StatePicker value={state} onChange={setState} />
        </label>
        <label>
          Fiscal year start month
          <select
            value={fiscalYearStartMonth}
            onChange={(e) => setFiscalYearStartMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={submitting || !state}>
          Continue
        </button>
      </form>
    </div>
  );
}
