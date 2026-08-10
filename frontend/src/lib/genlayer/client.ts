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
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash as `0x${string}` & { length: 66 },
      retries: 600,
    } as any); // cast to any to allow passing genlayer specific params if needed
    
    // GenLayer returns status as an integer (1=ACCEPTED, 3=FINALIZED, 2=CANCELED, 4=UNDETERMINED)
    const status = (receipt as Record<string, unknown>).status ?? 
      (receipt as Record<string, unknown>).statusName;
      
    if (status === 'ACCEPTED' || status === 'FINALIZED' || status === 1 || status === 3) {
      return { status: 'success', data: receipt };
    }
    if (status === 'CANCELED' || status === 'UNDETERMINED' || status === 2 || status === 4) {
      return { status: 'error', data: receipt };
    }
    
    // If it reverted (EVM 0) or is an unknown error state
    if (status === 0 || status === 'REVERTED') {
      return { status: 'error', data: receipt };
    }
    
    return { status: 'success', data: receipt };
  } catch (err) {
    console.error("waitForReceipt timeout or error:", err);
    return { status: 'error' };
  }
}

export { CONTRACT_ADDRESS };
