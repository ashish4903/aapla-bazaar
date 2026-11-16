import useLang from '../lib/useLang';
import { qtyLabel, rupees } from '../lib/order';

export default function ItemRow({ item, qty, onChange }) {
  const { t, name, lang } = useLang();
  const other = lang === 'mr' ? 'en' : 'mr';
  return (
    <li className={`item${item.inStock ? '' : ' is-out'}`}>
      <span className="item-icon" aria-hidden="true">
        {item.icon}
      </span>
      <div className="item-text">
        <span className="item-name">{name(item)}</span>
        <span className="item-other" lang={other}>
          {item.name[other]}
        </span>
        <span className="item-price">
          <strong>{rupees(item.price)}</strong> / {t(`item.per.${item.unit}`)}
        </span>
      </div>
      {!item.inStock ? (
        <span className="item-out">{t('item.out')}</span>
      ) : qty > 0 ? (
        <div className="stepper">
          <button type="button" aria-label={t('item.less', { name: name(item) })} onClick={() => onChange(item, -1)}>
            −
          </button>
          <span className="stepper-qty" aria-live="polite">
            {qtyLabel(item, qty, t)}
          </span>
          <button type="button" aria-label={t('item.more', { name: name(item) })} onClick={() => onChange(item, 1)}>
            +
          </button>
        </div>
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
    </li>
  );
}
