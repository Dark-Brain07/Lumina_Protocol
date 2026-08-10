import { createClient } from 'genlayer-js';
import { CHAIN, CHAIN_ID, CHAIN_ID_HEX } from './chain';
import type { Address } from 'viem';

const CONTRACT_ADDRESS = (import.meta.env.VITE_LUMINA_CONTRACT_ADDRESS || '') as Address;

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

function getReadClient() {
  return createClient({ chain: CHAIN });
}

function getWriteClient(account: Address) {
  if (!window.ethereum) throw new Error('No wallet found');
  return createClient({
    chain: CHAIN,
    account,
    provider: window.ethereum,
  });
}

export async function getAccount(): Promise<string | null> {
  if (!window.ethereum) return null;
  try {
    const accounts = (await window.ethereum.request({
      method: 'eth_requestAccounts',
    })) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export async function getCurrentChainId(): Promise<number | null> {
  if (!window.ethereum) return null;
  try {
    const chainId = (await window.ethereum.request({
      method: 'eth_chainId',
    })) as string;
    return parseInt(chainId, 16);
  } catch {
    return null;
  }
}

export async function switchToStudioNet(): Promise<boolean> {
  if (!window.ethereum) return false;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: CHAIN_ID_HEX,
            chainName: CHAIN.name,
            nativeCurrency: CHAIN.nativeCurrency,
            rpcUrls: [CHAIN.rpcUrls.default.http[0]],
            blockExplorerUrls: CHAIN.blockExplorers
              ? [CHAIN.blockExplorers.default.url]
              : [],
          }],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function readContract(method: string, args: string[] = []): Promise<string> {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured');
  const client = getReadClient();
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
  });
  return result as string;
}

export async function writeContract(
  method: string,
  args: string[],
  value?: bigint
): Promise<{ hash: string }> {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured');
  if (!window.ethereum) throw new Error('No wallet found');

  const account = await getAccount();
  if (!account) throw new Error('No account connected');

  const chainId = await getCurrentChainId();
  if (chainId !== CHAIN_ID) {
    const switched = await switchToStudioNet();
    if (!switched) throw new Error('Failed to switch to StudioNet');
  }

  const client = getWriteClient(account as Address);
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
    value: value ?? 0n,
  });
  return { hash: hash as string };
}

export async function waitForReceipt(
  txHash: string
): Promise<{ status: 'success' | 'error'; data?: unknown }> {
  try {
    const client = getReadClient();
    let attempts = 0;
    while (attempts < 60) {
      try {
        const receipt = await client.getTransaction({ hash: txHash as any });
        if (receipt) {
          const status = (receipt as any).status_name || (receipt as any).statusName || String((receipt as any).status);
          const execResult = (receipt as any).execution_result || (receipt as Record<string, unknown>).result;
          
          if (status === 'FINALIZED' || status === 'ACCEPTED' || status === '3' || status === '1') {
            if (execResult === 'ERROR' || execResult === 0) {
              return { status: 'error', data: receipt };
            }
            return { status: 'success', data: receipt };
          }
          if (status === 'CANCELED' || status === 'UNDETERMINED' || status === '2' || status === '4') {
            return { status: 'error', data: receipt };
          }
        }
      } catch (e) {
        // ignore fetch errors and keep polling
      }
      attempts++;
      await new Promise(r => setTimeout(r, 2000)); // poll every 2 seconds for up to 120 seconds
    }
    console.error("waitForReceipt timeout after 120 seconds");
    return { status: 'error' };
  } catch (err) {
    console.error("waitForReceipt error:", err);
    return { status: 'error' };
  }
}

export { CONTRACT_ADDRESS };
