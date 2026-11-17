import TopBar from './TopBar';
import AddItems from './AddItems';
import useLang from '../lib/useLang';
import { UNITS, shopItems } from '../lib/shop';

/** What the shop sells: add, remove, and the unit each item is sold by */
export default function SellerItems({ shop, setItems }) {
  const { t, name } = useLang();
  const items = shopItems(shop);
  const patch = (id, change) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...change } : it)));

  return (
    <>
      <header className="hero">
        <TopBar />
        <h1>{t('items.title')}</h1>
        <p className="hero-text">{t('items.text')}</p>
      </header>

      <main className="seller">
        <section className="card">
          {items.length === 0 ? (
            <p className="empty">{t('vendor.noItems')}</p>
          ) : (
            <ul className="my-items">
              {items.map((item) => (
                <li key={item.id}>
                  <span className="item-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="item-name">{name(item)}</span>
                  <select
                    aria-label={t('vendor.unit', { name: name(item) })}
                    value={item.unit}
                    onChange={(e) => patch(item.id, { unit: e.target.value })}
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        / {t(`item.per.${unit}`)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="remove"
                    aria-label={t('vendor.remove', { name: name(item) })}
                    onClick={() => setItems((list) => list.filter((it) => it.id !== item.id))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="add">
          <h2 id="add">{t('vendor.add')}</h2>
          <AddItems
            taken={new Set(shop.items.map((item) => item.id))}
            onAdd={(base) =>
              setItems((list) => [...list, { id: base.id, price: 0, unit: base.unit, inStock: true, special: false }])
            }
            onAddCustom={(label) =>
              setItems((list) => [
                ...list,
                { id: `x${Date.now().toString(36)}`, label, price: 0, unit: 'kg', inStock: true, special: false },
              ])
            }
          />
        </section>
      </main>
    </>
  );
}
