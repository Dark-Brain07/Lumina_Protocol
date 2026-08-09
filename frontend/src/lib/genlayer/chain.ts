import { studionet } from 'genlayer-js/chains';

export const CHAIN = studionet;
export const CHAIN_ID = CHAIN.id;
export const CHAIN_ID_HEX = '0x' + CHAIN.id.toString(16);
export const RPC_URL = CHAIN.rpcUrls.default.http[0];

export const EXPLORER_BASE = CHAIN.blockExplorers
  ? CHAIN.blockExplorers.default.url
  : 'https://explorer-studio.genlayer.com';

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_BASE}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${EXPLORER_BASE}/address/${address}`;
}
