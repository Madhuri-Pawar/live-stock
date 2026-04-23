const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { initWebSocket } = require('./websocket/wsManager');
const { startStockFeed } = require('./services/stockFeed');

const app = express();
app.use(cors());
app.use(express.json());

// Serve React build in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// SPA fallback — all non-API routes return index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const server = http.createServer(app);
const { broadcast } = initWebSocket(server);
startStockFeed(broadcast);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[WS]     WebSocket accepting on ws://localhost:${PORT}`);
});
