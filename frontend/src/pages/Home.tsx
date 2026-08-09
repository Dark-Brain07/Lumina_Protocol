import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContractRead } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import type { ProtocolStats, Bounty, PageResult } from '../types';
import { BOUNTY_STATUS_LABEL } from '../types';
import { ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';

export function Home() {
  const wallet = useWallet();
  const stats = useContractRead<ProtocolStats>('get_protocol_stats');
  const bounties = useContractRead<PageResult<Bounty>>('list_bounties');

  useEffect(() => {
    stats.fetch();
    bounties.fetch('0', '5');
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-accent">Work should not stop earning</span>
          <br />while the world keeps using it.
        </h1>
        <p className="hero-sub">
          Living Bounties keep rewarding contributors as their impact grows.
          GenLayer validators evaluate real-world evidence to release bounded additional rewards.
        </p>
        <div className="hero-actions">
          {!wallet.isConnected ? (
            <button className="btn-primary" onClick={wallet.connect}>Connect Wallet</button>
          ) : (
            <Link to="/bounties/new" className="btn-primary">
              Create Living Bounty <ArrowRight size={16} />
            </Link>
          )}
          <Link to="/bounties" className="btn-secondary">Explore Bounties</Link>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stat-cell">
          <span className="stat-value">{stats.data?.total_bounties ?? '-'}</span>
          <span className="stat-label">Living Bounties</span>
        </div>
        <div className="stat-cell">
          <span className="stat-value accent">{stats.data?.active_bounties ?? '-'}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-cell">
          <span className="stat-value">{stats.data?.total_pool_funded?.toLocaleString() ?? '-'}</span>
          <span className="stat-label">Total Pool Funded</span>
        </div>
        <div className="stat-cell">
          <span className="stat-value coral">{stats.data?.total_rewards_released?.toLocaleString() ?? '-'}</span>
          <span className="stat-label">Rewards Released</span>
        </div>
        <div className="stat-cell">
          <span className="stat-value">{stats.data?.total_reviews ?? '-'}</span>
          <span className="stat-label">Impact Reviews</span>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <Zap size={28} className="step-icon" />
            <h3>1. Create</h3>
            <p>Sponsor creates a Living Bounty with an initial reward and Lumina Pool for future impact rewards.</p>
          </div>
          <div className="step-card">
            <TrendingUp size={28} className="step-icon" />
            <h3>2. Build & Grow</h3>
            <p>Contributor completes the work. Over time, adoption, production usage, and downstream impact accumulate.</p>
          </div>
          <div className="step-card">
            <Shield size={28} className="step-icon" />
            <h3>3. Review & Reward</h3>
            <p>GenLayer validators evaluate fresh evidence against the previous baseline. New impact earns new rewards.</p>
          </div>
        </div>
      </section>

      {bounties.data && bounties.data.items.length > 0 && (
        <section className="recent-bounties">
          <div className="section-header">
            <h2>Recent Bounties</h2>
            <Link to="/bounties" className="see-all">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="bounty-grid">
            {bounties.data.items.map(b => (
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
                    <span className="mini-label">Pool</span>
                    <span className="mini-value">{b.lumina_pool_remaining.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="mini-label">Reviews</span>
                    <span className="mini-value">{b.review_count}</span>
                  </div>
                  <div>
                    <span className="mini-label">Paid</span>
                    <span className="mini-value">{b.lifetime_reward_released.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
