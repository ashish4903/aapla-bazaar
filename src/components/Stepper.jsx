import useLang from '../lib/useLang';
import { qtyLabel } from '../lib/order';

export default function Stepper({ item, qty, onChange }) {
  const { t, name } = useLang();
  return (
    <div className="stepper">
      <button type="button" aria-label={t('item.less', { name: name(item) })} onClick={() => onChange(item, -1)}>
        −
      </button>
      {/* The key restarts the little pop each time the quantity changes */}
      <span key={qty} className="stepper-qty" aria-live="polite">
        {qtyLabel(item, qty, t)}
      </span>
      <button type="button" aria-label={t('item.more', { name: name(item) })} onClick={() => onChange(item, 1)}>
        +
      </button>
    </div>
  );
}
