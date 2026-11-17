import useLang from '../lib/useLang';
import { basketTotal, rupees } from '../lib/order';

export default function BasketBar({ lines, onOrder }) {
  const { t } = useLang();
  if (lines.length === 0) return null;
  const total = basketTotal(lines);
  return (
    <div className="basket-bar">
      {/* The key restarts the bump each time the total changes */}
      <span key={total} className="basket-summary">
        {t('basket.items', { n: lines.length })} · <strong>{rupees(total)}</strong>
      </span>
      <button type="button" className="primary" onClick={onOrder}>
        {t('basket.order')} →
      </button>
    </div>
  );
}
