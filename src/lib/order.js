import { stepOf } from './shop';

/** Basket: { [itemId]: quantity }. Quantities are in the item's unit (kg, bunch, piece, dozen). */

const clean = (qty) => Math.round(qty * 100) / 100;

export function setQty(basket, item, qty) {
  const rest = { ...basket };
  delete rest[item.id];
  return qty > 0 ? { ...rest, [item.id]: clean(qty) } : rest;
}

export const changeQty = (basket, item, direction) =>
  setQty(basket, item, (basket[item.id] ?? 0) + direction * stepOf(item));

/** Lines for items that are still on sale: anything out of stock is left out. */
export function basketLines(items, basket) {
  return items
    .filter((item) => item.inStock && basket[item.id] > 0)
    .map((item) => ({ item, qty: basket[item.id], amount: clean(item.price * basket[item.id]) }));
}

export const basketTotal = (lines) => clean(lines.reduce((sum, line) => sum + line.amount, 0));

/** The bill: items, the delivery charge (home delivery only) and the total */
export function orderTotals(shop, lines, mode) {
  const items = basketTotal(lines);
  const charge = mode === 'delivery' ? (shop.deliveryCharge ?? 0) : 0;
  return { items, charge, total: clean(items + charge) };
}

/** How much more a basket needs before the shop delivers it, or 0 */
export const shortOfMinimum = (shop, lines) =>
  shop.delivery && shop.minOrder > 0 ? Math.max(0, clean(shop.minOrder - basketTotal(lines))) : 0;

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
  const { items, charge, total } = orderTotals(shop, lines, customer.mode);
  const out = [`🛒 ${t('app.name')} · ${name(shop)}`, ''];
  for (const { item, qty, amount } of lines) {
    out.push(`• ${name(item)}: ${qtyLabel(item, qty, t)} = ${rupees(amount)}`);
  }
  out.push('');
  if (charge > 0) out.push(`${t('order.items')}: ${rupees(items)}`, `${t('order.charge')}: ${rupees(charge)}`);
  out.push(`${t('order.total')}: ${rupees(total)}`, '');
  out.push(`${t('order.name')}: ${customer.name.trim()}`);
  out.push(
    customer.mode === 'delivery'
      ? `${t('order.delivery')}: ${customer.address.trim()}`
      : t('order.pickup'),
  );
  if (customer.note?.trim()) out.push(`${t('order.note')}: ${customer.note.trim()}`);
  return out.join('\n');
}

/** The message the vendor sends to customers: the day's rates and the shop link */
export function ratesMessage({ shop, items, link, date, t, name }) {
  const out = [`🥬 ${shop.name.trim()} · ${t('shop.ratesOf', { date })}`];
  if (shop.note.trim()) out.push(`📣 ${shop.note.trim()}`);
  out.push('');
  for (const item of items) {
    const label = `${item.special ? '⭐ ' : '• '}${name(item)}`;
    out.push(
      item.inStock
        ? `${label}: ${rupees(item.price)} / ${t(`item.per.${item.unit}`)}`
        : `${label}: ${t('item.out')}`,
    );
  }
  out.push('', `${t('vendor.orderHere')}:`, link);
  return out.join('\n');
}

/** WhatsApp click-to-chat link. With no number, WhatsApp asks who to send it to. */
export function whatsappUrl(number, message) {
  const digits = (number ?? '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
