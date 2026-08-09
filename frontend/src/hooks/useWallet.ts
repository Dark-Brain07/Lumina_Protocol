import { useState, useEffect, useCallback } from 'react';
import { getAccount, getCurrentChainId, switchToStudioNet } from '../lib/genlayer/client';
import { CHAIN_ID } from '../lib/genlayer/chain';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isLoading: boolean;
  hasWallet: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: false,
    isLoading: true,
    hasWallet: false,
  });

  const refresh = useCallback(async () => {
    if (!window.ethereum) {
      setState(s => ({ ...s, hasWallet: false, isLoading: false }));
      return;
    }
    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_accounts',
      })) as string[];
      const address = accounts[0] || null;
      const chainId = await getCurrentChainId();
      setState({
        address,
        chainId,
        isConnected: !!address,
        isCorrectNetwork: chainId === CHAIN_ID,
        isLoading: false,
        hasWallet: true,
      });
    } catch {
      setState(s => ({ ...s, isLoading: false, hasWallet: true }));
    }
  }, []);

  const connect = useCallback(async () => {
    const address = await getAccount();
    if (address) {
      const chainId = await getCurrentChainId();
      setState(s => ({
        ...s,
        address,
        chainId,
        isConnected: true,
        isCorrectNetwork: chainId === CHAIN_ID,
      }));
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    const ok = await switchToStudioNet();
    if (ok) {
      setState(s => ({ ...s, chainId: CHAIN_ID, isCorrectNetwork: true }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(s => ({
      ...s,
      address: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false,
    }));
  }, []);

  useEffect(() => {
    refresh();
    if (!window.ethereum) return;

    const onAccountsChanged = () => refresh();
    const onChainChanged = () => refresh();

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', onAccountsChanged);
      window.ethereum?.removeListener('chainChanged', onChainChanged);
    };
  }, [refresh]);

  return { ...state, connect, disconnect, switchNetwork, refresh };
}
