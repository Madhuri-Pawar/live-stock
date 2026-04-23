const WebSocket = require('ws');
const { COMPANIES } = require('../services/stockFeed');

const THROTTLE_MS = 50; // max 1 update per ticker per 50ms → 20 updates/sec/ticker to clients

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  const lastSent = new Map(); // ticker → timestamp of last broadcast

  function broadcast(tick) {
    const now = Date.now();
    const last = lastSent.get(tick.ticker) || 0;

    // Server-side throttle: drop if this ticker was sent too recently
    if (now - last < THROTTLE_MS) return;
    lastSent.set(tick.ticker, now);

    const frame = JSON.stringify({ type: 'TICK', data: tick });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(frame);
      }
    });
  }

  wss.on('connection', (ws) => {
    console.log(`[WS] Client connected — total: ${wss.clients.size}`);

    // Send current snapshot so client renders immediately without waiting for ticks
    ws.send(JSON.stringify({ type: 'INIT', data: COMPANIES }));

    ws.on('error', (err) => {
      console.error('[WS] Client error:', err.message);
      ws.terminate();
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected — total: ${wss.clients.size}`);
    });
  });

  return { broadcast };
}

module.exports = { initWebSocket };
