import { useState } from 'react';
import useLang from '../lib/useLang';
import { basketTotal, orderMessage, qtyLabel, rupees, whatsappUrl } from '../lib/order';
import { read, write } from '../lib/storage';

const KEY = 'aapla-bazaar-customer-v1';

export default function OrderForm({ shop, lines, onBack }) {
  const { t, name } = useLang();
  const [customer, setCustomer] = useState(() => ({
    name: '',
    address: '',
    note: '',
    ...read(KEY, {}),
    mode: shop.pickup ? 'pickup' : 'delivery',
  }));
  const [showErrors, setShowErrors] = useState(false);

  const set = (field) => (e) => setCustomer((c) => ({ ...c, [field]: e.target.value }));
  const errors = [
    !customer.name.trim() && t('order.needName'),
    customer.mode === 'delivery' && !customer.address.trim() && t('order.needAddress'),
  ].filter(Boolean);
  const url = whatsappUrl(shop.whatsapp, orderMessage({ shop, lines, customer, t, name }));

  const onSend = (e) => {
    if (errors.length > 0) {
      e.preventDefault();
      setShowErrors(true);
      return;
    }
    // Remembered on this phone only, for the next order
    write(KEY, { name: customer.name, address: customer.address });
  };

  return (
    <section className="order" aria-labelledby="order-title">
      <button type="button" className="back" onClick={onBack}>
        ← {t('order.back')}
      </button>
      <h2 id="order-title">{t('order.title')}</h2>

      <ul className="order-lines">
        {lines.map(({ item, qty, amount }) => (
          <li key={item.id}>
            <span>
              {item.icon} {name(item)} · {qtyLabel(item, qty, t)}
            </span>
            <span>{rupees(amount)}</span>
          </li>
        ))}
        <li className="order-total">
          <span>{t('order.total')}</span>
          <span>{rupees(basketTotal(lines))}</span>
        </li>
      </ul>

      <label className="field">
        <span>{t('order.name')}</span>
        <input type="text" value={customer.name} onChange={set('name')} autoComplete="name" />
      </label>

      {shop.pickup && shop.delivery && (
        <fieldset className="field">
          <legend>{t('order.how')}</legend>
          {['pickup', 'delivery'].map((mode) => (
            <label key={mode} className="choice">
              <input type="radio" name="mode" value={mode} checked={customer.mode === mode} onChange={set('mode')} />
              {t(`order.${mode}`)}
            </label>
          ))}
        </fieldset>
      )}

      {customer.mode === 'delivery' && (
        <label className="field">
          <span>{t('order.address')}</span>
          <textarea rows="2" value={customer.address} onChange={set('address')} />
        </label>
      )}

      <label className="field">
        <span>{t('order.note')}</span>
        <input type="text" value={customer.note} onChange={set('note')} placeholder={t('order.noteHint')} />
      </label>

      <p className="pay-note">💵 {t('order.pay')}</p>

      {showErrors && errors.length > 0 && (
        <ul className="errors" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <a className="primary send" href={url} target="_blank" rel="noreferrer" onClick={onSend}>
        {t('order.send')}
      </a>
      <p className="private-note">{t('order.private')}</p>
    </section>
  );
}
