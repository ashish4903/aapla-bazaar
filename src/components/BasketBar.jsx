import useLang from '../lib/useLang';
import { basketTotal, rupees } from '../lib/order';

export default function BasketBar({ lines, onOrder }) {
  const { t } = useLang();
  if (lines.length === 0) return null;
  return (
    <div className="basket-bar">
      <span className="basket-summary">
        {t('basket.items', { n: lines.length })} · <strong>{rupees(basketTotal(lines))}</strong>
      </span>
      <button type="button" className="primary" onClick={onOrder}>
        {t('basket.order')} →
      </button>
    </div>
  );
}
