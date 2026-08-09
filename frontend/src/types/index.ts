export const BOUNTY_STATUS = {
  DRAFT: 0, OPEN: 1, SUBMITTED: 2, ACTIVE: 3,
  PAUSED: 4, EXHAUSTED: 5, EXPIRED: 6, CLOSED: 7,
} as const;

export const BOUNTY_STATUS_LABEL: Record<number, string> = {
  0: 'Draft', 1: 'Open', 2: 'Submitted', 3: 'Active',
  4: 'Paused', 5: 'Exhausted', 6: 'Expired', 7: 'Closed',
};

export const CONTRIB_STATUS = {
  NONE: 0, SUBMITTED: 1, ACCEPTED: 2, REJECTED: 3,
} as const;

export const REVIEW_STATUS = {
  REQUESTED: 0, EVIDENCE_FROZEN: 1, EVALUATING: 2,
  PROPOSED: 3, FINALIZED: 4, CHALLENGED: 5, VOIDED: 6,
} as const;

export const REVIEW_STATUS_LABEL: Record<number, string> = {
  0: 'Requested', 1: 'Evidence Frozen', 2: 'Evaluating',
  3: 'Proposed', 4: 'Finalized', 5: 'Challenged', 6: 'Voided',
};

export const IMPACT_TIER_LABEL: Record<number, string> = {
  0: 'No Material Delta', 1: 'Emerging', 2: 'Growing',
  3: 'Essential', 4: 'Foundational',
};

export const SOURCE_TYPES = [
  'GitHub', 'Package Registry', 'Documentation', 'Article',
  'Deployment', 'Downstream', 'Security', 'Maintainer', 'Other',
];

export const CHALLENGE_REASONS = [
  'EVIDENCE_FALSE', 'EVIDENCE_DUPLICATED', 'EVIDENCE_PRE_BASELINE',
  'SOURCE_CONTROLLED_BY_CLAIMANT', 'PRODUCTION_USE_UNVERIFIABLE',
  'ATTRIBUTION_INCORRECT', 'MANIPULATION_SIGNALS_IGNORED',
  'REWARD_EXCEEDS_BOUNDS', 'MAINTENANCE_MISCLASSIFIED',
];

export interface Bounty {
  id: string;
  sponsor: string;
  title: string;
  category: string;
  description_uri: string;
  acceptance_uri: string;
  contributor: string;
  status: number;
  created_at: number;
  submitted_at: number;
  accepted_at: number;
  initial_reward: number;
  initial_reward_released: boolean;
  lumina_pool_total: number;
  lumina_pool_remaining: number;
  lifetime_reward_cap: number;
  lifetime_reward_released: number;
  max_cycle_reward: number;
  review_interval_seconds: number;
  next_review_at: number;
  constitution_version: number;
  review_count: number;
  evidence_count: number;
  last_review_id: string;
  current_baseline_id: string;
}

export interface Contribution {
  bounty_id: string;
  contributor: string;
  deliverable_uri: string;
  repository_url: string;
  documentation_url: string;
  license_id: string;
  maintenance_commitment: string;
  submission_summary: string;
  submitted_at: number;
  accepted_at: number;
  status: number;
}

export interface EvidenceRecord {
  bounty_id: string;
  evidence_id: string;
  submitter: string;
  source_type: number;
  source_url: string;
  title: string;
  claim: string;
  observed_at: number;
  submitted_at: number;
  first_review_id: string;
  last_review_id: string;
  rewarded: boolean;
  invalidated: boolean;
  flagged: boolean;
  flag_reason: string;
}

export interface ReviewRecord {
  id: string;
  bounty_id: string;
  requester: string;
  status: number;
  requested_at: number;
  evidence_frozen_at: number;
  finalized_at: number;
  previous_baseline_id: string;
  new_baseline_id: string;
  eligible: boolean;
  impact_tier: number;
  impact_delta_bps: number;
  adoption_bps: number;
  production_usage_bps: number;
  downstream_enablement_bps: number;
  ecosystem_dependence_bps: number;
  maintenance_bps: number;
  evidence_quality_bps: number;
  manipulation_risk_bps: number;
  duplicate_impact_bps: number;
  recommended_reward: number;
  approved_reward: number;
  reason_codes: string;
  evidence_refs: string;
  summary: string;
  challenge_id: string;
}

export interface RewardRecord {
  bounty_id: string;
  reward_id: string;
  review_id: string;
  recipient: string;
  amount: number;
  reward_type: number;
  released_at: number;
  settled?: boolean;
}

export interface FundingRecord {
  bounty_id: string;
  funding_id: string;
  funder: string;
  amount: number;
  message: string;
  funded_at: number;
}

export interface ChallengeRecord {
  id: string;
  review_id: string;
  challenger: string;
  reason_code: string;
  evidence_refs: string;
  statement: string;
  bond: number;
  status: number;
  opened_at: number;
  resolved_at: number;
  original_reward: number;
  final_reward: number;
  resolution_summary: string;
}

export interface BaselineRecord {
  id: string;
  bounty_id: string;
  review_id: string;
  created_at: number;
  impact_delta_bps: number;
  adoption_bps: number;
  production_usage_bps: number;
  downstream_enablement_bps: number;
  ecosystem_dependence_bps: number;
  maintenance_bps: number;
  evidence_digest: string;
  rewarded_evidence_refs: string;
  summary: string;
}

export interface ProtocolStats {
  total_bounties: number;
  active_bounties: number;
  total_pool_funded: number;
  total_rewards_released: number;
  total_reviews: number;
  total_challenges: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}

export type TxStatus =
  | 'idle'
  | 'wallet_required'
  | 'wrong_network'
  | 'awaiting_signature'
  | 'submitted'
  | 'pending'
  | 'accepted'
  | 'awaiting_finality'
  | 'finalized_success'
  | 'finalized_execution_failed'
  | 'rejected'
  | 'timeout';
