# Stock Dashboard — Frontend

This is the visual dashboard that displays live stock prices in your browser.

> **Important:** The backend server must be running before you start the frontend.
> See `backend/README.md` first.

---

## What You Need First

Make sure **Node.js** is installed on your computer.

To check, open a terminal and run:
```
node --version
```
If you see a version number (e.g. `v18.14.2`), you're good. If not, download it from [nodejs.org](https://nodejs.org) and install it.

---

## How to Set Up (First Time Only)

1. Open a **new** terminal (keep the backend terminal open and running)
2. Navigate to the frontend folder:
   ```
   cd path/to/assignment/frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
   Wait for it to finish. You only need to do this once.

---

## How to Start the Dashboard

```
npm run dev
```

You should see something like:
```
  VITE v5.4.2  ready in 300ms

  ➜  Local:   http://localhost:5173/
```

Open your browser and go to:
```
http://localhost:5173
```

You will see the live stock dashboard with prices updating in real time.

---

## How to Stop

Press `Ctrl + C` in the terminal.

---

## What You Should See

- A dark dashboard with a list of company names
- Stock prices updating live every second
- A green **Live** dot in the top right when connected to the server
- A red blinking dot when the connection is lost (it will reconnect automatically)

---

## Common Issues

**Page loads but prices don't update / red dot showing**
The backend server is not running. Go to `backend/README.md` and start it first.

**`npm install` fails**
Make sure you have an internet connection and Node.js is installed.

**Port 5173 already in use**
Run on a different port:
```
npm run dev -- --port 5174
```
Then open `http://localhost:5174` instead.
