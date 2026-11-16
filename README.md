# आपला बाजार · Aapla Bazaar

Today's rates from a local shop, ordered on WhatsApp. Free, Marathi-first, and built for village vendors: a vegetable cart first, any small shop later.

**Live demo:** https://ashish4903.github.io/aapla-bazaar/

## How it works

- **Customers** open a link or scan a QR code at the cart. No login, no app to install. They see today's items and prices, tap what they want, and the order opens as a ready-typed WhatsApp message to the shop.
- **The vendor** updates prices and stock from a phone each morning and shares the day's rates on WhatsApp. *(coming next)*
- **Payment** is cash or UPI on delivery or pickup. No payment gateway, no fees.

## Status

| Phase | What | State |
|---|---|---|
| 1a | Shop page, basket, WhatsApp order, Marathi and English | Done (demo shop) |
| 1b | Vendor screen to update prices and stock, "share today's rates", QR poster | Next |
| 2 | Saved orders with status, delivery slots, UPI link, repeat order, credit ledger (udhari) | Planned |
| 3 | Many vendors: self-signup, own link and QR each, village directory | Planned |

The demo shop's prices are not real.

## Run it

```sh
npm install
npm run dev     # dev server
npm test        # Vitest
npm run lint
npm run build
```

## Where things are

- `src/lib/shop.js`: the only place shop data is loaded (a bundled demo shop for now; the database goes here)
- `src/lib/order.js`: basket, prices, quantities, the WhatsApp message and link
- `src/lib/i18n.js`: all interface text in Marathi and English (a test fails if either is missing a key)
- `src/components/`: one small component per file
- `src/index.css`: all styles, mobile-first, no web fonts

## Privacy

- No accounts, trackers or analytics.
- A customer's name and address stay on their own phone (localStorage) and in the WhatsApp message they choose to send.
- Vendor phone numbers and UPI IDs are never committed to this repository.

## Licence

MIT
