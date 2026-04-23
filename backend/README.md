# Stock Dashboard — Backend

This is the server that generates live stock prices and sends them to the browser in real time.

---

## What You Need First

Before starting, make sure **Node.js** is installed on your computer.

To check, open a terminal and run:
```
node --version
```
If you see a version number (e.g. `v18.14.2`), you're good. If not, download it from [nodejs.org](https://nodejs.org) and install it.

---

## How to Set Up (First Time Only)

1. Open a terminal
2. Navigate to the backend folder:
   ```
   cd path/to/assignment/backend
   ```
3. Install dependencies (downloads required packages):
   ```
   npm install
   ```
   Wait for it to finish. You only need to do this once.

---

## How to Start the Server

```
npm run dev
```

You should see:
```
[Server] Running on http://localhost:3001
[WS]     WebSocket accepting on ws://localhost:3001
```

The server is now running. **Keep this terminal open** — closing it stops the server.

---

## How to Stop the Server

Press `Ctrl + C` in the terminal.

---

## Verify It's Working

Open your browser and go to:
```
http://localhost:3001/health
```
You should see: `{"status":"ok"}`

---

## Common Issues

**Port 3001 already in use**
Something else is running on that port. Either stop the other process, or change the port by running:
```
PORT=3002 npm run dev
```
(If you change the port, update the frontend to match.)

**`npm install` fails**
Make sure you have an internet connection and that Node.js is properly installed.
