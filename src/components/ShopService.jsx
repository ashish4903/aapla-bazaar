import useLang from '../lib/useLang';

const amount = (e) => Math.max(0, Number(e.target.value) || 0);

/** How customers are served: pickup or delivery, charges, timings, UPI */
export default function ShopService({ shop, set }) {
  const { t } = useLang();
  return (
    <>
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

      {shop.delivery && (
        <div className="field-pair">
          <label className="field">
            <span>{t('vendor.charge')}</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="0"
              value={shop.deliveryCharge || ''}
              onChange={(e) => set({ deliveryCharge: amount(e) })}
            />
          </label>
          <label className="field">
            <span>{t('vendor.minOrder')}</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="0"
              value={shop.minOrder || ''}
              onChange={(e) => set({ minOrder: amount(e) })}
            />
          </label>
        </div>
      )}

      <label className="field">
        <span>{t('vendor.hours')}</span>
        <input
          type="text"
          value={shop.hours}
          maxLength="40"
          placeholder={t('vendor.hoursHint')}
          onChange={(e) => set({ hours: e.target.value })}
        />
      </label>
      <label className="field">
        <span>{t('vendor.upi')}</span>
        <input
          type="text"
          inputMode="email"
          autoCapitalize="none"
          value={shop.upi}
          maxLength="60"
          onChange={(e) => set({ upi: e.target.value })}
        />
        <small>{t('vendor.upiHint')}</small>
      </label>
    </>
  );
}
