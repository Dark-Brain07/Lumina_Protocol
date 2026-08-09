import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContractWrite } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { TxLifecycle } from '../components/TxLifecycle';

export function CreateBounty() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const write = useContractWrite('create_living_bounty');

  const [form, setForm] = useState({
    title: '',
    category: 'SDK',
    description_uri: '',
    acceptance_uri: '',
    initial_reward: '500',
    lumina_pool: '10000',
    lifetime_reward_cap: '50000',
    max_cycle_reward: '5000',
    review_interval_seconds: '86400',
  });

  const categories = [
    'SDK', 'CLI Tool', 'Library', 'Documentation', 'Integration',
    'Research', 'Developer Tool', 'Dataset', 'ML Model', 'Other',
  ];

  const update = (key: string, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) return;

    const totalValue = BigInt(form.initial_reward) + BigInt(form.lumina_pool);
    const result = await write.execute(
      form.title,
      form.category,
      form.description_uri,
      form.acceptance_uri,
      form.initial_reward,
      form.lumina_pool,
      form.lifetime_reward_cap,
      form.max_cycle_reward,
      form.review_interval_seconds,
      { value: totalValue },
    );

    if (result?.status === 'success') {
      setTimeout(() => navigate('/bounties'), 1500);
    }
  };

  return (
    <div className="page-create-bounty">
      <h1>Create Living Bounty</h1>
      <p className="page-desc">
        Fund a bounty that keeps rewarding as its impact grows.
      </p>

      <form onSubmit={handleSubmit} className="create-form">
        <fieldset className="form-section">
          <legend>Identity</legend>
          <label>
            Title
            <input
              value={form.title}
              onChange={e => update('title', e.target.value)}
              maxLength={100}
              required
              placeholder="e.g., Developer Logging Library"
            />
          </label>
          <label>
            Category
            <select value={form.category} onChange={e => update('category', e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </fieldset>

        <fieldset className="form-section">
          <legend>Details</legend>
          <label>
            Description URI
            <input
              value={form.description_uri}
              onChange={e => update('description_uri', e.target.value)}
              maxLength={240}
              placeholder="https://..."
            />
          </label>
          <label>
            Acceptance Criteria URI
            <input
              value={form.acceptance_uri}
              onChange={e => update('acceptance_uri', e.target.value)}
              maxLength={240}
              placeholder="https://..."
            />
          </label>
        </fieldset>

        <fieldset className="form-section">
          <legend>Reward Structure</legend>
          <div className="form-row">
            <label>
              Initial Reward (GEN)
              <input
                type="number"
                value={form.initial_reward}
                onChange={e => update('initial_reward', e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              Lumina Pool (GEN)
              <input
                type="number"
                value={form.lumina_pool}
                onChange={e => update('lumina_pool', e.target.value)}
                min="1"
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Lifetime Cap (GEN)
              <input
                type="number"
                value={form.lifetime_reward_cap}
                onChange={e => update('lifetime_reward_cap', e.target.value)}
                min="1"
                required
              />
            </label>
            <label>
              Max Per Review (GEN)
              <input
                type="number"
                value={form.max_cycle_reward}
                onChange={e => update('max_cycle_reward', e.target.value)}
                min="1"
                required
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Review Policy</legend>
          <label>
            Review Interval (seconds)
            <input
              type="number"
              value={form.review_interval_seconds}
              onChange={e => update('review_interval_seconds', e.target.value)}
              min="86400"
              max="31536000"
              required
            />
            <span className="input-hint">
              {Math.round(Number(form.review_interval_seconds) / 86400)} days
            </span>
          </label>
        </fieldset>

        <TxLifecycle status={write.txStatus} hash={write.txHash} error={write.error} />

        <button
          type="submit"
          className="btn-primary btn-full"
          disabled={!wallet.isConnected || write.txStatus === 'pending' || write.txStatus === 'awaiting_signature'}
        >
          {!wallet.isConnected
            ? 'Connect Wallet First'
            : write.txStatus === 'pending'
            ? 'Processing...'
            : 'Create Living Bounty'
          }
        </button>
      </form>
    </div>
  );
}
