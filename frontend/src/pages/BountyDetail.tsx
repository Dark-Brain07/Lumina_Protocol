import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractRead, useContractWrite } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { TxLifecycle } from '../components/TxLifecycle';
import type { Bounty, Contribution, EvidenceRecord, ReviewRecord, RewardRecord, PageResult, BaselineRecord } from '../types';
import { BOUNTY_STATUS_LABEL, REVIEW_STATUS_LABEL, IMPACT_TIER_LABEL, SOURCE_TYPES } from '../types';
import { explorerAddressUrl } from '../lib/genlayer/chain';
import { Clock, Plus, ArrowRight, ExternalLink, AlertTriangle } from 'lucide-react';

export function BountyDetail() {
  const { bountyId } = useParams<{ bountyId: string }>();
  const wallet = useWallet();

  const bounty = useContractRead<Bounty>('get_bounty');
  const contrib = useContractRead<Contribution>('get_contribution');
  const evidence = useContractRead<PageResult<EvidenceRecord>>('get_evidence_page');
  const reviews = useContractRead<PageResult<ReviewRecord>>('get_review_page');
  const rewards = useContractRead<PageResult<RewardRecord>>('get_reward_page');
  const baseline = useContractRead<BaselineRecord>('get_baseline');

  const submitContrib = useContractWrite('submit_contribution');
  const acceptContrib = useContractWrite('accept_contribution');
  const submitEvidence = useContractWrite('submit_evidence');
  const requestReview = useContractWrite('request_impact_review');
  const evaluateImpact = useContractWrite('evaluate_impact');
  const fundPool = useContractWrite('fund_lumina_pool');
  const settleReview = useContractWrite('settle_review');

  const [showContribForm, setShowContribForm] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [showFundForm, setShowFundForm] = useState(false);

  const [contribForm, setContribForm] = useState({
    deliverable_uri: '', repository_url: '', documentation_url: '',
    license_id: 'MIT', maintenance_commitment: '', submission_summary: '',
  });
  const [evidenceForm, setEvidenceForm] = useState({
    source_type: '0', source_url: '', title: '', claim: '',
  });
  const [fundForm, setFundForm] = useState({ amount: '1000', message: '' });

  const reload = () => {
    if (!bountyId) return;
    bounty.fetch(bountyId);
    contrib.fetch(bountyId);
    evidence.fetch(bountyId, '0', '20');
    reviews.fetch(bountyId, '0', '20');
    rewards.fetch(bountyId, '0', '20');
  };

  useEffect(() => { reload(); }, [bountyId]);

  useEffect(() => {
    if (bounty.data?.current_baseline_id) {
      baseline.fetch(bounty.data.current_baseline_id);
    }
  }, [bounty.data?.current_baseline_id]);

  const b = bounty.data;
  if (!b || !b.id) return <div className="loading-bar" />;

  const isSponsor = wallet.address?.toLowerCase() === b.sponsor?.toLowerCase();
  const isContributor = wallet.address?.toLowerCase() === b.contributor?.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const reviewEligible = b.status === 3 && now >= b.next_review_at && b.lumina_pool_remaining > 0;
  const poolPercent = b.lumina_pool_total > 0
    ? Math.round((b.lumina_pool_remaining / b.lumina_pool_total) * 100) : 0;

  const handleSubmitContrib = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitContrib.execute(
      bountyId!, contribForm.deliverable_uri, contribForm.repository_url,
      contribForm.documentation_url, contribForm.license_id,
      contribForm.maintenance_commitment, contribForm.submission_summary,
    );
    if (result?.status === 'success') { setShowContribForm(false); reload(); }
  };

  const handleAccept = async () => {
    const result = await acceptContrib.execute(bountyId!);
    if (result?.status === 'success') reload();
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitEvidence.execute(
      bountyId!, evidenceForm.source_type, evidenceForm.source_url,
      evidenceForm.title, evidenceForm.claim,
    );
    if (result?.status === 'success') {
      setShowEvidenceForm(false);
      setEvidenceForm({ source_type: '0', source_url: '', title: '', claim: '' });
      reload();
    }
  };

  const handleRequestReview = async () => {
    const result = await requestReview.execute(bountyId!);
    if (result?.status === 'success') reload();
  };

  const handleEvaluate = async (reviewId: string) => {
    const result = await evaluateImpact.execute(reviewId);
    if (result?.status === 'success') reload();
  };

  const handleSettle = async (reviewId: string) => {
    const result = await settleReview.execute(reviewId);
    if (result?.status === 'success') reload();
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await fundPool.execute(bountyId!, fundForm.message, { value: BigInt(fundForm.amount) });
    if (result?.status === 'success') { setShowFundForm(false); reload(); }
  };

  return (
    <div className="page-bounty-detail">
      <div className="detail-header">
        <div>
          <span className={`status-chip status-${b.status}`}>{BOUNTY_STATUS_LABEL[b.status]}</span>
          <span className="bounty-category">{b.category}</span>
        </div>
        <h1>{b.title}</h1>
        <div className="detail-meta">
          <span>Sponsor: <a href={explorerAddressUrl(b.sponsor)} target="_blank" rel="noopener noreferrer">
            {b.sponsor.slice(0, 8)}...{b.sponsor.slice(-6)} <ExternalLink size={12} />
          </a></span>
          {b.contributor && (
            <span>Contributor: <a href={explorerAddressUrl(b.contributor)} target="_blank" rel="noopener noreferrer">
              {b.contributor.slice(0, 8)}...{b.contributor.slice(-6)} <ExternalLink size={12} />
            </a></span>
          )}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="detail-stats">
        <div className="detail-stat">
          <span className="stat-label">Initial Reward</span>
          <span className="stat-value">{b.initial_reward.toLocaleString()}</span>
        </div>
        <div className="detail-stat">
          <span className="stat-label">Pool Remaining</span>
          <span className="stat-value accent">{b.lumina_pool_remaining.toLocaleString()}</span>
          <div className="pool-gauge">
            <div className="pool-fill" style={{ width: `${poolPercent}%` }} />
          </div>
        </div>
        <div className="detail-stat">
          <span className="stat-label">Lifetime Paid</span>
          <span className="stat-value coral">{b.lifetime_reward_released.toLocaleString()}</span>
          <span className="stat-cap">/ {b.lifetime_reward_cap.toLocaleString()} cap</span>
        </div>
        <div className="detail-stat">
          <span className="stat-label">Next Review</span>
          <span className="stat-value">
            {b.next_review_at > 0 ? (
              now >= b.next_review_at ? <span className="text-aqua">Eligible Now</span>
              : <><Clock size={14} /> {Math.ceil((b.next_review_at - now) / 86400)}d</>
            ) : '-'}
          </span>
        </div>
        <div className="detail-stat">
          <span className="stat-label">Reviews</span>
          <span className="stat-value">{b.review_count}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="detail-actions">
        {b.status === 1 && !showContribForm && (
          <button className="btn-primary" onClick={() => setShowContribForm(true)}>
            <Plus size={16} /> Submit Contribution
          </button>
        )}
        {b.status === 2 && isSponsor && (
          <>
            <button className="btn-primary" onClick={handleAccept}>Accept Contribution</button>
            <TxLifecycle status={acceptContrib.txStatus} hash={acceptContrib.txHash} error={acceptContrib.error} />
          </>
        )}
        {b.status === 3 && !showEvidenceForm && (
          <button className="btn-secondary" onClick={() => setShowEvidenceForm(true)}>
            <Plus size={16} /> Submit Evidence
          </button>
        )}
        {reviewEligible && (
          <>
            <button className="btn-primary" onClick={handleRequestReview}>
              Request Impact Review
            </button>
            <TxLifecycle status={requestReview.txStatus} hash={requestReview.txHash} error={requestReview.error} />
          </>
        )}
        {b.status === 3 && !showFundForm && (
          <button className="btn-secondary" onClick={() => setShowFundForm(true)}>
            Fund Pool
          </button>
        )}
      </div>

      {/* Contribution Form */}
      {showContribForm && (
        <form onSubmit={handleSubmitContrib} className="inline-form">
          <h3>Submit Contribution</h3>
          <label>Deliverable URI <input required maxLength={240} value={contribForm.deliverable_uri} onChange={e => setContribForm(f => ({...f, deliverable_uri: e.target.value}))} /></label>
          <label>Repository URL <input maxLength={240} value={contribForm.repository_url} onChange={e => setContribForm(f => ({...f, repository_url: e.target.value}))} /></label>
          <label>Documentation URL <input maxLength={240} value={contribForm.documentation_url} onChange={e => setContribForm(f => ({...f, documentation_url: e.target.value}))} /></label>
          <label>License <input maxLength={80} value={contribForm.license_id} onChange={e => setContribForm(f => ({...f, license_id: e.target.value}))} /></label>
          <label>Maintenance Commitment <textarea maxLength={1500} value={contribForm.maintenance_commitment} onChange={e => setContribForm(f => ({...f, maintenance_commitment: e.target.value}))} /></label>
          <label>Summary <textarea required maxLength={2000} value={contribForm.submission_summary} onChange={e => setContribForm(f => ({...f, submission_summary: e.target.value}))} /></label>
          <TxLifecycle status={submitContrib.txStatus} hash={submitContrib.txHash} error={submitContrib.error} />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Submit</button>
            <button type="button" className="btn-ghost" onClick={() => setShowContribForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Evidence Form */}
      {showEvidenceForm && (
        <form onSubmit={handleSubmitEvidence} className="inline-form">
          <h3>Submit Evidence</h3>
          <label>Source Type
            <select value={evidenceForm.source_type} onChange={e => setEvidenceForm(f => ({...f, source_type: e.target.value}))}>
              {SOURCE_TYPES.map((s, i) => <option key={i} value={String(i)}>{s}</option>)}
            </select>
          </label>
          <label>Source URL <input required maxLength={300} value={evidenceForm.source_url} onChange={e => setEvidenceForm(f => ({...f, source_url: e.target.value}))} placeholder="https://..." /></label>
          <label>Title <input required maxLength={160} value={evidenceForm.title} onChange={e => setEvidenceForm(f => ({...f, title: e.target.value}))} /></label>
          <label>Claim <textarea required maxLength={1500} value={evidenceForm.claim} onChange={e => setEvidenceForm(f => ({...f, claim: e.target.value}))} placeholder="Describe what this evidence demonstrates..." /></label>
          <TxLifecycle status={submitEvidence.txStatus} hash={submitEvidence.txHash} error={submitEvidence.error} />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Submit Evidence</button>
            <button type="button" className="btn-ghost" onClick={() => setShowEvidenceForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Fund Form */}
      {showFundForm && (
        <form onSubmit={handleFund} className="inline-form">
          <h3>Fund Lumina Pool</h3>
          <label>Amount (GEN) <input type="number" required min="1" value={fundForm.amount} onChange={e => setFundForm(f => ({...f, amount: e.target.value}))} /></label>
          <label>Message <input maxLength={280} value={fundForm.message} onChange={e => setFundForm(f => ({...f, message: e.target.value}))} /></label>
          <TxLifecycle status={fundPool.txStatus} hash={fundPool.txHash} error={fundPool.error} />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Fund</button>
            <button type="button" className="btn-ghost" onClick={() => setShowFundForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Contribution */}
      {contrib.data && contrib.data.bounty_id && (
        <section className="detail-section">
          <h2>Contribution</h2>
          <div className="contrib-detail">
            <p><strong>Summary:</strong> {contrib.data.submission_summary}</p>
            {contrib.data.repository_url && <p><strong>Repository:</strong> <a href={contrib.data.repository_url} target="_blank" rel="noopener noreferrer">{contrib.data.repository_url} <ExternalLink size={12} /></a></p>}
            {contrib.data.deliverable_uri && <p><strong>Deliverable:</strong> <a href={contrib.data.deliverable_uri} target="_blank" rel="noopener noreferrer">{contrib.data.deliverable_uri} <ExternalLink size={12} /></a></p>}
            <p><strong>License:</strong> {contrib.data.license_id}</p>
          </div>
        </section>
      )}

      {/* Baseline */}
      {baseline.data && baseline.data.id && (
        <section className="detail-section">
          <h2>Current Baseline</h2>
          <div className="baseline-card">
            <p>{baseline.data.summary || 'Initial baseline'}</p>
            <div className="baseline-scores">
              <span>Adoption: {(baseline.data.adoption_bps / 100).toFixed(0)}%</span>
              <span>Production: {(baseline.data.production_usage_bps / 100).toFixed(0)}%</span>
              <span>Downstream: {(baseline.data.downstream_enablement_bps / 100).toFixed(0)}%</span>
              <span>Ecosystem: {(baseline.data.ecosystem_dependence_bps / 100).toFixed(0)}%</span>
              <span>Maintenance: {(baseline.data.maintenance_bps / 100).toFixed(0)}%</span>
            </div>
          </div>
        </section>
      )}

      {/* Evidence */}
      <section className="detail-section">
        <h2>Evidence ({evidence.data?.total ?? 0})</h2>
        {evidence.data?.items.map(ev => (
          <div key={ev.evidence_id} className={`evidence-slip ${ev.rewarded ? 'rewarded' : ''} ${ev.invalidated ? 'invalidated' : ''}`}>
            <div className="ev-header">
              <span className="ev-id">E{ev.evidence_id}</span>
              <span className="ev-type">{SOURCE_TYPES[ev.source_type] ?? 'Unknown'}</span>
              {ev.rewarded && <span className="ev-badge rewarded">Rewarded</span>}
              {ev.flagged && <span className="ev-badge flagged"><AlertTriangle size={12} /> Flagged</span>}
              {ev.invalidated && <span className="ev-badge invalidated">Invalidated</span>}
            </div>
            <h4>{ev.title}</h4>
            <p className="ev-claim">{ev.claim}</p>
            <a href={ev.source_url} target="_blank" rel="noopener noreferrer" className="ev-link">
              {ev.source_url} <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </section>

      {/* Reviews */}
      <section className="detail-section">
        <h2>Impact Reviews ({reviews.data?.total ?? 0})</h2>
        {reviews.data?.items.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <Link to={`/reviews/${r.id}`} className="review-id">Review #{r.id} <ArrowRight size={14} /></Link>
              <span className={`status-chip review-status-${r.status}`}>
                {REVIEW_STATUS_LABEL[r.status]}
              </span>
            </div>
            {r.status === 4 || r.status === 5 ? (
              <div className="review-verdict">
                <div className="verdict-row">
                  <span className="impact-tier">{IMPACT_TIER_LABEL[r.impact_tier]}</span>
                  <span className="approved-reward">{r.approved_reward.toLocaleString()} GEN</span>
                </div>
                <p className="review-summary">{r.summary}</p>
                {r.status === 4 && r.approved_reward > 0 && r.finalized_at > 0 && (
                  now >= r.finalized_at + 604800 ? (
                    <div className="settle-action">
                      <button className="btn-primary" onClick={() => handleSettle(r.id)}>
                        Settle Reward ({r.approved_reward.toLocaleString()} GEN)
                      </button>
                      <TxLifecycle status={settleReview.txStatus} hash={settleReview.txHash} error={settleReview.error} />
                    </div>
                  ) : (
                    <div className="settle-pending">
                      Challenge window: {Math.ceil((r.finalized_at + 604800 - now) / 86400)}d remaining
                    </div>
                  )
                )}
              </div>
            ) : r.status === 0 ? (
              <div className="review-pending">
                <p>Review requested. Awaiting evaluation.</p>
                <button className="btn-primary" onClick={() => handleEvaluate(r.id)}>
                  Evaluate Impact
                </button>
                <TxLifecycle status={evaluateImpact.txStatus} hash={evaluateImpact.txHash} error={evaluateImpact.error} />
              </div>
            ) : null}
          </div>
        ))}
      </section>

      {/* Rewards */}
      {rewards.data && rewards.data.items.length > 0 && (
        <section className="detail-section">
          <h2>Reward History</h2>
          <div className="reward-timeline">
            {rewards.data.items.map((r, i) => (
              <div key={i} className="reward-entry">
                <span className="reward-amount">{r.amount.toLocaleString()} GEN</span>
                <span className="reward-type">{r.reward_type === 0 ? 'Initial' : 'Impact'}</span>
                {r.reward_type === 1 && 'settled' in r && (
                  <span className={`reward-settlement ${r.settled ? 'settled' : 'escrowed'}`}>
                    {r.settled ? 'Settled' : 'Escrowed'}
                  </span>
                )}
                <span className="reward-date">{new Date(r.released_at * 1000).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
