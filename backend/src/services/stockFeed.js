const COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.',         price: 175.50 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.',      price: 142.30 },
  { ticker: 'MSFT', name: 'Microsoft Corp.',     price: 415.20 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.',     price: 185.60 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.',        price: 875.40 },
  { ticker: 'META', name: 'Meta Platforms',      price: 505.30 },
  { ticker: 'TSLA', name: 'Tesla Inc.',          price: 195.80 },
  { ticker: 'BRK',  name: 'Berkshire Hathaway', price: 395.20 },
  { ticker: 'JPM',  name: 'JPMorgan Chase',      price: 198.50 },
  { ticker: 'V',    name: 'Visa Inc.',           price: 280.30 },
  { ticker: 'JNJ',  name: 'Johnson & Johnson',   price: 158.90 },
  { ticker: 'WMT',  name: 'Walmart Inc.',        price: 68.50  },
  { ticker: 'PG',   name: 'Procter & Gamble',    price: 165.20 },
  { ticker: 'MA',   name: 'Mastercard Inc.',     price: 468.90 },
  { ticker: 'HD',   name: 'Home Depot Inc.',     price: 378.40 },
  { ticker: 'CVX',  name: 'Chevron Corp.',       price: 152.30 },
  { ticker: 'MRK',  name: 'Merck & Co.',         price: 128.60 },
  { ticker: 'ABBV', name: 'AbbVie Inc.',         price: 168.40 },
  { ticker: 'KO',   name: 'Coca-Cola Co.',       price: 62.80  },
  { ticker: 'PEP',  name: 'PepsiCo Inc.',        price: 172.50 },
  { ticker: 'BAC',  name: 'Bank of America',     price: 36.80  },
  { ticker: 'LLY',  name: 'Eli Lilly & Co.',     price: 785.60 },
  { ticker: 'AVGO', name: 'Broadcom Inc.',       price: 1385.40},
  { ticker: 'COST', name: 'Costco Wholesale',    price: 785.30 },
  { ticker: 'MCD',  name: "McDonald's Corp.",    price: 298.50 },
  { ticker: 'NFLX', name: 'Netflix Inc.',        price: 628.40 },
  { ticker: 'CRM',  name: 'Salesforce Inc.',     price: 298.70 },
  { ticker: 'ACN',  name: 'Accenture PLC',       price: 348.90 },
  { ticker: 'ADBE', name: 'Adobe Inc.',          price: 568.30 },
  { ticker: 'AMD',  name: 'AMD Inc.',            price: 168.50 },
  { ticker: 'INTC', name: 'Intel Corp.',         price: 34.20  },
  { ticker: 'QCOM', name: 'Qualcomm Inc.',       price: 178.40 },
  { ticker: 'TXN',  name: 'Texas Instruments',   price: 198.60 },
  { ticker: 'IBM',  name: 'IBM Corp.',           price: 168.30 },
  { ticker: 'ORCL', name: 'Oracle Corp.',        price: 118.50 },
  { ticker: 'NOW',  name: 'ServiceNow Inc.',     price: 798.40 },
  { ticker: 'SNOW', name: 'Snowflake Inc.',      price: 198.30 },
  { ticker: 'UBER', name: 'Uber Technologies',   price: 78.50  },
  { ticker: 'SPOT', name: 'Spotify Technology',  price: 298.40 },
  { ticker: 'SHOP', name: 'Shopify Inc.',        price: 78.50  },
  { ticker: 'PYPL', name: 'PayPal Holdings',     price: 68.40  },
  { ticker: 'COIN', name: 'Coinbase Global',     price: 198.50 },
  { ticker: 'RBLX', name: 'Roblox Corp.',        price: 48.30  },
  { ticker: 'ABNB', name: 'Airbnb Inc.',         price: 148.40 },
  { ticker: 'DASH', name: 'DoorDash Inc.',       price: 128.50 },
  { ticker: 'ZM',   name: 'Zoom Video',          price: 68.40  },
  { ticker: 'SQ',   name: 'Block Inc.',          price: 68.30  },
  { ticker: 'TWLO', name: 'Twilio Inc.',         price: 78.60  },
  { ticker: 'LYFT', name: 'Lyft Inc.',           price: 18.30  },
  { ticker: 'SAP',  name: 'SAP SE',              price: 178.20 },
];

function simulateTick() {
  const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  const volatility = company.price * 0.005; // 0.5% max swing per tick
  const delta = (Math.random() - 0.5) * 2 * volatility;
  const prevPrice = company.price;
  company.price = Math.max(0.01, parseFloat((company.price + delta).toFixed(2)));

  return {
    ticker: company.ticker,
    name: company.name,
    price: company.price,
    change: parseFloat(delta.toFixed(2)),
    changePercent: parseFloat(((delta / prevPrice) * 100).toFixed(3)),
    timestamp: Date.now(),
  };
}

function startStockFeed(broadcastFn) {
  // ~100 ticks/sec across all companies
  setInterval(() => broadcastFn(simulateTick()), 10);
}

module.exports = { startStockFeed, COMPANIES };
