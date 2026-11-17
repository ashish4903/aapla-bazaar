# आपला बाजार · Aapla Bazaar

Today's rates from a local shop, ordered on WhatsApp. Free, Marathi-first, and built for village vendors: a vegetable cart first, any small shop later.

**Open it:** https://ashish4903.github.io/aapla-bazaar/

## How it works

- **The seller** sets up once in three steps: shop name and WhatsApp number, what they sell, and how customers are served (pickup, delivery charge, minimum order, timings). Each morning they open the app on their day: mark the shop open or closed, nudge prices up or down, switch off what is sold out, star today's specials, and send the rates and a link to customers on WhatsApp in one tap.
- **Customers** open the link. No login, no app to install. They see whether the shop is open, its timings and delivery terms, today's specials first, then everything by kind. They tap what they want, and the order opens as a bill and then as a ready-typed WhatsApp message to the shop. They can repeat their last order in one tap.
- **Payment** is cash or UPI on delivery or pickup. If the vendor adds a UPI ID, the customer gets a "Pay by UPI" button with the amount filled in. No payment gateway, no fees.

There is no server and no database: the shop travels inside the link the vendor shares, and the vendor's list is saved on their own phone. When rates change, the vendor sends a new link; an old link says its rates are old.

## Status

| Phase | What | State |
|---|---|---|
| 1 | Seller setup and daily screen, rates link, shop page with specials, search and filters, basket, delivery charge and minimum order, WhatsApp order, UPI button, repeat order, Marathi and English | Done |
| 2 | A permanent link and QR poster per shop (needs a database), saved orders with status, delivery slots, credit ledger (udhari) | Planned |
| 3 | Village directory of shops | Planned |

## Run it

```sh
npm install
npm run dev     # dev server
npm test        # Vitest
npm run lint
npm run build
```

## Where things are

- `src/lib/shop.js`: the shop, its link code (`encodeShop` / `decodeShop`), number and UPI checks
- `src/lib/catalogue.js`: common produce the vendor picks from (names and pictures, never prices)
- `src/lib/order.js`: basket, prices, quantities, the WhatsApp messages and links
- `src/lib/i18n.js`: all interface text in Marathi and English (a test fails if either is missing a key)
- `src/components/`: one small component per file
- `public/sw.js`, `public/manifest.webmanifest`, `public/icon*`: install to the home screen and offline loading (network first; only the app's own files are stored)
- `src/index.css`: all styles, mobile-first, no web fonts

## Privacy

- No accounts, trackers or analytics, and no server that stores anything.
- A customer's name and address stay on their own phone (localStorage) and in the WhatsApp message they choose to send.
- A vendor's shop name, WhatsApp number, UPI ID and rates stay on the vendor's phone and in the link the vendor chooses to share. Anyone who has the link can read them.
- No real shop, person or place is ever committed to this repository.

## Licence

MIT
