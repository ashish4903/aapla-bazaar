import Stepper from './Stepper';
import useLang from '../lib/useLang';
import { rupees } from '../lib/order';

export default function ItemRow({ item, qty, onChange }) {
  const { t, name, lang } = useLang();
  const other = lang === 'mr' ? 'en' : 'mr';
  const state = !item.inStock ? ' is-out' : qty > 0 ? ' is-picked' : '';
  return (
    <li className={`item${state}`}>
      <span className="item-icon" aria-hidden="true">
        {item.icon}
      </span>
      <div className="item-text">
        <span className="item-name">{name(item)}</span>
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
      ) : qty > 0 ? (
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
    </li>
  );
}
