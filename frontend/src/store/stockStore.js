import { create } from 'zustand';

const MAX_HISTORY = 60; // price history points kept per ticker

export const useStockStore = create((set) => ({
  stocks: {},    // Record<ticker, StockData>
  tickers: [],   // ordered array — drives virtual list row count

  // Called once on WS INIT with the full company snapshot
  setStocks: (companies) => {
    const stocks = {};
    const tickers = [];
    companies.forEach((c) => {
      tickers.push(c.ticker);
      stocks[c.ticker] = {
        ticker: c.ticker,
        name: c.name,
        price: c.price,
        prevPrice: c.price,
        change: 0,
        changePercent: 0,
        history: [],
        updatedAt: Date.now(),
      };
    });
    set({ stocks, tickers });
  },

  // Called once per animation frame with a Map<ticker, latestTick>
  updateStocks: (batch) => {
    set((state) => {
      const next = { ...state.stocks };

      batch.forEach((tick, ticker) => {
        const existing = next[ticker];
        if (!existing) return;

        // Bound history array — prevents unbounded memory growth over long sessions
        const history =
          existing.history.length >= MAX_HISTORY
            ? existing.history.slice(-(MAX_HISTORY - 1))
            : existing.history;

        next[ticker] = {
          ...existing,
          prevPrice: existing.price,
          price: tick.price,
          change: tick.change,
          changePercent: tick.changePercent,
          history: [...history, tick.price],
          updatedAt: tick.timestamp,
        };
      });

      return { stocks: next };
    });
  },
}));
