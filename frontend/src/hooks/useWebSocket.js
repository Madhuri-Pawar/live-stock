import { useEffect, useRef, useState } from 'react';

const WS_URL = import.meta.env.DEV
  ? 'ws://localhost:3001'
  : `wss://${window.location.host}`;
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Manages a single WebSocket connection with:
 *  - Exponential backoff + jitter on disconnect
 *  - Page Visibility API: pauses processing when tab is hidden, resumes on focus
 *  - Explicit cleanup on unmount to prevent reconnect loops
 *  - Stable callbacks via ref — WS is created once, not on every render
 */
export function useWebSocket({ onMessage, onInit }) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const timerRef = useRef(null);
  const retriesRef = useRef(0);
  const mountedRef = useRef(true);

  // Keep latest callbacks in a ref so the WS handlers always call the current version
  // without needing them as useEffect dependencies (which would recreate the socket)
  const callbacksRef = useRef({ onMessage, onInit });
  useEffect(() => {
    callbacksRef.current = { onMessage, onInit };
  });

  useEffect(() => {
    mountedRef.current = true;

    function connect() {
      if (!mountedRef.current) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        retriesRef.current = 0;
        setIsConnected(true);
        console.log('[WS] Connected');
      };

      ws.onmessage = (event) => {
        // Skip processing when tab is not visible — buffer fills up, flushes on next rAF
        if (document.hidden) return;

        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        if (msg.type === 'INIT') callbacksRef.current.onInit(msg.data);
        else if (msg.type === 'TICK') callbacksRef.current.onMessage(msg.data);
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        console.log(`[WS] Closed (code ${event.code})`);

        if (retriesRef.current >= MAX_RETRIES) {
          console.warn('[WS] Max retries reached, giving up');
          return;
        }

        // Exponential backoff: 1s → 2s → 4s … capped at 30s + random jitter
        // Jitter prevents thundering herd when a server restarts with many clients
        // Jitter-connect client one by one with delay random jitter (ms)
        const delay =
          Math.min(BASE_DELAY_MS * 2 ** retriesRef.current, 30_000) +
          Math.random() * 1000;
        retriesRef.current++;
        console.log(`[WS] Reconnecting in ${Math.round(delay)}ms (attempt ${retriesRef.current})`);
        timerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close(); // onclose fires next, handles retry
    }

    connect();

    // Resume data processing when user switches back to this tab
    const handleVisibility = () => {
      if (!document.hidden && wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);

      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect trigger on intentional close
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, []); // empty — connect once, callbacks stay fresh via ref

  return { isConnected };
}
