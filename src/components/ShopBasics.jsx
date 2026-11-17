import useLang from '../lib/useLang';

/** Who the shop is: name, place, WhatsApp number */
export default function ShopBasics({ shop, set }) {
  const { t } = useLang();
  const field = (key) => (e) => set({ [key]: e.target.value });
  return (
    <>
      <label className="field">
        <span>{t('vendor.name')}</span>
        <input type="text" value={shop.name} maxLength="60" onChange={field('name')} />
      </label>
      <label className="field">
        <span>{t('vendor.place')}</span>
        <input type="text" value={shop.place} maxLength="80" placeholder={t('vendor.placeHint')} onChange={field('place')} />
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
    </>
  );
}
