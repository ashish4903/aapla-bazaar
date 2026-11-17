import { useState } from 'react';
import TopBar from './TopBar';
import TodayItem from './TodayItem';
import ShareButton from './ShareButton';
import useLang from '../lib/useLang';
import { dateText, encodeShop, shopItems, shopProblems, timeText, todayStamp } from '../lib/shop';
import { ratesMessage, whatsappUrl } from '../lib/order';

/** The seller's daily screen: open or closed, today's prices, send */
export default function SellerToday({ shop, set, setItems }) {
  const { t, name, lang } = useLang();
  const [showErrors, setShowErrors] = useState(false);

  const items = shopItems(shop);
  const problems = shopProblems(shop);
  const ready = problems.length === 0;
  const code = ready ? encodeShop(shop) : '';
  const link = `${window.location.origin}${window.location.pathname}#/s/${code}`;
  const message = ratesMessage({
    shop,
    items: items.filter((item) => item.price > 0),
    link,
    date: dateText(todayStamp(), lang),
    t,
    name,
  });

  const sentToday = shop.sentAt > 0 && todayStamp(new Date(shop.sentAt)) === todayStamp();
  const status = !sentToday ? 'notSent' : shop.sentCode === code ? 'sent' : 'changed';

  const onSend = (e) => {
    if (!ready) {
      e.preventDefault();
      setShowErrors(true);
      return;
    }
    set({
      sentAt: Date.now(),
      sentCode: code,
      lastPrices: Object.fromEntries(shop.items.map((item) => [item.id, item.price])),
    });
  };

  return (
    <>
      <header className="hero">
        <TopBar />
        <p className="kicker-light">{dateText(todayStamp(), lang)}</p>
        <h1>{shop.name}</h1>
        <p className={`sent-status is-${status}`} role="status">
          {t(`today.${status}`, { time: sentToday ? timeText(shop.sentAt, lang) : '' })}
        </p>
      </header>

      <main className="seller">
        <section className="card">
          <label className="switch big">
            <input type="checkbox" checked={shop.open} onChange={(e) => set({ open: e.target.checked })} />
            <strong>{shop.open ? t('today.open') : t('today.closed')}</strong>
          </label>
          <label className="field">
            <span>{t('today.note')}</span>
            <input
              type="text"
              value={shop.note}
              maxLength="80"
              placeholder={t('today.noteHint')}
              onChange={(e) => set({ note: e.target.value })}
            />
          </label>
        </section>

        <section aria-labelledby="rates">
          <h2 id="rates">{t('vendor.rates')}</h2>
          <p className="hint">{t('today.hint')}</p>
          <ul className="today-items">
            {items.map((item) => (
              <TodayItem
                key={item.id}
                item={item}
                last={shop.lastPrices?.[item.id] ?? 0}
                onChange={(patch) => setItems((list) => list.map((it) => (it.id === item.id ? { ...it, ...patch } : it)))}
              />
            ))}
          </ul>
          {items.length === 0 && <p className="empty">{t('vendor.noItems')}</p>}
          <a className="ghost wide" href="#/my-shop/items">
            + {t('vendor.add')}
          </a>
        </section>

        {showErrors && !ready && (
          <ul className="errors" role="alert">
            {problems.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        )}

        {ready && (
          <div className="after-share">
            <ShareButton copyOnly url={link} label={`🔗 ${t('vendor.copy')}`} />
            <a className="ghost" href={`#/s/${code}`}>
              👁 {t('vendor.preview')}
            </a>
          </div>
        )}
      </main>

      <div className="dock above-nav">
        <a className="primary wide" href={whatsappUrl('', message)} target="_blank" rel="noreferrer" onClick={onSend}>
          {t('vendor.share')}
        </a>
      </div>
    </>
  );
}
