import { useState } from 'react';
import TopBar from './TopBar';
import VendorItem from './VendorItem';
import AddItems from './AddItems';
import ShareButton from './ShareButton';
import useLang from '../lib/useLang';
import useStored from '../lib/useStored';
import { dateText, emptyShop, encodeShop, shopItems, shopProblems, todayStamp } from '../lib/shop';
import { ratesMessage, whatsappUrl } from '../lib/order';
import { MY_SHOP_KEY } from '../lib/keys';

/** The vendor's own screen: shop details, today's rates, and the link to share */
export default function VendorView() {
  const { t, name, lang } = useLang();
  const [stored, setStored] = useStored(MY_SHOP_KEY, emptyShop());
  const [showErrors, setShowErrors] = useState(false);

  const shop = { ...emptyShop(), ...stored };
  const set = (patch) => setStored((s) => ({ ...emptyShop(), ...s, ...patch }));
  const field = (key) => (e) => set({ [key]: e.target.value });
  const setItems = (change) => setStored((s) => ({ ...emptyShop(), ...s, items: change(s.items ?? []) }));

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

  const onShare = (e) => {
    if (!ready) {
      e.preventDefault();
      setShowErrors(true);
    }
  };

  return (
    <>
      <header className="hero">
        <TopBar />
        <h1>{t('vendor.title')}</h1>
        <p className="hero-text">{t('vendor.saved')}</p>
      </header>

      <main className="vendor">
        <section className="card" aria-labelledby="details">
          <h2 id="details">{t('vendor.details')}</h2>
          <label className="field">
            <span>{t('vendor.name')}</span>
            <input type="text" value={shop.name} maxLength="60" onChange={field('name')} />
          </label>
          <label className="field">
            <span>{t('vendor.place')}</span>
            <input
              type="text"
              value={shop.place}
              maxLength="80"
              placeholder={t('vendor.placeHint')}
              onChange={field('place')}
            />
          </label>
          <label className="field">
            <span>{t('vendor.whatsapp')}</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={shop.whatsapp}
              maxLength="15"
              onChange={field('whatsapp')}
            />
            <small>{t('vendor.whatsappHint')}</small>
          </label>
          <label className="field">
            <span>{t('vendor.upi')}</span>
            <input type="text" inputMode="email" autoCapitalize="none" value={shop.upi} maxLength="60" onChange={field('upi')} />
          </label>
          <fieldset className="field">
            <legend>{t('vendor.modes')}</legend>
            <div className="choices">
              {['pickup', 'delivery'].map((mode) => (
                <label key={mode} className="choice">
                  <input type="checkbox" checked={shop[mode]} onChange={(e) => set({ [mode]: e.target.checked })} />
                  {t(`shop.${mode}`)}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="card" aria-labelledby="rates">
          <h2 id="rates">{t('vendor.rates')}</h2>
          {items.length === 0 ? (
            <p className="empty">{t('vendor.noItems')}</p>
          ) : (
            <>
              <ul className="vendor-items">
                {items.map((item) => (
                  <VendorItem
                    key={item.id}
                    item={item}
                    onChange={(patch) => setItems((list) => list.map((it) => (it.id === item.id ? { ...it, ...patch } : it)))}
                    onRemove={() => setItems((list) => list.filter((it) => it.id !== item.id))}
                  />
                ))}
              </ul>
              <p className="private-note">{t('vendor.unpriced')}</p>
            </>
          )}
        </section>

        <section className="card" aria-labelledby="add">
          <h2 id="add">{t('vendor.add')}</h2>
          <AddItems
            taken={new Set(shop.items.map((item) => item.id))}
            onAdd={(base) => setItems((list) => [...list, { id: base.id, price: 0, unit: base.unit, inStock: true }])}
            onAddCustom={(label) =>
              setItems((list) => [
                ...list,
                { id: `x${Date.now().toString(36)}`, label, price: 0, unit: 'kg', inStock: true },
              ])
            }
          />
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
        <p className="private-note">{t('vendor.daily')}</p>
      </main>

      <div className="basket-bar">
        <a
          className="primary wide"
          href={whatsappUrl('', message)}
          target="_blank"
          rel="noreferrer"
          onClick={onShare}
        >
          {t('vendor.share')}
        </a>
      </div>
    </>
  );
}
