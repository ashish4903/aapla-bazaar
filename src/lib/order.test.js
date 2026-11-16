import { describe, expect, it } from 'vitest';
import { basketLines, basketTotal, changeQty, orderMessage, qtyLabel, rupees, whatsappUrl } from './order';
import { STRINGS, translate } from './i18n';

const tomato = { id: 'tomato', name: { mr: 'टोमॅटो', en: 'Tomato' }, price: 30, unit: 'kg', inStock: true };
const methi = { id: 'methi', name: { mr: 'मेथी', en: 'Fenugreek' }, price: 15, unit: 'bunch', inStock: true };
const cabbage = { id: 'cabbage', name: { mr: 'पत्ताकोबी', en: 'Cabbage' }, price: 25, unit: 'piece', inStock: false };
const shop = { name: { mr: 'भाजी भांडार', en: 'Veg Cart' }, items: [tomato, methi, cabbage] };

const en = (key, vars) => translate('en', key, vars);
const mr = (key, vars) => translate('mr', key, vars);

describe('basket', () => {
  it('adds loose vegetables a quarter kilo at a time and the rest one by one', () => {
    let basket = changeQty({}, tomato, 1);
    basket = changeQty(basket, tomato, 1);
    basket = changeQty(basket, methi, 1);
    expect(basket).toEqual({ tomato: 0.5, methi: 1 });
  });

  it('removes an item when it reaches zero, and never goes below', () => {
    const basket = changeQty({ tomato: 0.25, methi: 1 }, tomato, -1);
    expect(basket).toEqual({ methi: 1 });
    expect(changeQty(basket, tomato, -1)).toEqual({ methi: 1 });
  });

  it('prices each line and the total, leaving out sold-out items', () => {
    const lines = basketLines(shop, { tomato: 0.75, methi: 2, cabbage: 1 });
    expect(lines.map((l) => [l.item.id, l.amount])).toEqual([
      ['tomato', 22.5],
      ['methi', 30],
    ]);
    expect(basketTotal(lines)).toBe(52.5);
  });

  it('shows whole rupees plainly and paise with two places', () => {
    expect(rupees(15)).toBe('₹15');
    expect(rupees(22.5)).toBe('₹22.50');
  });
});

describe('quantities', () => {
  it('reads under a kilo in grams', () => {
    expect(qtyLabel(tomato, 0.25, en)).toBe('250 g');
    expect(qtyLabel(tomato, 1.5, en)).toBe('1.5 kg');
    expect(qtyLabel(tomato, 0.5, mr)).toBe('500 ग्रॅम');
  });

  it('uses singular and plural in English', () => {
    expect(qtyLabel(methi, 1, en)).toBe('1 bunch');
    expect(qtyLabel(methi, 2, en)).toBe('2 bunches');
    expect(qtyLabel(methi, 2, mr)).toBe('2 जुडी');
  });
});

describe('WhatsApp order', () => {
  const lines = basketLines(shop, { tomato: 0.5, methi: 1 });
  const name = (thing) => thing.name.mr;

  it('lists the items, total, name and delivery address in Marathi', () => {
    const text = orderMessage({
      shop,
      lines,
      customer: { name: ' सीमा ', mode: 'delivery', address: 'मारुती मंदिराजवळ', note: '' },
      t: mr,
      name,
    });
    expect(text).toContain('आपला बाजार · भाजी भांडार');
    expect(text).toContain('• टोमॅटो: 500 ग्रॅम = ₹15');
    expect(text).toContain('• मेथी: 1 जुडी = ₹15');
    expect(text).toContain('एकूण: ₹30');
    expect(text).toContain('नाव: सीमा');
    expect(text).toContain('घरपोच: मारुती मंदिराजवळ');
    expect(text).not.toContain('टीप');
  });

  it('says pickup, and adds a note when there is one', () => {
    const text = orderMessage({
      shop,
      lines,
      customer: { name: 'Seema', mode: 'pickup', address: 'ignored', note: 'after 5' },
      t: en,
      name: (thing) => thing.name.en,
    });
    expect(text).toContain('Pick up at the shop');
    expect(text).not.toContain('ignored');
    expect(text).toContain('Note: after 5');
  });

  it('builds a click-to-chat link, with or without a shop number', () => {
    expect(whatsappUrl('+91 98765-43210', 'नमस्ते 1')).toBe(
      `https://wa.me/919876543210?text=${encodeURIComponent('नमस्ते 1')}`,
    );
    expect(whatsappUrl('', 'hi')).toBe('https://wa.me/?text=hi');
  });
});

describe('translations', () => {
  it('has every key in both Marathi and English', () => {
    expect(Object.keys(STRINGS.mr).sort()).toEqual(Object.keys(STRINGS.en).sort());
  });
});
