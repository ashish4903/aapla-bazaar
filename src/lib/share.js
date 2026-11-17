import { dateText, encodeShop, shopItems, shopProblems, todayStamp } from './shop';
import { ratesMessage } from './order';

/** Today's link and WhatsApp message for the seller's shop: { ready, problems, code, link, message } */
export function todayShare(shop, { t, name, lang }) {
  const problems = shopProblems(shop);
  const ready = problems.length === 0;
  const code = ready ? encodeShop(shop) : '';
  const link = `${window.location.origin}${window.location.pathname}#/s/${code}`;
  const message = ratesMessage({
    shop,
    items: shopItems(shop).filter((item) => item.price > 0),
    link,
    date: dateText(todayStamp(), lang),
    t,
    name,
  });
  return { ready, problems, code, link, message };
}
