import type { MatchTier } from '../../types/models';

interface Props {
  tiers: MatchTier[];
  onChange: (tiers: MatchTier[]) => void;
}

export function TierEditor({ tiers, onChange }: Props) {
  function updateTier(index: number, updates: Partial<MatchTier>) {
    onChange(tiers.map((t, i) => (i === index ? { ...t, ...updates } : t)));
  }

  function removeTier(index: number) {
    onChange(tiers.filter((_, i) => i !== index));
  }

  function addTier() {
    const last = tiers[tiers.length - 1];
    onChange([...tiers, { upToPercentOfBase: (last?.upToPercentOfBase ?? 0) + 1, matchRate: 0.5 }]);
  }

  return (
    <div className="tier-editor">
      {tiers.map((tier, i) => (
        <div className="tier-row" key={i}>
          <span>Up to</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={tier.upToPercentOfBase}
            onChange={(e) => updateTier(i, { upToPercentOfBase: Number(e.target.value) })}
          />
          <span>% of base pay, matched at</span>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={tier.matchRate * 100}
            onChange={(e) => updateTier(i, { matchRate: Number(e.target.value) / 100 })}
          />
          <span>%</span>
          <button type="button" onClick={() => removeTier(i)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addTier}>
        + Add tier
      </button>
    </div>
  );
}
