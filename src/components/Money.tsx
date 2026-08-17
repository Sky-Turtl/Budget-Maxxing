import { formatMoney } from '../utils/money';

interface Props {
  value: number;
  className?: string;
}

/** Ledger-style tabular money figure: monospace, tabular-nums, color-coded by sign. */
export function Money({ value, className }: Props) {
  const sign = value < 0 ? 'money-negative' : 'money-positive';
  return <span className={['money', sign, className].filter(Boolean).join(' ')}>{formatMoney(value)}</span>;
}
