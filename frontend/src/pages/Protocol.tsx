import { useEffect } from 'react';
import { useContractRead } from '../hooks/useContract';
import type { ProtocolStats } from '../types';
import { CONTRACT_ADDRESS } from '../lib/genlayer/client';
import { CHAIN_ID, EXPLORER_BASE } from '../lib/genlayer/chain';
import { ExternalLink } from 'lucide-react';

export function Protocol() {
  const stats = useContractRead<ProtocolStats>('get_protocol_stats');

  useEffect(() => { stats.fetch(); }, []);

  return (
    <div className="page-protocol">
      <h1>Protocol</h1>
      <p className="page-desc">
        LUMINA PROTOCOL makes a simple promise: when a contribution keeps creating value,
        its creator should have a transparent path to keep sharing in that value.
      </p>

      <div className="stats-strip">
        <div className="stat-cell">
          <span className="stat-value">{stats.data?.total_bounties ?? '-'}</span>
          <span className="stat-label">Total Bounties</span>
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
          <span className="stat-label">Total Released</span>
        </div>
        <div className="stat-cell">
          <span className="stat-value">{stats.data?.total_reviews ?? '-'}</span>
          <span className="stat-label">Reviews</span>
        </div>
        <div className="stat-cell">
          <span className="stat-value">{stats.data?.total_challenges ?? '-'}</span>
          <span className="stat-label">Challenges</span>
        </div>
      </div>

      <section className="protocol-info">
        <h2>Network</h2>
        <div className="info-grid">
          <div className="info-row">
            <span>Network</span>
            <span>GenLayer StudioNet</span>
          </div>
          <div className="info-row">
            <span>Chain ID</span>
            <span>{CHAIN_ID}</span>
          </div>
          <div className="info-row">
            <span>Contract</span>
            <a href={`${EXPLORER_BASE}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="mono">
              {CONTRACT_ADDRESS} <ExternalLink size={12} />
            </a>
          </div>
          <div className="info-row">
            <span>Architecture</span>
            <span>Frontend + Intelligent Contract only</span>
          </div>
        </div>
      </section>

      <section className="protocol-info">
        <h2>Impact Constitution v1</h2>
        <div className="constitution-grid">
          <div className="const-item">
            <h3>Adoption</h3>
            <p>Credible dependents, package imports, integration references, repeated use across teams.</p>
          </div>
          <div className="const-item">
            <h3>Production Usage</h3>
            <p>Public deployments, protocol integrations, architecture documentation.</p>
          </div>
          <div className="const-item">
            <h3>Downstream Enablement</h3>
            <p>Projects built on top, reduced build time, integrations otherwise requiring substantial engineering.</p>
          </div>
          <div className="const-item">
            <h3>Ecosystem Dependence</h3>
            <p>Critical path inclusion, default/recommended tool status, high replacement cost.</p>
          </div>
          <div className="const-item">
            <h3>Maintenance</h3>
            <p>Substantive commits, issue response, security updates, documentation quality.</p>
          </div>
          <div className="const-item">
            <h3>Anti-Gaming</h3>
            <p>Bot detection, self-dealing detection, circular reference detection, manipulation risk scoring.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
