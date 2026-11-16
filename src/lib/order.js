import { stepOf } from './shop';

/** Basket: { [itemId]: quantity }. Quantities are in the item's unit (kg, bunch, piece). */

const clean = (qty) => Math.round(qty * 100) / 100;

export function changeQty(basket, item, direction) {
  const next = clean((basket[item.id] ?? 0) + direction * stepOf(item));
  const rest = { ...basket };
  delete rest[item.id];
  return next > 0 ? { ...rest, [item.id]: next } : rest;
}

/** Lines for items that are still on sale: anything out of stock is left out. */
export function basketLines(shop, basket) {
  return shop.items
    .filter((item) => item.inStock && basket[item.id] > 0)
    .map((item) => ({ item, qty: basket[item.id], amount: clean(item.price * basket[item.id]) }));
}

export const basketTotal = (lines) => clean(lines.reduce((sum, line) => sum + line.amount, 0));

/** ₹15, ₹7.50 */
export const rupees = (amount) => `₹${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;

/** "250 g", "1.5 kg", "2 bunches": `t` is the translate function */
export function qtyLabel(item, qty, t) {
  if (item.unit === 'kg') {
    return qty < 1 ? t('qty.grams', { n: Math.round(qty * 1000) }) : t('qty.kg', { n: qty });
  }
  return t(`qty.${item.unit}`, { n: qty });
}

/** The message the customer sends to the shop */
export function orderMessage({ shop, lines, customer, t, name }) {
  const out = [`🛒 ${t('app.name')} · ${name(shop)}`, ''];
  for (const { item, qty, amount } of lines) {
    out.push(`• ${name(item)}: ${qtyLabel(item, qty, t)} = ${rupees(amount)}`);
  }
  out.push('', `${t('order.total')}: ${rupees(basketTotal(lines))}`, '');
  out.push(`${t('order.name')}: ${customer.name.trim()}`);
  out.push(
    customer.mode === 'delivery'
      ? `${t('order.delivery')}: ${customer.address.trim()}`
      : t('order.pickup'),
  );
  if (customer.note?.trim()) out.push(`${t('order.note')}: ${customer.note.trim()}`);
  return out.join('\n');
}

/**
 * WhatsApp click-to-chat link. With no shop number (the demo shop) WhatsApp
 * asks who to send it to.
 */
export function whatsappUrl(number, message) {
  const digits = (number ?? '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
