import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStockStore } from '../../store/stockStore';
import StockRow from './StockRow';
import styles from './StockList.module.css';

const ROW_HEIGHT = 56;
const OVERSCAN = 5; // render N extra rows above/below viewport to reduce scroll blank flicker

/**
 * Virtual scrolling container.
 *
 * Key pattern: StockList subscribes ONLY to `tickers` (the ordered array).
 * This component re-renders only when tickers are added/removed — not on price updates.
 *
 * Each StockRow subscribes to its own ticker slice in the store, so only
 * the affected row re-renders when a price changes. With 50 companies and
 * 20 visible rows, a price update re-renders exactly 1 row out of 50.
 */
export default function StockList() {
  const parentRef = useRef(null);
  const tickers = useStockStore((s) => s.tickers);

  const virtualizer = useVirtualizer({
    count: tickers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={styles.container}>
      {/* Total height spacer — virtualizer needs this to make the scrollbar correct */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualItems.map((item) => (
          <StockRow
            key={tickers[item.index]}
            ticker={tickers[item.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${item.size}px`,
              transform: `translateY(${item.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
