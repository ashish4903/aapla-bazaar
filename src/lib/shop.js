import { catalogueItem } from './catalogue';

/**
 * A shop lives in two places only: on the vendor's phone (localStorage) and
 * inside the link the vendor shares (`#/s/<code>`). Nothing about a real shop
 * is ever in this repository or on a server. When a database is added, only
 * this file changes.
 *
 * Stored item: { id, price, unit, inStock, special, label? }. `label` is the
 * name of an item the vendor typed that is not in the catalogue.
 *
 * The vendor's copy also keeps `setupDone`, `sentAt`, `sentCode` and
 * `lastPrices`; those never go into the link.
 */
export const UNITS = ['kg', 'bunch', 'piece', 'dozen'];

/** Loose produce is sold from a quarter kilo; everything else by the one */
export const stepOf = (item) => (item.unit === 'kg' ? 0.25 : 1);

export const emptyShop = () => ({
  name: '',
  place: '',
  whatsapp: '',
  upi: '',
  pickup: true,
  delivery: false,
  open: true,
  hours: '',
  note: '',
  deliveryCharge: 0,
  minOrder: 0,
  items: [],
});

/** An Indian mobile number as WhatsApp wants it (91 + 10 digits), or '' */
export function whatsappDigits(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return '';
}

export const validUpi = (id) => /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(id);

/** Items ready to show: catalogue name and picture plus the shop's price */
export function shopItems(shop) {
  return shop.items.map((item) => {
    const base = catalogueItem(item.id);
    return {
      id: item.id,
      icon: base?.icon ?? '🧺',
      cat: base?.cat ?? 'other',
      name: base?.name ?? { mr: item.label, en: item.label },
      price: item.price,
      unit: item.unit,
      inStock: item.inStock,
      special: Boolean(item.special),
    };
  });
}

/** Baskets and past orders are kept per shop */
export const shopKey = (shop) => whatsappDigits(shop.whatsapp) || shop.name;

/** What stops the first setup step, as i18n keys */
export function basicProblems(shop) {
  return [!shop.name.trim() && 'vendor.needName', !whatsappDigits(shop.whatsapp) && 'vendor.needWhatsapp'].filter(
    Boolean,
  );
}

/** What stops a shop from being shared, as i18n keys */
export function shopProblems(shop) {
  return [
    ...basicProblems(shop),
    shop.upi.trim() && !validUpi(shop.upi.trim()) && 'vendor.badUpi',
    !shop.items.some((item) => item.price > 0) && 'vendor.needItems',
  ].filter(Boolean);
}

/** A day as a number, 20261116, in the phone's own time zone */
export const todayStamp = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

const locale = (lang) => (lang === 'mr' ? 'mr-IN' : 'en-IN');

export function dateText(stamp, lang) {
  const date = new Date(Math.floor(stamp / 10000), (Math.floor(stamp / 100) % 100) - 1, stamp % 100);
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short' }).format(date);
}

export const timeText = (ms, lang) =>
  new Intl.DateTimeFormat(locale(lang), { hour: 'numeric', minute: '2-digit' }).format(new Date(ms));

const toBase64Url = (text) => {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (code) => {
  const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

const money = (value) => (Number.isFinite(value) && value > 0 && value <= 100000 ? value : 0);

/**
 * The shop as a short code for a link. Items without a price are left out.
 * [1, name, place, whatsapp, modes, upi, day,
 *  [[id, price, unit, flags, label?]],   flags: 1 in stock, 2 today's special
 *  [open, hours, note, deliveryCharge, minOrder]]
 */
export function encodeShop(shop, stamp = todayStamp()) {
  const upi = shop.upi.trim();
  return toBase64Url(
    JSON.stringify([
      1,
      shop.name.trim(),
      shop.place.trim(),
      whatsappDigits(shop.whatsapp),
      (shop.pickup ? 1 : 0) | (shop.delivery ? 2 : 0),
      validUpi(upi) ? upi : '',
      stamp,
      shop.items
        .filter((item) => item.price > 0)
        .map((item) => {
          const cells = [item.id, item.price, UNITS.indexOf(item.unit), (item.inStock ? 1 : 0) | (item.special ? 2 : 0)];
          return catalogueItem(item.id) ? cells : [...cells, item.label];
        }),
      [shop.open ? 1 : 0, shop.hours.trim(), shop.note.trim(), money(shop.deliveryCharge), money(shop.minOrder)],
    ]),
  );
}

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/** A link's code back into a shop, or null. Anyone can type a link, so every field is checked. */
export function decodeShop(code) {
  try {
    const data = JSON.parse(fromBase64Url(code));
    if (!Array.isArray(data) || data[0] !== 1 || !Array.isArray(data[7])) return null;

    const items = [];
    const seen = new Set();
    for (const cells of data[7].slice(0, 200)) {
      if (!Array.isArray(cells)) continue;
      const [id, price, unit, flags, label] = cells;
      const known = typeof id === 'string' && catalogueItem(id);
      if (typeof id !== 'string' || !id || id.length > 24 || seen.has(id)) continue;
      if (!Number.isFinite(price) || price <= 0 || price > 100000 || !UNITS[unit]) continue;
      if (!known && !text(label, 40)) continue;
      seen.add(id);
      items.push({
        id,
        price,
        unit: UNITS[unit],
        inStock: (flags & 1) === 1,
        special: (flags & 2) === 2,
        ...(known ? {} : { label: text(label, 40) }),
      });
    }

    const modes = Number.isInteger(data[4]) ? data[4] : 1;
    const upi = text(data[5], 60);
    const extra = Array.isArray(data[8]) ? data[8] : [];
    const delivery = (modes & 2) === 2;
    const shop = {
      name: text(data[1], 60),
      place: text(data[2], 80),
      whatsapp: whatsappDigits(data[3]),
      upi: validUpi(upi) ? upi : '',
      pickup: (modes & 1) === 1 || !delivery,
      delivery,
      open: extra[0] !== 0,
      hours: text(extra[1], 40),
      note: text(extra[2], 80),
      deliveryCharge: delivery ? money(extra[3]) : 0,
      minOrder: delivery ? money(extra[4]) : 0,
      date: Number.isInteger(data[6]) ? data[6] : 0,
      items,
    };
    return shop.name && shop.whatsapp && items.length > 0 ? shop : null;
  } catch {
    return null;
  }
}

/** Opens the customer's UPI app with the shop and amount filled in */
export const upiUrl = (shop, amount) =>
  `upi://pay?pa=${encodeURIComponent(shop.upi)}&pn=${encodeURIComponent(shop.name)}&am=${amount.toFixed(2)}&cu=INR`;

export const callUrl = (shop) => `tel:+${shop.whatsapp}`;
