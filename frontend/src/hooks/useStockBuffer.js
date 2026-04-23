import { useEffect, useRef, useCallback } from 'react';
import { FrameScheduler } from '../utils/frameScheduler';
import { useStockStore } from '../store/stockStore';

/**
 * Wires the WebSocket message stream to the Zustand store via the FrameScheduler.
 *
 * Returns { onMessage, onInit } — pass these to useWebSocket.
 *
 * onMessage: called per WS tick → schedules into FrameScheduler (deduped, rAF-aligned)
 * onInit:    called once on connect → sets full snapshot in store
 */
export function useStockBuffer() {
  const schedulerRef = useRef(null);

  // Pull store actions once — these are stable references from Zustand
  const updateStocks = useStockStore((s) => s.updateStocks);
  const setStocks = useStockStore((s) => s.setStocks);

  useEffect(() => {
    schedulerRef.current = new FrameScheduler((batch) => {
      updateStocks(batch);
    });

    return () => {
      schedulerRef.current?.destroy();
    };
  }, [updateStocks]);

  const onMessage = useCallback((tick) => {
    schedulerRef.current?.schedule(tick);
  }, []);

  const onInit = useCallback(
    (companies) => {
      setStocks(companies);
    },
    [setStocks]
  );

  return { onMessage, onInit };
}
