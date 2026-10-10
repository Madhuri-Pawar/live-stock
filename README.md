# 📈 Live Stock Dashboard

Real-time stock price dashboard streaming **~100 ticks/sec** over WebSocket, rendered smoothly at 60fps.

🔗 **Live demo:** [live-stock-1-rlnp.onrender.com](https://live-stock-1-rlnp.onrender.com/)

> ⏳ Hosted on Render's free tier, so the first load may take ~30–50s while the server wakes up.

## Tech Stack

**Backend:** Node.js, `ws` · **Frontend:** React, Zustand, `@tanstack/react-virtual` · **Hosting:** Render

## Highlights

- **Server throttling:** a per-ticker 50ms gate stops a 100 ticks/sec feed from flooding clients.
- **Frame-aligned batching:** `requestAnimationFrame` flushes updates once per paint and collapses duplicate tickers in each frame.
- **Virtualized rendering:** about 15 DOM rows regardless of list size, and only the changed row re-renders through per-ticker Zustand selectors.
- **Resilient reconnects:** exponential backoff with random jitter avoids a thundering herd when the server restarts.
- **Bounded memory:** price history is capped at 60 entries per ticker, and handlers and animation frames are cleaned up on unmount.

## Architecture

All design decisions, data flow, reconnection lifecycle, and memory management are documented in **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Running Locally

```bash
git clone https://github.com/Madhuri-Pawar/live-stock.git
cd live-stock

# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Then open http://localhost:5173. The backend runs on port 3001 (override it with `PORT`).
