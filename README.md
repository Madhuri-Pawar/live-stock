# 📈 Live Stock Dashboard

Real-time stock price dashboard streaming **~100 ticks/sec** over WebSocket, rendered smoothly at 60fps.

🔗 **Live demo:** [live-stock-1-rlnp.onrender.com](https://live-stock-1-rlnp.onrender.com/)

> ⏳ Hosted on Render's free tier, so the first load may take ~30–50s while the server wakes up.

## Tech Stack

**Backend:** Node.js, `ws` · **Frontend:** React, Zustand, `@tanstack/react-virtual` · **Hosting:** Render

## Architecture

All design decisions, data flow, reconnection lifecycle, and memory management are documented in **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Running Locally

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd stock-dashboard

# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```
