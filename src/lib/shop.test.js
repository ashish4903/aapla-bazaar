import { describe, expect, it } from 'vitest';
import {
  decodeBackup,
  decodeShop,
  emptyShop,
  encodeBackup,
  encodeShop,
  shopItems,
  shopProblems,
  upiUrl,
  validUpi,
  whatsappDigits,
} from './shop';
import { qrPath } from './qr';
import { addCustomer, addEntry, balanceOf, byDue, removeCustomer, totalDue } from './ledger';
import { orderMessage, orderTotals, basketLines, ratesMessage, setQty, shortOfMinimum } from './order';
import { translate } from './i18n';

// Made-up test values: the number is all zeros on purpose
const shop = {
  ...emptyShop(),
  name: ' भाजी भांडार ',
  place: 'बस स्टँडजवळ',
  whatsapp: '00000 00000',
  upi: 'shop@bank',
  delivery: true,
  hours: 'सकाळी ७ ते रात्री ८',
  note: 'आज ताजी मेथी',
  deliveryCharge: 10,
  minOrder: 100,
  items: [
    { id: 'tomato', price: 30, unit: 'kg', inStock: true, special: true },
    { id: 'methi', price: 15, unit: 'bunch', inStock: false, special: false },
    { id: 'onion', price: 0, unit: 'kg', inStock: true, special: false },
    { id: 'x1', label: 'गूळ', price: 60, unit: 'kg', inStock: true, special: false },
  ],
};
const mr = (key, vars) => translate('mr', key, vars);
const name = (thing) => (typeof thing.name === 'string' ? thing.name : thing.name.mr);

describe('shop link', () => {
  it('carries the shop through a link and back, without unpriced items', () => {
    const code = encodeShop(shop, 20261116);
    expect(code).toMatch(/^[\w-]+$/);
    expect(decodeShop(code)).toEqual({
      name: 'भाजी भांडार',
      place: 'बस स्टँडजवळ',
      whatsapp: '910000000000',
      upi: 'shop@bank',
      pickup: true,
      delivery: true,
      open: true,
      hours: 'सकाळी ७ ते रात्री ८',
      note: 'आज ताजी मेथी',
      deliveryCharge: 10,
      minOrder: 100,
      date: 20261116,
      items: [
        { id: 'tomato', price: 30, unit: 'kg', inStock: true, special: true },
        { id: 'methi', price: 15, unit: 'bunch', inStock: false, special: false },
        { id: 'x1', label: 'गूळ', price: 60, unit: 'kg', inStock: true, special: false },
      ],
    });
  });

  it('carries a closed shop, and drops delivery terms when there is no delivery', () => {
    const back = decodeShop(encodeShop({ ...shop, open: false, delivery: false }, 20261116));
    expect(back).toMatchObject({ open: false, delivery: false, pickup: true, deliveryCharge: 0, minOrder: 0 });
  });

  it('refuses a broken or made-up link', () => {
    const code = (data) => btoa(JSON.stringify(data));
    expect(decodeShop('not a link')).toBeNull();
    expect(decodeShop(code({ name: 'x' }))).toBeNull();
    // No WhatsApp number
    expect(decodeShop(code([1, 'Shop', '', '123', 1, '', 20261116, [['tomato', 30, 0, 1]]]))).toBeNull();
    // No usable item: bad price, unknown unit, unnamed item
    expect(
      decodeShop(
        code([1, 'Shop', '', '910000000000', 1, '', 20261116, [['tomato', -5, 0, 1], ['onion', 20, 9, 1], ['zz', 20, 0, 1]]]),
      ),
    ).toBeNull();
    // Odd extras fall back to safe values
    expect(
      decodeShop(code([1, 'Shop', '', '910000000000', 3, '', 20261116, [['tomato', 30, 0, 1]], ['x', 5, null, -4, 'lots']])),
    ).toMatchObject({ open: true, hours: '', note: '', deliveryCharge: 0, minOrder: 0 });
  });

  it('gives catalogue items their picture and both names, and typed items their own name', () => {
    const [tomato, , , jaggery] = shopItems(shop);
    expect(tomato).toMatchObject({ icon: '🍅', cat: 'veg', name: { mr: 'टोमॅटो', en: 'Tomato' }, price: 30, special: true });
    expect(jaggery).toMatchObject({ cat: 'other', name: { mr: 'गूळ', en: 'गूळ' } });
  });
});

describe('cheaper today', () => {
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  const priced = { ...shop, sentAt: yesterday, lastPrices: { tomato: 40, methi: 10, x1: 80 } };

  it('sends the earlier price with the link only where today is cheaper', () => {
    const back = decodeShop(encodeShop(priced, 20261116));
    expect(back.items.map((item) => [item.id, item.price, item.was])).toEqual([
      ['tomato', 30, 40],
      ['methi', 15, undefined],
      ['x1', 60, 80],
    ]);
    expect(shopItems(back).map((item) => item.was)).toEqual([40, 0, 80]);
  });

  it('keeps comparing with the earlier day after rates are sent again today', () => {
    const resent = { ...priced, sentAt: Date.now(), lastPrices: { tomato: 30 }, basePrices: { tomato: 40 } };
    expect(shopItems(resent)[0].was).toBe(40);
    expect(shopItems({ ...resent, basePrices: undefined })[0].was).toBe(0);
  });

  it('ignores an earlier price that is not higher', () => {
    const code = btoa(JSON.stringify([1, 'Shop', '', '910000000000', 1, '', 20261116, [['tomato', 30, 0, 1, 0, 30], ['onion', 20, 0, 1, 0, 'x']]]));
    expect(decodeShop(code).items.map((item) => item.was)).toEqual([undefined, undefined]);
  });
});

describe('udhari', () => {
  it('adds customers, credit and payments, and totals what is owed', () => {
    let list = addCustomer([], ' सीमा ', '00000 00000x');
    list = addCustomer(list, 'रमेश', '');
    const [seema, ramesh] = list;
    expect(seema).toMatchObject({ name: 'सीमा', phone: '00000 00000', entries: [] });

    list = addEntry(list, seema.id, 120, 1);
    list = addEntry(list, seema.id, -50, 2);
    list = addEntry(list, ramesh.id, -30, 3);
    list = addEntry(list, ramesh.id, 0, 4);
    list = addEntry(list, ramesh.id, Number.NaN, 5);
    expect(list.map(balanceOf)).toEqual([70, -30]);
    // Money paid ahead by one customer does not hide what another owes
    expect(totalDue(list)).toBe(70);
    expect(byDue(list).map((c) => c.name)).toEqual(['सीमा', 'रमेश']);
    expect(removeCustomer(list, seema.id).map((c) => c.name)).toEqual(['रमेश']);
  });
});

describe('backup link and QR', () => {
  it('carries the whole shop, unpriced items too, but not what was sent when', () => {
    const back = decodeBackup(encodeBackup({ ...shop, setupDone: true, sentAt: 5, lastPrices: { tomato: 20 } }));
    expect(back).toEqual({ ...shop, name: 'भाजी भांडार' });
    expect(back.items).toHaveLength(4);
  });

  it('refuses a broken backup, and drops what it cannot trust', () => {
    const code = (data) => btoa(JSON.stringify(data));
    expect(decodeBackup('nonsense')).toBeNull();
    expect(decodeBackup(code({ v: 1, shop: { name: '', items: [] } }))).toBeNull();
    const odd = decodeBackup(
      code({ v: 1, shop: { name: 'Shop', minOrder: 'lots', items: [{ id: 'tomato', unit: 'kg', price: -3 }, { id: 'zz', unit: 'kg' }, { id: 'onion', unit: 'sack' }] } }),
    );
    expect(odd).toMatchObject({ name: 'Shop', minOrder: 0, whatsapp: '', pickup: true, delivery: false });
    expect(odd.items).toEqual([{ id: 'tomato', price: 0, unit: 'kg', inStock: true, special: false }]);
  });

  it('draws a QR code as a square with a quiet zone', () => {
    const { size, path } = qrPath('https://wa.me/910000000000?text=hi');
    // The top-left finder pattern starts right after the 4-module quiet zone
    expect(path.startsWith('M4 4h1v1h-1z')).toBe(true);
    expect(size).toBeGreaterThanOrEqual(21 + 8);
    expect(qrPath('a much longer text '.repeat(20)).size).toBeGreaterThan(size);
  });
});

describe('shop details', () => {
  it('accepts a 10-digit number, with or without the country code', () => {
    expect(whatsappDigits('00000 00000')).toBe('910000000000');
    expect(whatsappDigits('+91 00000-00000')).toBe('910000000000');
    expect(whatsappDigits('12345')).toBe('');
  });

  it('checks a UPI ID and builds a pay link', () => {
    expect(validUpi('shop@bank')).toBe(true);
    expect(validUpi('shop')).toBe(false);
    expect(upiUrl({ upi: 'shop@bank', name: 'Veg Cart' }, 52.5)).toBe(
      'upi://pay?pa=shop%40bank&pn=Veg%20Cart&am=52.50&cu=INR',
    );
  });

  it('says what is missing before a shop can be shared', () => {
    expect(shopProblems({ ...shop, name: '', whatsapp: '12', upi: 'bad', items: [] })).toEqual([
      'vendor.needName',
      'vendor.needWhatsapp',
      'vendor.badUpi',
      'vendor.needItems',
    ]);
    expect(shopProblems(shop)).toEqual([]);
  });
});

describe('delivery terms and messages', () => {
  const items = shopItems(shop);
  const lines = basketLines(items, { tomato: 2 });

  it('sets a weight directly, and removes the item at zero', () => {
    expect(setQty({ methi: 1 }, items[0], 2)).toEqual({ methi: 1, tomato: 2 });
    expect(setQty({ tomato: 2 }, items[0], 0)).toEqual({});
  });

  it('adds the delivery charge only for home delivery', () => {
    expect(orderTotals(shop, lines, 'delivery')).toEqual({ items: 60, charge: 10, total: 70 });
    expect(orderTotals(shop, lines, 'pickup')).toEqual({ items: 60, charge: 0, total: 60 });
  });

  it('knows how far a basket is from the delivery minimum', () => {
    expect(shortOfMinimum(shop, lines)).toBe(40);
    expect(shortOfMinimum({ ...shop, delivery: false }, lines)).toBe(0);
    expect(shortOfMinimum(shop, basketLines(items, { tomato: 4 }))).toBe(0);
  });

  it('shows the charge in the customer’s order message', () => {
    const text = orderMessage({
      shop,
      lines,
      customer: { name: 'सीमा', mode: 'delivery', address: 'मंदिराजवळ', note: '' },
      t: mr,
      name,
    });
    expect(text).toContain('वस्तूंची किंमत: ₹60');
    expect(text).toContain('घरपोच शुल्क: ₹10');
    expect(text).toContain('एकूण: ₹70');
  });

  it('puts the note, specials and sold-out items in the seller’s rates message', () => {
    const text = ratesMessage({ shop, items: items.filter((i) => i.price > 0), link: 'LINK', date: '16 नोव्हें', t: mr, name });
    expect(text.split('\n')).toEqual([
      '🥬 भाजी भांडार · 16 नोव्हें चे भाव',
      '📣 आज ताजी मेथी',
      '',
      '⭐ टोमॅटो: ₹30 / किलो',
      '• मेथी: संपले',
      '• गूळ: ₹60 / किलो',
      '',
      'इथे ऑर्डर करा:',
      'LINK',
    ]);
  });
});
