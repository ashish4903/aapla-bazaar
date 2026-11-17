import { useCallback, useEffect, useMemo, useState } from 'react';
import ShopHeader from './ShopHeader';
import ItemRow from './ItemRow';
import BasketBar from './BasketBar';
import OrderForm from './OrderForm';
import OrderSent from './OrderSent';
import ListenButton from './ListenButton';
import Sheet from './Sheet';
import useLang from '../lib/useLang';
import useStored from '../lib/useStored';
import { CATEGORIES } from '../lib/catalogue';
import { shopItems, shopKey } from '../lib/shop';
import { basketLines, changeQty, setQty } from '../lib/order';
import { write } from '../lib/storage';
import { BASKETS_KEY, FAVOURITES_KEY, LAST_ORDERS_KEY, LAST_SHOP_KEY } from '../lib/keys';

// A short buzz on phones that have one, so a tap feels answered
const buzz = () => navigator.vibrate?.(8);

/** What a customer sees: the shop a link carries */
export default function ShopView({ shop, code }) {
  const { t } = useLang();
  const items = useMemo(() => shopItems(shop), [shop]);
  const key = shopKey(shop);
  const [baskets, setBaskets] = useStored(BASKETS_KEY, {});
  const [lastOrders, setLastOrders] = useStored(LAST_ORDERS_KEY, {});
  const [favourites, setFavourites] = useStored(FAVOURITES_KEY, {});
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
  const onChange = (item, direction) => {
    buzz();
    setBasket((b) => changeQty(b, item, direction));
  };
  const onSet = (item, qty) => {
    buzz();
    setBasket((b) => setQty(b, item, qty));
  };
  const lines = closed ? [] : basketLines(items, basket);

  const favs = new Set(favourites[key] ?? []);
  const onFavourite = (item) =>
    setFavourites((all) => {
      const mine = all[key] ?? [];
      return { ...all, [key]: mine.includes(item.id) ? mine.filter((id) => id !== item.id) : [...mine, item.id] };
    });

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
  // Unfiltered: the customer's usual items, then today's specials, then the rest by kind
  const isFav = (item) => favs.has(item.id);
  const groups = filtering
    ? [{ key: 'found', items: shown }]
    : [
        { key: 'fav', title: `♥ ${t('fav.title')}`, items: items.filter(isFav) },
        { key: 'special', title: `★ ${t('shop.special')}`, items: items.filter((item) => item.special && !isFav(item)) },
        ...cats.map((c) => ({
          key: c,
          title: t(`cat.${c}`),
          items: items.filter((item) => item.cat === c && !item.special && !isFav(item)),
        })),
      ].filter((group) => group.items.length > 0);

  const onSent = (total) => {
    setPaid(total);
    setLastOrders((all) => ({ ...all, [key]: basket }));
    setBasket(() => ({}));
    setStep('sent');
  };
  const close = useCallback(() => setStep('browse'), []);

  // The order and what follows slide up over the shop; an emptied order closes itself
  const sheet = step === 'sent' ? 'sent' : step === 'order' && lines.length > 0 ? 'order' : null;

  return (
    <>
      <div inert={sheet !== null} aria-hidden={sheet !== null}>
        <ShopHeader shop={shop} />
        <main>
          <section aria-labelledby="today">
            <div className="section-head">
              <h2 id="today">{t('shop.today')}</h2>
              <ListenButton shop={shop} items={items} />
            </div>

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
              <button
                type="button"
                className="repeat"
                onClick={() => {
                  setBasket(() => last);
                  setStep('order');
                }}
              >
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
                      favourite={isFav(item)}
                      onChange={onChange}
                      onSet={onSet}
                      onFavourite={onFavourite}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </main>
        <BasketBar shop={shop} lines={lines} onOrder={() => setStep('order')} />
      </div>

      {sheet === 'order' && (
        <Sheet labelledBy="order-title" onClose={close}>
          <OrderForm shop={shop} lines={lines} onChange={onChange} onSent={onSent} />
        </Sheet>
      )}
      {sheet === 'sent' && (
        <Sheet labelledBy="sent-title" onClose={close}>
          <OrderSent shop={shop} amount={paid} onBack={close} />
        </Sheet>
      )}
    </>
  );
}
