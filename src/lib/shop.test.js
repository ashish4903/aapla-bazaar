import { describe, expect, it } from 'vitest';
import { decodeShop, encodeShop, shopItems, shopProblems, upiUrl, validUpi, whatsappDigits } from './shop';

// Made-up test values: the number is all zeros on purpose
const shop = {
  name: ' भाजी भांडार ',
  place: 'बस स्टँडजवळ',
  whatsapp: '00000 00000',
  upi: 'shop@bank',
  pickup: true,
  delivery: true,
  items: [
    { id: 'tomato', price: 30, unit: 'kg', inStock: true },
    { id: 'methi', price: 15, unit: 'bunch', inStock: false },
    { id: 'onion', price: 0, unit: 'kg', inStock: true },
    { id: 'x1', label: 'गूळ', price: 60, unit: 'kg', inStock: true },
  ],
};

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
      date: 20261116,
      items: [
        { id: 'tomato', price: 30, unit: 'kg', inStock: true },
        { id: 'methi', price: 15, unit: 'bunch', inStock: false },
        { id: 'x1', label: 'गूळ', price: 60, unit: 'kg', inStock: true },
      ],
    });
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
  });

  it('gives catalogue items their picture and both names, and typed items their own name', () => {
    const [tomato, , , jaggery] = shopItems(shop);
    expect(tomato).toMatchObject({ icon: '🍅', cat: 'veg', name: { mr: 'टोमॅटो', en: 'Tomato' }, price: 30 });
    expect(jaggery).toMatchObject({ cat: 'other', name: { mr: 'गूळ', en: 'गूळ' } });
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
