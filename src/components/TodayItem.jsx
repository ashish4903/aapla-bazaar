import useLang from '../lib/useLang';
import { rupees } from '../lib/order';

const STEP = 5;

/** One row of the seller's daily list: price up/down, today's special, sold out */
export default function TodayItem({ item, last, onChange }) {
  const { t, name } = useLang();
  const label = name(item);
  const setPrice = (price) => onChange({ price: Math.max(0, Math.round(price * 100) / 100) });
  return (
    <li className={`today-item${item.inStock ? '' : ' is-out'}`}>
      <span className="item-icon" aria-hidden="true">
        {item.icon}
      </span>
      <div className="item-text">
        <span className="item-name">{label}</span>
        {last > 0 && last !== item.price && <span className="item-other">{t('today.last', { amount: rupees(last) })}</span>}
      </div>
      <button
        type="button"
        className="star"
        aria-pressed={item.special}
        aria-label={t('today.special', { name: label })}
        onClick={() => onChange({ special: !item.special })}
      >
        {item.special ? '★' : '☆'}
      </button>
      <label className="switch">
        <input
          type="checkbox"
          checked={item.inStock}
          aria-label={t('vendor.stockLabel', { name: label })}
          onChange={(e) => onChange({ inStock: e.target.checked })}
        />
      </label>

      <div className="price-row">
        <button type="button" aria-label={t('today.down', { name: label })} onClick={() => setPrice(item.price - STEP)}>
          −{STEP}
        </button>
        <span className="price-box">
          ₹
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            aria-label={t('vendor.price', { name: label })}
            value={item.price || ''}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
          />
          <small>/ {t(`item.per.${item.unit}`)}</small>
        </span>
        <button type="button" aria-label={t('today.up', { name: label })} onClick={() => setPrice(item.price + STEP)}>
          +{STEP}
        </button>
      </div>
    </li>
  );
}
