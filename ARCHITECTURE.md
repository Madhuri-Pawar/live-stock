# Stock Dashboard — Architecture & Engineering Decisions

> **Purpose:** This document explains every problem we faced, why each pattern was chosen, and how data flows through the system — written so any developer can read it cold and understand the decisions.

---

## System at a Glance

```
[Node.js Backend]                          [React Frontend]
      │                                           │
  Stock Feed                              useWebSocket hook
  (100 ticks/sec)                         (connection lifecycle)
      │                    -                       │
  Server Throttle                         FrameScheduler
  (50ms gate/ticker)                      (rAF batching)
      │                                           │
  WS Broadcast                            Zustand Store
  (all clients)                           (per-ticker slice)
      │                                           │
      └──────── WebSocket ────────────────► Virtual List
                                           (~15 DOM rows)
```

---

## Summary

The dashboard streams live stock prices over WebSocket at ~100 ticks/sec. The core challenge is that browsers can only paint at 60fps and the DOM cannot handle 50+ rows updating simultaneously. On the backend, a fast feed broadcasting to many clients creates a flood of frames most clients cannot process. Every decision in this codebase exists to solve one of those two constraints — either protecting the browser from too many updates, or protecting the server from doing too much work per client.

---

## Problems, Approaches & Solutions


| Layer | Problem                                       | Approach / Strategy                     | Solution                                                                         | File                               |
| ----- | --------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| BE    | Feed fires 100 ticks/sec — clients flooded    | Rate limiting                           | Per-ticker 50ms timestamp gate — drop tick if sent recently                      | `wsManager.js`                     |
| BE    | New client connects and sees empty list       | Snapshot + stream                       | Send full INIT on connect, then continuous TICK updates                          | `wsManager.js`                     |
| BE    | Feed and WS transport tightly coupled         | Dependency inversion (DIP)              | Feed receives `broadcastFn` as param — never imports transport layer             | `server.js`                        |
| BE    | Slow/crashed client blocks broadcast loop     | Defensive guard                         | Check `readyState === OPEN` before every `client.send()`                         | `wsManager.js`                     |
| FE    | 100 setState/sec melts the browser            | Batching + deduplication                | `requestAnimationFrame` flush + Map collapses duplicate tickers per frame        | `frameScheduler.js`                |
| FE    | All 50 rows re-render on every price update   | Virtualization + selective subscription | Virtual scroll (15 DOM rows) + per-ticker Zustand selector per row               | `StockList.jsx`, `StockRow.jsx`    |
| FE    | Memory grows, app crashes after 2 hours       | Bounded collections + explicit cleanup  | History capped at 60 entries, all WS handlers nulled on unmount, rAF cancelled   | `stockStore.js`, `useWebSocket.js` |
| FE    | Socket recreated on every render              | Ref escape hatch                        | Callbacks stored in ref — `useEffect` dep array stays empty, socket created once | `useWebSocket.js`                  |
| FE    | 100 clients reconnect at once — server spiked | Thundering herd prevention              | Exponential backoff + random jitter spreads reconnects over time                 | `useWebSocket.js`                  |


---

## Full Data Flow (Backend → Frontend)

```
[setInterval 10ms]
    │  simulateTick() — random walk price delta
    ▼
[stockFeed.js]
    │  broadcastFn(tick) — feed knows nothing about sockets
    ▼
[wsManager.js — throttle gate]
    │  now - lastSent[ticker] < 50ms? → DROP
    │  else → lastSent[ticker] = now
    ▼
[wss.clients.forEach]
    │  skip non-OPEN clients
    │  client.send(JSON frame)
    ▼
─────────────── WebSocket wire ───────────────
    ▼
[useWebSocket hook]
    │  onmessage → parse JSON
    │  type=INIT → setStocks (full snapshot)
    │  type=TICK → onMessage(tick)
    ▼
[FrameScheduler]
    │  pending.set(ticker, tick)  ← dedup by ticker
    │  requestAnimationFrame(flush) ← schedule once per frame
    ▼
[Zustand store — updateStocks(batch)]
    │  { ...state.stocks, [ticker]: updatedData }
    │  history capped at 60 entries
    ▼
[StockList — useVirtualizer]
    │  getVirtualItems() → ~15 visible rows
    ▼
[StockRow — useStockStore(s => s.stocks[ticker])]
    │  only re-renders if this ticker's slice changed
    ▼
[Browser paint] ← 1 frame, within 16ms budget
```

---

## WebSocket Reconnection — Full Lifecycle

```
CONNECTING
    │
    ├─ success ──────────────────────► OPEN — receiving ticks
    │                                      │
    │                           server restart / network drop
    │                                      │
    │                               CLOSE (code 1006)
    │                                      │
    │                         exponential backoff + jitter
    │                                      │
    └──────────────────────────────────────┘ retry

Tab hidden ──► rAF pauses, onmessage returns early
Tab visible ──► rAF resumes, pending Map flushes in one frame

Intentional unmount ──► handlers nulled → close() → no retry
Max retries hit ──► loop stops. Page refresh required.
```

---

## Key Technical Decisions


| Concern              | Choice                       | Why                                                                   |
| -------------------- | ---------------------------- | --------------------------------------------------------------------- |
| State manager        | Zustand                      | Per-slice selectors — only changed row re-renders, no Context cascade |
| Virtual scroll       | `@tanstack/react-virtual`    | ~15 DOM nodes regardless of list size                                 |
| WS library           | Native `WebSocket` API       | No extra abstraction — full control, reconnect in ~20 lines           |
| Update batching      | `requestAnimationFrame`      | Aligns to browser paint cycle, free, pauses when tab hidden           |
| Memory bound         | Capped array slice           | Price history never exceeds 60 entries per ticker                     |
| Server throttle      | Per-ticker timestamp gate    | Prevents feed speed from controlling client load                      |
| Reconnect            | Exponential backoff + jitter | Avoids thundering herd on server restart                              |
| Callback stability   | Ref pattern                  | Socket created once, callbacks always fresh — no socket churn         |
| Feed/transport split | Dependency inversion         | Swap real market API by changing one file                             |


---

## Memory Management Checklist

- Price history capped at 60 entries per ticker — `array.slice(-59)`
- WebSocket handlers all nulled before `ws.close()` on unmount
- `FrameScheduler.destroy()` — `cancelAnimationFrame` + `pending.clear()`
- `visibilitychange` listener removed on unmount
- Reconnect `setTimeout` cleared on unmount
- Zustand selector per row — `state.stocks[ticker]` not full store
- `React.memo` with custom comparator — skips render if ticker prop unchanged

---

## Project Structure

```
stock-dashboard/
├── backend/
│   ├── src/
│   │   ├── server.js          # Bootstrap — wires feed + WS, nothing else
│   │   ├── websocket/
│   │   │   └── wsManager.js   # WS lifecycle, throttle, broadcast
│   │   └── services/
│   │       └── stockFeed.js   # Price simulation — swap here for real API
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── hooks/
    │   │   ├── useWebSocket.js    # Connection lifecycle, reconnect, cleanup
    │   │   └── useStockBuffer.js  # Bridges WS → FrameScheduler → store
    │   ├── components/
    │   │   ├── Dashboard/
    │   │   │   └── Dashboard.jsx  # Layout shell, composes hooks
    │   │   └── StockList/
    │   │       ├── StockList.jsx  # Virtual scroll container
    │   │       └── StockRow.jsx   # Single row, memo + per-ticker selector
    │   ├── store/
    │   │   └── stockStore.js      # Zustand — Record<ticker, StockData>
    │   └── utils/
    │       ├── ringBuffer.js      # Fixed-capacity circular array
    │       └── frameScheduler.js  # rAF batch flush, Map-based dedup
    └── package.json
```

