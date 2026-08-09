import { Outlet, Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { Zap, Plus, User, BarChart3 } from 'lucide-react';

export function Layout() {
  const wallet = useWallet();
  const location = useLocation();

  const navLinks = [
    { to: '/bounties', label: 'Bounties', icon: Zap },
    { to: '/bounties/new', label: 'Create', icon: Plus },
    { to: '/protocol', label: 'Protocol', icon: BarChart3 },
  ];

  return (
    <>
      <div className="env-gradient" />
      <header className="masthead">
        <div className="masthead-inner">
          <Link to="/" className="masthead-brand">
            <span className="brand-mark">C</span>
            <span className="brand-text">LUMINA</span>
          </Link>

          <nav className="masthead-nav">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${location.pathname === to ? 'active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="masthead-actions">
            <div className="studionet-seal">
              <span className="seal-dot" />
              StudioNet
            </div>

            {wallet.isConnected ? (
              <div className="wallet-pill">
                {!wallet.isCorrectNetwork && (
                  <button className="switch-btn" onClick={wallet.switchNetwork}>
                    Switch Network
                  </button>
                )}
                <Link to="/account" className="wallet-address">
                  <User size={14} />
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </Link>
              </div>
            ) : wallet.hasWallet ? (
              <button className="connect-btn" onClick={wallet.connect}>
                Connect Wallet
              </button>
            ) : (
              <span className="no-wallet">No Wallet</span>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>LUMINA PROTOCOL</span>
        <span className="footer-sep">|</span>
        <span>GenLayer StudioNet 61999</span>
      </footer>
    </>
  );
}
