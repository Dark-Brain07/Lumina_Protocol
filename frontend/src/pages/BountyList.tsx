import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContractRead } from '../hooks/useContract';
import type { Bounty, PageResult } from '../types';
import { BOUNTY_STATUS_LABEL } from '../types';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export function BountyList() {
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const bounties = useContractRead<PageResult<Bounty>>('list_bounties');

  useEffect(() => {
    bounties.fetch(String(offset), String(limit));
  }, [offset]);

  return (
    <div className="page-bounty-list">
      <div className="page-header">
        <div>
          <h1>Living Bounties</h1>
          <p className="page-desc">Contributions that keep earning as their impact grows.</p>
        </div>
        <Link to="/bounties/new" className="btn-primary">
          <Plus size={16} /> Create Bounty
        </Link>
      </div>

      {bounties.loading && <div className="loading-bar" />}

      {bounties.data && bounties.data.items.length === 0 && (
        <div className="empty-state">
          <p>No bounties yet. Be the first to create a Living Bounty.</p>
          <Link to="/bounties/new" className="btn-primary">Create Bounty</Link>
        </div>
      )}

      <div className="bounty-grid">
        {bounties.data?.items.map(b => (
          <Link to={`/bounties/${b.id}`} key={b.id} className="bounty-card">
            <div className="bounty-card-top">
              <span className={`status-chip status-${b.status}`}>
                {BOUNTY_STATUS_LABEL[b.status]}
              </span>
              <span className="bounty-category">{b.category}</span>
            </div>
            <h3 className="bounty-card-title">{b.title}</h3>
            <div className="bounty-card-stats">
              <div>
                <span className="mini-label">Initial</span>
                <span className="mini-value">{b.initial_reward.toLocaleString()}</span>
              </div>
              <div>
                <span className="mini-label">Pool Remaining</span>
                <span className="mini-value">{b.lumina_pool_remaining.toLocaleString()}</span>
              </div>
              <div>
                <span className="mini-label">Total Paid</span>
                <span className="mini-value">{b.lifetime_reward_released.toLocaleString()}</span>
              </div>
              <div>
                <span className="mini-label">Reviews</span>
                <span className="mini-value">{b.review_count}</span>
              </div>
            </div>
            {b.contributor && (
              <div className="bounty-card-contributor">
                Contributor: {b.contributor.slice(0, 8)}...{b.contributor.slice(-6)}
              </div>
            )}
          </Link>
        ))}
      </div>

      {bounties.data && bounties.data.total > limit && (
        <div className="pagination">
          <button disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))}>
            <ChevronLeft size={16} /> Prev
          </button>
          <span>
            {offset + 1}-{Math.min(offset + limit, bounties.data.total)} of {bounties.data.total}
          </span>
          <button disabled={offset + limit >= bounties.data.total} onClick={() => setOffset(o => o + limit)}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
