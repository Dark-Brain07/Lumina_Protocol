import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractRead } from '../hooks/useContract';
import type { Bounty, PageResult } from '../types';
import { BOUNTY_STATUS_LABEL, IMPACT_TIER_LABEL } from '../types';

export function ContributorPortfolio() {
  const { address } = useParams<{ address: string }>();
  const bounties = useContractRead<PageResult<Bounty>>('get_contributor_bounties');

  useEffect(() => {
    if (address) bounties.fetch(address, '0', '20');
  }, [address]);

  const items = bounties.data?.items || [];
  const totalInitial = items.reduce((s, b) => s + b.initial_reward, 0);
  const totalLumina = items.reduce((s, b) => s + (b.lifetime_reward_released - b.initial_reward), 0);

  return (
    <div className="page-contributor">
      <h1>Contributor Portfolio</h1>
      <p className="address-display">{address}</p>

      <div className="stats-strip">
        <div className="stat-cell">
          <span className="stat-value">{items.length}</span>
          <span className="stat-label">Living Bounties</span>
        </div>
        <div className="stat-cell">
          <span className="stat-value">{totalInitial.toLocaleString()}</span>
          <span className="stat-label">Initial Rewards</span>
        </div>
        <div className="stat-cell">
          <span className="stat-value coral">{totalLumina.toLocaleString()}</span>
          <span className="stat-label">Lumina Rewards</span>
        </div>
      </div>

      <div className="bounty-grid">
        {items.map(b => (
          <Link to={`/bounties/${b.id}`} key={b.id} className="bounty-card">
            <div className="bounty-card-top">
              <span className={`status-chip status-${b.status}`}>{BOUNTY_STATUS_LABEL[b.status]}</span>
            </div>
            <h3 className="bounty-card-title">{b.title}</h3>
            <div className="bounty-card-stats">
              <div>
                <span className="mini-label">Earned</span>
                <span className="mini-value">{b.lifetime_reward_released.toLocaleString()}</span>
              </div>
              <div>
                <span className="mini-label">Pool Left</span>
                <span className="mini-value">{b.lumina_pool_remaining.toLocaleString()}</span>
              </div>
              <div>
                <span className="mini-label">Reviews</span>
                <span className="mini-value">{b.review_count}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
