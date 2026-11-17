import { useState } from 'react';
import useLang from '../lib/useLang';
import { balanceOf } from '../lib/ledger';
import { rupees, whatsappUrl } from '../lib/order';
import { dateText, todayStamp, whatsappDigits } from '../lib/shop';

/** One customer's udhari: add credit or a payment, see the last entries, send a reminder */
export default function CustomerSheet({ customer, shop, onEntry, onRemove }) {
  const { t, lang } = useLang();
  const [amount, setAmount] = useState('');
  const [removing, setRemoving] = useState(false);

  const balance = balanceOf(customer);
  const number = whatsappDigits(customer.phone);
  const value = Math.max(0, Number(amount) || 0);
  const add = (sign) => {
    if (value === 0) return;
    onEntry(sign * value);
    setAmount('');
  };
  const reminder = t('udhari.reminder', { name: customer.name, shop: shop.name, amount: rupees(balance) });

  return (
    <section className="ledger" aria-labelledby="customer-title">
      <h2 id="customer-title">{customer.name}</h2>
      <p className={`ledger-balance ${balance > 0 ? 'owes' : 'clear'}`}>
        {balance > 0
          ? t('udhari.owes', { amount: rupees(balance) })
          : balance < 0
            ? t('udhari.ahead', { amount: rupees(-balance) })
            : t('udhari.clear')}
      </p>

      <label className="field">
        <span>{t('udhari.amount')}</span>
        <span className="price-box">
          ₹
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            aria-label={t('udhari.amount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </span>
      </label>
      <div className="after-share">
        <button type="button" className="ghost danger" onClick={() => add(1)}>
          + {t('udhari.gave')}
        </button>
        <button type="button" className="primary" onClick={() => add(-1)}>
          ✓ {t('udhari.got')}
        </button>
      </div>

      {balance > 0 && number && (
        <a className="ghost wide" href={whatsappUrl(number, reminder)} target="_blank" rel="noreferrer">
          💬 {t('udhari.remind')}
        </a>
      )}

      {customer.entries.length > 0 && (
        <ul className="entries">
          {[...customer.entries]
            .reverse()
            .slice(0, 10)
            .map((entry) => (
              <li key={`${entry.at}-${entry.amount}`}>
                <span>{dateText(todayStamp(new Date(entry.at)), lang)}</span>
                <span>{entry.amount > 0 ? t('udhari.gave') : t('udhari.got')}</span>
                <strong className={entry.amount > 0 ? 'owes' : 'clear'}>{rupees(Math.abs(entry.amount))}</strong>
              </li>
            ))}
        </ul>
      )}

      {removing ? (
        <div className="after-share">
          <button type="button" className="ghost danger" onClick={onRemove}>
            {t('delete.yes')}
          </button>
          <button type="button" className="ghost" onClick={() => setRemoving(false)}>
            {t('delete.no')}
          </button>
        </div>
      ) : (
        <button type="button" className="danger-link" onClick={() => setRemoving(true)}>
          {t('customers.remove')}
        </button>
      )}
    </section>
  );
}
