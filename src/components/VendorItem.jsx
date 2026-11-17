import useLang from '../lib/useLang';
import { UNITS } from '../lib/shop';

/** One row of the vendor's rate list: price, unit, in stock, remove */
export default function VendorItem({ item, onChange, onRemove }) {
  const { t, name } = useLang();
  const label = name(item);
  return (
    <li className={`vendor-item${item.inStock ? '' : ' is-out'}`}>
      <span className="item-icon" aria-hidden="true">
        {item.icon}
      </span>
      <span className="item-name">{label}</span>
      <button type="button" className="remove" aria-label={t('vendor.remove', { name: label })} onClick={onRemove}>
        ✕
      </button>
      <div className="vendor-controls">
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
            onChange={(e) => onChange({ price: Math.max(0, Number(e.target.value) || 0) })}
          />
        </span>
        <select
          aria-label={t('vendor.unit', { name: label })}
          value={item.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              / {t(`item.per.${unit}`)}
            </option>
          ))}
        </select>
        <label className="switch">
          <input
            type="checkbox"
            checked={item.inStock}
            aria-label={t('vendor.stockLabel', { name: label })}
            onChange={(e) => onChange({ inStock: e.target.checked })}
          />
          <span>{item.inStock ? t('vendor.inStock') : t('item.out')}</span>
        </label>
      </div>
    </li>
  );
}
