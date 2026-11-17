import { useEffect, useMemo, useState } from 'react';
import ShopHeader from './ShopHeader';
import ItemRow from './ItemRow';
import BasketBar from './BasketBar';
import OrderForm from './OrderForm';
import OrderSent from './OrderSent';
import useLang from '../lib/useLang';
import useStored from '../lib/useStored';
import { CATEGORIES } from '../lib/catalogue';
import { shopItems, shopKey } from '../lib/shop';
import { basketLines, changeQty, setQty } from '../lib/order';
import { write } from '../lib/storage';
import { BASKETS_KEY, LAST_ORDERS_KEY, LAST_SHOP_KEY } from '../lib/keys';

/** What a customer sees: the shop a link carries */
export default function ShopView({ shop, code }) {
  const { t } = useLang();
  const items = useMemo(() => shopItems(shop), [shop]);
  const key = shopKey(shop);
  const [baskets, setBaskets] = useStored(BASKETS_KEY, {});
  const [lastOrders, setLastOrders] = useStored(LAST_ORDERS_KEY, {});
  const [step, setStep] = useState('browse'); // browse | order | sent
  const [paid, setPaid] = useState(0);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  // So the home page can offer this shop again
  useEffect(() => {
    write(LAST_SHOP_KEY, code);
  }, [code]);

  const closed = !shop.open;
  const basket = baskets[key] ?? {};
  const setBasket = (change) => setBaskets((all) => ({ ...all, [key]: change(all[key] ?? {}) }));
  const onChange = (item, direction) => setBasket((b) => changeQty(b, item, direction));
  const onSet = (item, qty) => setBasket((b) => setQty(b, item, qty));
  const lines = closed ? [] : basketLines(items, basket);

  const last = lastOrders[key];
  const canRepeat = !closed && lines.length === 0 && last && basketLines(items, last).length > 0;

  const cats = CATEGORIES.filter((c) => items.some((item) => item.cat === c));
  const q = query.trim().toLowerCase();
  const filtering = q !== '' || cat !== 'all';
  const shown = items.filter(
    (item) =>
      (cat === 'all' || item.cat === cat) &&
      (!q || item.name.mr.toLowerCase().includes(q) || item.name.en.toLowerCase().includes(q)),
  );
  // Unfiltered: today's specials first, then the rest by kind
  const groups = filtering
    ? [{ key: 'found', items: shown }]
    : [
        { key: 'special', title: `★ ${t('shop.special')}`, items: items.filter((item) => item.special) },
        ...cats.map((c) => ({ key: c, title: t(`cat.${c}`), items: items.filter((item) => item.cat === c && !item.special) })),
      ].filter((group) => group.items.length > 0);

  const onSent = (total) => {
    setPaid(total);
    setLastOrders((all) => ({ ...all, [key]: basket }));
    setBasket(() => ({}));
    setStep('sent');
  };

  let body;
  if (step === 'sent') {
    body = <OrderSent shop={shop} amount={paid} onBack={() => setStep('browse')} />;
  } else if (step === 'order' && lines.length > 0) {
    body = <OrderForm shop={shop} lines={lines} onChange={onChange} onBack={() => setStep('browse')} onSent={onSent} />;
  } else {
    body = (
      <section aria-labelledby="today">
        <h2 id="today">{t('shop.today')}</h2>

        {closed && (
          <p className="notice" role="status">
            {t('shop.closedNote')}
          </p>
        )}

        <div className="toolbar">
          <input
            type="search"
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`🔍 ${t('shop.search')}`}
            aria-label={t('shop.search')}
          />
          {cats.length > 1 && (
            <div className="chips">
              {['all', ...cats].map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {t(`cat.${c}`)}
                </button>
              ))}
            </div>
          )}
        </div>

        {canRepeat && (
          <button type="button" className="repeat" onClick={() => setBasket(() => last)}>
            🔁 {t('shop.repeat')}
          </button>
        )}

        {shown.length === 0 && <p className="empty">{t('shop.noMatch')}</p>}
        {groups.map((group) => (
          <div key={group.key} className="group">
            {group.title && groups.length > 1 && <h3>{group.title}</h3>}
            <ul className="items">
              {group.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  qty={closed ? 0 : (basket[item.id] ?? 0)}
                  closed={closed}
                  onChange={onChange}
                  onSet={onSet}
                />
              ))}
            </ul>
          </div>
        ))}
      </section>
    );
  }

  const browsing = step === 'browse' || (step === 'order' && lines.length === 0);
  return (
    <>
      <ShopHeader shop={shop} />
      <main>{body}</main>
      {browsing && <BasketBar shop={shop} lines={lines} onOrder={() => setStep('order')} />}
    </>
  );
}
