import { memo } from 'react';
import { useStockStore } from '../../store/stockStore';
import styles from './StockRow.module.css';

const StockRow = memo(
  function StockRow({ ticker, style }) {
    const stock = useStockStore((s) => s.stocks[ticker]);

    if (!stock) return null;

    const positive = stock.change >= 0;
    const sign = positive ? '+' : '';

    return (
      <div style={style} className={styles.row}>
        <span className={styles.ticker}>{stock.ticker}</span>
        <span className={styles.name}>{stock.name}</span>
        <span className={`${styles.price} ${positive ? styles.up : styles.down}`}>
          ${stock.price.toFixed(2)}
        </span>
        <span className={`${styles.change} ${positive ? styles.up : styles.down}`}>
          {sign}{stock.change.toFixed(2)}
        </span>
        <span className={`${styles.changePct} ${positive ? styles.up : styles.down}`}>
          {sign}{stock.changePercent.toFixed(2)}%
        </span>
      </div>
    );
  },
  // Custom comparator: skip re-render if ticker didn't change
  // (price change is handled by the Zustand selector above)
  (prev, next) => prev.ticker === next.ticker
);

export default StockRow;
