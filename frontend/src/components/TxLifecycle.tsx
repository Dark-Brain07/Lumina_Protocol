import type { TxStatus } from '../types';
import { explorerTxUrl } from '../lib/genlayer/chain';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

const STATUS_CONFIG: Record<TxStatus, { label: string; color: string }> = {
  idle: { label: '', color: '' },
  wallet_required: { label: 'Wallet required', color: 'var(--electric-apricot)' },
  wrong_network: { label: 'Wrong network', color: 'var(--oxide-rose)' },
  awaiting_signature: { label: 'Awaiting signature...', color: 'var(--electric-apricot)' },
  submitted: { label: 'Submitted', color: 'var(--ghost-orchid)' },
  pending: { label: 'Pending consensus...', color: 'var(--electric-apricot)' },
  accepted: { label: 'Accepted', color: 'var(--mercury-aqua)' },
  awaiting_finality: { label: 'Awaiting finality...', color: 'var(--ion-blue)' },
  finalized_success: { label: 'Finalized', color: 'var(--mercury-aqua)' },
  finalized_execution_failed: { label: 'Execution failed', color: 'var(--plasma-coral)' },
  rejected: { label: 'Rejected', color: 'var(--plasma-coral)' },
  timeout: { label: 'Timed out', color: 'var(--oxide-rose)' },
};

interface Props {
  status: TxStatus;
  hash: string | null;
  error: string | null;
}

export function TxLifecycle({ status, hash, error }: Props) {
  if (status === 'idle') return null;

  const config = STATUS_CONFIG[status];
  const isLoading = ['awaiting_signature', 'submitted', 'pending', 'accepted', 'awaiting_finality'].includes(status);
  const isSuccess = status === 'finalized_success';
  const isError = ['finalized_execution_failed', 'rejected', 'timeout'].includes(status);

  return (
    <div className="tx-lifecycle" style={{ borderColor: config.color }} role="status" aria-live="polite">
      <div className="tx-status-row">
        {isLoading && <Loader2 size={16} className="spin" style={{ color: config.color }} />}
        {isSuccess && <CheckCircle2 size={16} style={{ color: config.color }} />}
        {isError && <XCircle size={16} style={{ color: config.color }} />}
        {status === 'wallet_required' && <Clock size={16} style={{ color: config.color }} />}
        <span style={{ color: config.color }}>{config.label}</span>
      </div>
      {hash && (
        <a
          href={explorerTxUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="tx-hash-link"
        >
          {hash.slice(0, 10)}...{hash.slice(-8)}
        </a>
      )}
      {error && <div className="tx-error">{error}</div>}
    </div>
  );
}
