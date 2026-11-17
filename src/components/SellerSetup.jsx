import { useState } from 'react';
import TopBar from './TopBar';
import ShopBasics from './ShopBasics';
import ShopService from './ShopService';
import AddItems from './AddItems';
import useLang from '../lib/useLang';
import { basicProblems, shopItems, validUpi } from '../lib/shop';

const newItem = (base) => ({ id: base.id, price: 0, unit: base.unit, inStock: true, special: false });
const typedItem = (label) => ({ id: `x${Date.now().toString(36)}`, label, price: 0, unit: 'kg', inStock: true, special: false });

/** First visit only: three short steps, then the daily screen */
export default function SellerSetup({ shop, set, setItems }) {
  const { t, name } = useLang();
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  const problems =
    step === 1
      ? basicProblems(shop)
      : step === 2
        ? shop.items.length === 0
          ? ['setup.needOne']
          : []
        : shop.upi.trim() && !validUpi(shop.upi.trim())
          ? ['vendor.badUpi']
          : [];

  const go = (next) => {
    setShowErrors(false);
    setStep(next);
    document.documentElement.scrollTop = 0;
  };
  const onNext = () => {
    if (problems.length > 0) return setShowErrors(true);
    if (step === 3) return set({ setupDone: true });
    go(step + 1);
  };

  return (
    <>
      <header className="hero">
        <TopBar />
        <p className="kicker-light">{t('setup.step', { n: step })}</p>
        <h1>{t(`setup.s${step}`)}</h1>
        <div className="progress" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= step ? 'is-done' : ''} />
          ))}
        </div>
      </header>

      <main>
        <section className="card">
          {step === 1 && <ShopBasics shop={shop} set={set} />}
          {step === 2 && (
            <>
              <p>{t('setup.s2hint')}</p>
              {shop.items.length > 0 && (
                <div className="chips wrap">
                  {shopItems(shop).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="chip is-chosen"
                      aria-label={t('vendor.remove', { name: name(item) })}
                      onClick={() => setItems((list) => list.filter((it) => it.id !== item.id))}
                    >
                      <span aria-hidden="true">{item.icon}</span> {name(item)} ✕
                    </button>
                  ))}
                </div>
              )}
              <AddItems
                taken={new Set(shop.items.map((item) => item.id))}
                onAdd={(base) => setItems((list) => [...list, newItem(base)])}
                onAddCustom={(label) => setItems((list) => [...list, typedItem(label)])}
              />
            </>
          )}
          {step === 3 && <ShopService shop={shop} set={set} />}
        </section>

        {showErrors && problems.length > 0 && (
          <ul className="errors" role="alert">
            {problems.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        )}
      </main>

      <div className="dock">
        {step > 1 && (
          <button type="button" className="ghost" onClick={() => go(step - 1)}>
            ← {t('order.back')}
          </button>
        )}
        <button type="button" className="primary wide" onClick={onNext}>
          {step === 3 ? t('setup.finish') : `${t('setup.next')} →`}
        </button>
      </div>
    </>
  );
}
