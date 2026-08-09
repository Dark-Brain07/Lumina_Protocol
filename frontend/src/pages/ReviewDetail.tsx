import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractRead, useContractWrite } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { TxLifecycle } from '../components/TxLifecycle';
import type { ReviewRecord, Bounty, BaselineRecord, ChallengeRecord } from '../types';
import { REVIEW_STATUS_LABEL, IMPACT_TIER_LABEL, CHALLENGE_REASONS } from '../types';
import { useState } from 'react';

export function ReviewDetail() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const wallet = useWallet();

  const review = useContractRead<ReviewRecord>('get_review');
  const bounty = useContractRead<Bounty>('get_bounty');
  const prevBaseline = useContractRead<BaselineRecord>('get_baseline');
  const newBaseline = useContractRead<BaselineRecord>('get_baseline');
  const challenge = useContractRead<ChallengeRecord>('get_challenge');

  const openChallenge = useContractWrite('open_challenge');
  const evaluateChallenge = useContractWrite('evaluate_challenge');

  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    reason_code: CHALLENGE_REASONS[0],
    evidence_refs: '',
    statement: '',
  });

  useEffect(() => {
    if (reviewId) review.fetch(reviewId);
  }, [reviewId]);

  const r = review.data;

  useEffect(() => {
    if (r?.bounty_id) bounty.fetch(r.bounty_id);
    if (r?.previous_baseline_id) prevBaseline.fetch(r.previous_baseline_id);
    if (r?.new_baseline_id) newBaseline.fetch(r.new_baseline_id);
    if (r?.challenge_id) challenge.fetch(r.challenge_id);
  }, [r?.bounty_id, r?.previous_baseline_id, r?.new_baseline_id, r?.challenge_id]);

  if (!r || !r.id) return <div className="loading-bar" />;

  const reasonCodes = r.reason_codes ? JSON.parse(r.reason_codes) : [];
  const evidenceRefs = r.evidence_refs ? JSON.parse(r.evidence_refs) : [];
  const now = Math.floor(Date.now() / 1000);
  const canChallenge = r.status === 4 && r.finalized_at > 0 && (now - r.finalized_at) < 604800 && !r.challenge_id;

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    const refs = challengeForm.evidence_refs
      ? JSON.stringify(challengeForm.evidence_refs.split(',').map(s => s.trim()))
      : '[]';
    const result = await openChallenge.execute(
      reviewId!, challengeForm.reason_code, refs, challengeForm.statement,
    );
    if (result?.status === 'success') {
      setShowChallengeForm(false);
      review.fetch(reviewId!);
    }
  };

  const handleEvalChallenge = async (cid: string) => {
    const result = await evaluateChallenge.execute(cid);
    if (result?.status === 'success') {
      review.fetch(reviewId!);
      if (cid) challenge.fetch(cid);
    }
  };

  const bps = (val: number) => (val / 100).toFixed(1) + '%';

  return (
    <div className="page-review-detail">
      <div className="detail-header">
        <Link to={`/bounties/${r.bounty_id}`} className="back-link">
          &larr; Bounty #{r.bounty_id}
        </Link>
        <h1>Impact Review #{r.id}</h1>
        <span className={`status-chip review-status-${r.status}`}>
          {REVIEW_STATUS_LABEL[r.status]}
        </span>
      </div>

      {/* Verdict */}
      {(r.status === 4 || r.status === 5 || r.status === 6) && (
        <div className="verdict-panel">
          <div className="verdict-header">
            <span className="impact-tier large">{IMPACT_TIER_LABEL[r.impact_tier]}</span>
            <div className="reward-display">
              <span className="reward-label">Approved Reward</span>
              <span className="reward-amount large">{r.approved_reward.toLocaleString()}</span>
              {r.recommended_reward !== r.approved_reward && (
                <span className="reward-recommended">
                  Recommended: {r.recommended_reward.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <p className="verdict-summary">{r.summary}</p>
        </div>
      )}

      {/* Scores */}
      <section className="detail-section">
        <h2>Impact Scores</h2>
        <div className="scores-grid">
          {[
            ['Impact Delta', r.impact_delta_bps],
            ['Adoption', r.adoption_bps],
            ['Production Usage', r.production_usage_bps],
            ['Downstream Enablement', r.downstream_enablement_bps],
            ['Ecosystem Dependence', r.ecosystem_dependence_bps],
            ['Maintenance', r.maintenance_bps],
            ['Evidence Quality', r.evidence_quality_bps],
            ['Manipulation Risk', r.manipulation_risk_bps],
            ['Duplicate Impact', r.duplicate_impact_bps],
          ].map(([label, val]) => (
            <div key={label as string} className="score-bar">
              <div className="score-label">{label as string}</div>
              <div className="score-track">
                <div
                  className={`score-fill ${(label as string).includes('Risk') || (label as string).includes('Duplicate') ? 'negative' : ''}`}
                  style={{ width: `${Math.min((val as number) / 100, 100)}%` }}
                />
              </div>
              <span className="score-value">{bps(val as number)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reason Codes */}
      {reasonCodes.length > 0 && (
        <section className="detail-section">
          <h2>Reason Codes</h2>
          <div className="reason-codes">
            {reasonCodes.map((rc: string) => (
              <span key={rc} className={`reason-chip ${rc.startsWith('NO_') || rc.includes('RISK') || rc.includes('INSUFFICIENT') || rc.includes('UNCLEAR') || rc.includes('UNVERIFIED') || rc.includes('DEPRECATED') || rc.includes('DUPLICATE') || rc.includes('CONFLICTING') || rc.includes('ALREADY') ? 'negative' : 'positive'}`}>
                {rc.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Evidence Refs */}
      {evidenceRefs.length > 0 && (
        <section className="detail-section">
          <h2>Evidence References</h2>
          <div className="evidence-refs">
            {evidenceRefs.map((ref: string) => (
              <span key={ref} className="evidence-ref-chip">{ref}</span>
            ))}
          </div>
        </section>
      )}

      {/* Previous Baseline */}
      {prevBaseline.data && prevBaseline.data.id && (
        <section className="detail-section">
          <h2>Previous Baseline</h2>
          <div className="baseline-card">
            <p>{prevBaseline.data.summary || 'Initial baseline'}</p>
            <div className="baseline-scores">
              <span>Adoption: {bps(prevBaseline.data.adoption_bps)}</span>
              <span>Production: {bps(prevBaseline.data.production_usage_bps)}</span>
              <span>Downstream: {bps(prevBaseline.data.downstream_enablement_bps)}</span>
            </div>
          </div>
        </section>
      )}

      {/* Challenge */}
      {challenge.data && challenge.data.id && (
        <section className="detail-section">
          <h2>Challenge</h2>
          <div className="challenge-card">
            <div className="challenge-header">
              <span className="challenge-reason">{challenge.data.reason_code.replace(/_/g, ' ')}</span>
              <span className={`status-chip challenge-status-${challenge.data.status}`}>
                {['Open', 'Evaluating', 'Upheld', 'Modified', 'Rejected'][challenge.data.status]}
              </span>
            </div>
            <p>{challenge.data.statement}</p>
            {challenge.data.resolution_summary && (
              <p className="challenge-resolution">{challenge.data.resolution_summary}</p>
            )}
            {challenge.data.status === 3 && (
              <div className="challenge-result">
                Original: {challenge.data.original_reward.toLocaleString()} &rarr;
                Final: {challenge.data.final_reward.toLocaleString()}
              </div>
            )}
            {challenge.data.status === 0 && (
              <>
                <button className="btn-primary" onClick={() => handleEvalChallenge(challenge.data!.id)}>
                  Evaluate Challenge
                </button>
                <TxLifecycle status={evaluateChallenge.txStatus} hash={evaluateChallenge.txHash} error={evaluateChallenge.error} />
              </>
            )}
          </div>
        </section>
      )}

      {/* Challenge Action */}
      {canChallenge && !showChallengeForm && (
        <button className="btn-challenge" onClick={() => setShowChallengeForm(true)}>
          Challenge This Review
        </button>
      )}

      {showChallengeForm && (
        <form onSubmit={handleChallenge} className="inline-form">
          <h3>Open Challenge</h3>
          <label>Reason
            <select value={challengeForm.reason_code} onChange={e => setChallengeForm(f => ({...f, reason_code: e.target.value}))}>
              {CHALLENGE_REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <label>Evidence References (comma-separated)
            <input value={challengeForm.evidence_refs} onChange={e => setChallengeForm(f => ({...f, evidence_refs: e.target.value}))} placeholder="E0, E1" />
          </label>
          <label>Statement
            <textarea required maxLength={1500} value={challengeForm.statement} onChange={e => setChallengeForm(f => ({...f, statement: e.target.value}))} />
          </label>
          <TxLifecycle status={openChallenge.txStatus} hash={openChallenge.txHash} error={openChallenge.error} />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Submit Challenge</button>
            <button type="button" className="btn-ghost" onClick={() => setShowChallengeForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
