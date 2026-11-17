import Stepper from './Stepper';
import useLang from '../lib/useLang';
import { qtyLabel, rupees } from '../lib/order';

const QUICK_KG = [0.25, 0.5, 1, 2];

export default function ItemRow({ item, qty, closed, onChange, onSet }) {
  const { t, name, lang } = useLang();
  const other = lang === 'mr' ? 'en' : 'mr';
  const state = !item.inStock ? ' is-out' : qty > 0 ? ' is-picked' : '';
  return (
    <li className={`item${state}`}>
      <span className="item-icon" aria-hidden="true">
        {item.icon}
      </span>
      <div className="item-text">
        <span className="item-name">
          {item.special && (
            <span className="star-mark" aria-hidden="true">
              ★{' '}
            </span>
          )}
          {name(item)}
        </span>
        {item.name[other] !== name(item) && (
          <span className="item-other" lang={other}>
            {item.name[other]}
          </span>
        )}
        <span className="item-price">
          <strong>{rupees(item.price)}</strong> / {t(`item.per.${item.unit}`)}
        </span>
      </div>
      {!item.inStock ? (
        <span className="item-out">{t('item.out')}</span>
      ) : closed ? null : qty > 0 ? (
        <Stepper item={item} qty={qty} onChange={onChange} />
      ) : (
        <button
          type="button"
          className="add-button"
          aria-label={t('item.addLabel', { name: name(item) })}
          onClick={() => onChange(item, 1)}
        >
          + {t('item.add')}
        </button>
      )}

      {/* Loose produce: jump straight to the usual weights */}
      {qty > 0 && item.inStock && !closed && item.unit === 'kg' && (
        <div className="quick" role="group" aria-label={t('item.quick', { name: name(item) })}>
          {QUICK_KG.map((weight) => (
            <button key={weight} type="button" aria-pressed={qty === weight} onClick={() => onSet(item, weight)}>
              {qtyLabel(item, weight, t)}
            </button>
          ))}
          <span className="quick-amount">= {rupees(Math.round(item.price * qty * 100) / 100)}</span>
        </div>
      )}
    </li>
  );
}
