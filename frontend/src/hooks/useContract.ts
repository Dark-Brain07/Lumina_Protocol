import { useState, useCallback } from 'react';
import { readContract, writeContract, waitForReceipt } from '../lib/genlayer/client';
import type { TxStatus } from '../types';

export function useContractRead<T>(method: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (...args: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await readContract(method, args);
      const parsed = JSON.parse(result) as T;
      setData(parsed);
      return parsed;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Read failed';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [method]);

  return { data, loading, error, fetch };
}

export function useContractWrite(method: string) {
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const execute = useCallback(async (...args: (string | { value: bigint })[]) => {
    setTxStatus('awaiting_signature');
    setError(null);
    setTxHash(null);
    setResult(null);

    let value: bigint | undefined;
    const stringArgs: string[] = [];
    for (const a of args) {
      if (typeof a === 'object' && a !== null && 'value' in a) {
        value = a.value;
      } else {
        stringArgs.push(a as string);
      }
    }

    try {
      const { hash } = await writeContract(method, stringArgs, value);
      setTxHash(hash);
      setTxStatus('pending');

      const receipt = await waitForReceipt(hash);
      if (receipt.status === 'success') {
        setTxStatus('finalized_success');
        setResult(receipt.data);
        return receipt;
      } else {
        setTxStatus('finalized_execution_failed');
        setError('Transaction failed');
        return receipt;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Transaction failed';
      if (msg.includes('rejected') || msg.includes('denied')) {
        setTxStatus('rejected');
      } else {
        setTxStatus('finalized_execution_failed');
      }
      setError(msg);
      return null;
    }
  }, [method]);

  const reset = useCallback(() => {
    setTxStatus('idle');
    setTxHash(null);
    setError(null);
    setResult(null);
  }, []);

  return { txStatus, txHash, error, result, execute, reset };
}
