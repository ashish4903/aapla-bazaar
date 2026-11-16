import demoShop from '../data/demo-shop.json';

/**
 * All shop data comes through here, so components never care where it lives.
 * Today it is a demo shop bundled with the app. When the database is added,
 * only this file changes. Everything belongs to a shop (`shop.id`), so many
 * vendors can share one app later.
 */
export async function loadShop() {
  return demoShop;
}

/** Loose vegetables are sold from a quarter kilo; everything else by the one */
export const stepOf = (item) => (item.unit === 'kg' ? 0.25 : 1);
