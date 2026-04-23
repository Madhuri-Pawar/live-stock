import { useStockBuffer } from '../../hooks/useStockBuffer';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useStockStore } from '../../store/stockStore';
import StockList from '../StockList/StockList';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { onMessage, onInit } = useStockBuffer();
  const { isConnected } = useWebSocket({ onMessage, onInit });
  const count = useStockStore((s) => s.tickers.length);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Live Stock Dashboard</h1>
          <span className={styles.subtitle}>{count} companies</span>
        </div>

        <div className={styles.statusGroup}>
          <span className={`${styles.dot} ${isConnected ? styles.dotOnline : styles.dotOffline}`} />
          <span className={styles.statusText}>
            {isConnected ? 'Live' : 'Reconnecting…'}
          </span>
        </div>
      </header>

      <div className={styles.tableHeader}>
        <span>Ticker</span>
        <span>Company</span>
        <span className={styles.right}>Price</span>
        <span className={styles.right}>Change</span>
        <span className={styles.right}>Change %</span>
      </div>

      <StockList />
    </div>
  );
}
