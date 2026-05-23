import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

type AsyncLoader<T> = (signal: AbortSignal) => Promise<T>;

/**
 * Runs cancellable async reads and ignores stale responses.
 * This prevents older dashboard requests from overwriting newer state after
 * API target changes or route unmounts.
 */
export function useAsync<T>(loader: AsyncLoader<T>, deps: readonly unknown[], immediate = true) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: immediate });
  const activeController = useRef<AbortController | null>(null);
  const requestSeq = useRef(0);

  const run = useCallback(async () => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const seq = ++requestSeq.current;

    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await loader(controller.signal);
      if (!controller.signal.aborted && seq === requestSeq.current) {
        setState({ data, error: null, loading: false });
      }
      return data;
    } catch (error) {
      if (controller.signal.aborted) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unexpected error';
      if (seq === requestSeq.current) {
        setState((current) => ({ ...current, error: message, loading: false }));
      }
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!immediate) return () => undefined;
    void run().catch(() => undefined);
    return () => activeController.current?.abort();
  }, [immediate, run]);

  return useMemo(() => ({ ...state, run }), [state, run]);
}
