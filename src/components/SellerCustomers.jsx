import { useCallback, useState } from 'react';
import TopBar from './TopBar';
import CustomerSheet from './CustomerSheet';
import Sheet from './Sheet';
import useLang from '../lib/useLang';
import useStored from '../lib/useStored';
import { addCustomer, addEntry, balanceOf, byDue, removeCustomer, totalDue } from '../lib/ledger';
import { rupees, whatsappUrl } from '../lib/order';
import { whatsappDigits } from '../lib/shop';
import { todayShare } from '../lib/share';
import { CUSTOMERS_KEY } from '../lib/keys';

/** Regular customers: send them today's rates one by one, and keep their udhari */
export default function SellerCustomers({ shop }) {
  const lang = useLang();
  const { t } = lang;
  const [customers, setCustomers] = useStored(CUSTOMERS_KEY, []);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [openId, setOpenId] = useState(null);
  const close = useCallback(() => setOpenId(null), []);

  const share = todayShare(shop, lang);
  const open = customers.find((c) => c.id === openId);
  const due = totalDue(customers);

  const onAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCustomers((list) => addCustomer(list, name, phone));
    setName('');
    setPhone('');
  };

  return (
    <>
      <header className="hero">
        <TopBar />
        <h1>{t('customers.title')}</h1>
        <p className="hero-text">{t('customers.text')}</p>
        <p className="sent-status" role="status">
          {due > 0 ? t('udhari.total', { amount: rupees(due) }) : t('udhari.none')}
        </p>
      </header>

      <main className="seller">
        <form className="card" onSubmit={onAdd}>
          <h2>{t('customers.add')}</h2>
          <label className="field">
            <span>{t('order.name')}</span>
            <input type="text" value={name} maxLength="40" onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>{t('customers.phone')}</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              maxLength="15"
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <button type="submit" className="primary wide">
            + {t('customers.addButton')}
          </button>
          <p className="private-note">{t('customers.private')}</p>
        </form>

        {customers.length === 0 ? (
          <p className="empty">{t('customers.empty')}</p>
        ) : (
          <ul className="customers">
            {byDue(customers).map((customer) => {
              const balance = balanceOf(customer);
              const number = whatsappDigits(customer.phone);
              return (
                <li key={customer.id} className="card">
                  <div className="customer-head">
                    <strong>{customer.name}</strong>
                    <span className={balance > 0 ? 'owes' : 'clear'}>
                      {balance > 0
                        ? t('udhari.owes', { amount: rupees(balance) })
                        : balance < 0
                          ? t('udhari.ahead', { amount: rupees(-balance) })
                          : t('udhari.clear')}
                    </span>
                  </div>
                  <div className="after-share">
                    <button type="button" className="ghost" onClick={() => setOpenId(customer.id)}>
                      📒 {t('udhari.open')}
                    </button>
                    {number && share.ready && (
                      <a
                        className="ghost"
                        href={whatsappUrl(number, share.message)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t('customers.sendTo', { name: customer.name })}
                      >
                        💬 {t('customers.send')}
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {open && (
        <Sheet labelledBy="customer-title" onClose={close}>
          <CustomerSheet
            customer={open}
            shop={shop}
            onEntry={(amount) => setCustomers((list) => addEntry(list, open.id, amount))}
            onRemove={() => {
              setCustomers((list) => removeCustomer(list, open.id));
              close();
            }}
          />
        </Sheet>
      )}
    </>
  );
}
