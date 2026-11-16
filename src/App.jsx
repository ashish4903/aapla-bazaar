import { useEffect, useState } from 'react';
import LanguageProvider from './components/LanguageProvider';
import ShopHeader from './components/ShopHeader';
import ItemRow from './components/ItemRow';
import BasketBar from './components/BasketBar';
import OrderForm from './components/OrderForm';
import useLang from './lib/useLang';
import { loadShop } from './lib/shop';
import { basketLines, changeQty } from './lib/order';
import { read, write } from './lib/storage';

const BASKET_KEY = 'aapla-bazaar-basket-v1';

function Shop() {
  const { t } = useLang();
  const [shop, setShop] = useState(null);
  const [basket, setBasket] = useState(() => read(BASKET_KEY, {}));
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    loadShop().then(setShop);
  }, []);

  useEffect(() => {
    write(BASKET_KEY, basket);
  }, [basket]);

  if (!shop) return <p className="loading">{t('shop.loading')}</p>;

  const lines = basketLines(shop, basket);
  const showOrder = ordering && lines.length > 0;

  return (
    <>
      <ShopHeader shop={shop} />
      <main>
        {showOrder ? (
          <OrderForm shop={shop} lines={lines} onBack={() => setOrdering(false)} />
        ) : (
          <section aria-labelledby="today">
            <h2 id="today">{t('shop.today')}</h2>
            <ul className="items">
              {shop.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  qty={basket[item.id] ?? 0}
                  onChange={(it, dir) => setBasket((b) => changeQty(b, it, dir))}
                />
              ))}
            </ul>
          </section>
        )}
      </main>
      {!showOrder && <BasketBar lines={lines} onOrder={() => setOrdering(true)} />}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Shop />
    </LanguageProvider>
  );
}
