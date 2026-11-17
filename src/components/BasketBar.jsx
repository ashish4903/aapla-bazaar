import useLang from '../lib/useLang';
import { basketTotal, rupees, shortOfMinimum } from '../lib/order';

export default function BasketBar({ shop, lines, onOrder }) {
  const { t } = useLang();
  if (lines.length === 0) return null;
  const total = basketTotal(lines);
  const short = shortOfMinimum(shop, lines);
  return (
    <div className="dock basket-bar">
      <div className="basket-text">
        {/* The key restarts the bump each time the total changes */}
        <span key={total} className="basket-summary">
          {t('basket.items', { n: lines.length })} · <strong>{rupees(total)}</strong>
        </span>
        {short > 0 && <small>{t('basket.minHint', { amount: rupees(short) })}</small>}
      </div>
      <button type="button" className="primary" onClick={onOrder}>
        {t('basket.order')} →
      </button>
    </div>
  );
}
