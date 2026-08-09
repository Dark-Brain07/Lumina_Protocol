import { useWallet } from '../hooks/useWallet';
import { Link } from 'react-router-dom';
import { CHAIN_ID } from '../lib/genlayer/chain';
import { CONTRACT_ADDRESS } from '../lib/genlayer/client';
import { explorerAddressUrl } from '../lib/genlayer/chain';
import { ExternalLink } from 'lucide-react';

export function Account() {
  const wallet = useWallet();

  if (!wallet.isConnected) {
    return (
      <div className="page-account">
        <h1>Account</h1>
        <div className="empty-state">
          <p>Connect your wallet to view your account.</p>
          <button className="btn-primary" onClick={wallet.connect}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-account">
      <h1>Account</h1>
      <div className="account-card">
        <div className="account-row">
          <span className="account-label">Address</span>
          <a href={explorerAddressUrl(wallet.address!)} target="_blank" rel="noopener noreferrer" className="account-value">
            {wallet.address} <ExternalLink size={12} />
          </a>
        </div>
        <div className="account-row">
          <span className="account-label">Chain ID</span>
          <span className="account-value">{wallet.chainId}</span>
        </div>
        <div className="account-row">
          <span className="account-label">Network Status</span>
          <span className={`account-value ${wallet.isCorrectNetwork ? 'text-aqua' : 'text-coral'}`}>
            {wallet.isCorrectNetwork ? 'StudioNet Connected' : 'Wrong Network'}
          </span>
        </div>
        {!wallet.isCorrectNetwork && (
          <button className="btn-primary" onClick={wallet.switchNetwork}>
            Switch to StudioNet ({CHAIN_ID})
          </button>
        )}
        <div className="account-row">
          <span className="account-label">Contract</span>
          <span className="account-value mono">{CONTRACT_ADDRESS}</span>
        </div>
      </div>
      <Link to={`/contributor/${wallet.address}`} className="btn-secondary" style={{marginTop: '1rem', display: 'inline-flex'}}>
        View Portfolio
      </Link>
    </div>
  );
}
