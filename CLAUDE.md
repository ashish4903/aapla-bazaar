# Aapla Bazaar

React (Vite) app for small village shops: customers see today's rates and order on WhatsApp. Marathi first, English second. Public repo, deployed to GitHub Pages.

## Commands

- `npm run dev`: dev server
- `npm test`: Vitest (tests sit next to the code as `*.test.js(x)`)
- `npm run lint` (oxlint), `npm run build`

## Where things are

- `src/lib/shop.js`: the only place shop data is handled. A shop lives on the vendor's phone (localStorage) and inside the link they share (`#/s/<code>`, `encodeShop`/`decodeShop`); `decodeShop` checks every field because anyone can type a link. Any number of vendors can use the app
- `src/lib/catalogue.js`: common produce (name in both languages, picture, usual unit, never a price) the vendor picks from
- `src/lib/useRoute.js`: hash routes `#/` home, `#/s/<code>` a shop, and the seller's `#/my-shop` (today), `#/my-shop/items`, `#/my-shop/edit`
- `src/lib/useMyShop.js`: the seller's saved shop. Seller screens are `Seller*.jsx` (setup once, then Today / Items / Shop); buyer screens are `ShopView`, `OrderForm`, `OrderSent`
- `src/lib/keys.js`: every localStorage key
- `src/lib/order.js`: basket, prices, quantity labels, the customer's order message, the vendor's rates message, WhatsApp links
- `src/lib/i18n.js`: all interface text; use `useLang()` (`t`, `name`, `pick`) in components and never hard-code visible text. A test fails if Marathi or English is missing a key
- `src/lib/storage.js`: localStorage that never throws
- `src/lib/ledger.js` + `SellerCustomers.jsx` / `CustomerSheet.jsx`: the seller's regular customers and udhari. Other people's names and numbers: phone only, never in a link, the backup or the repo
- `src/lib/share.js`: today's link and rates message, shared by the Today and Customers screens
- `src/lib/speak.js`: browser speech only (Marathi, then Hindi voice); no network
- Cheaper today: `priceBase(shop)` in `shop.js` is the last earlier day's prices; the link carries an item's earlier price only when today's is lower
- `src/lib/qr.js` + `QrCode.jsx`: QR codes as SVG, always black on white. The poster's QR (`SellerPoster.jsx`) is a WhatsApp link to the shop, never a rates link, so it cannot go stale
- Backup: `encodeBackup`/`decodeBackup` in `shop.js`, opened at `#/restore/<code>` (`RestoreView.jsx`), which always asks before saving
- `public/sw.js` + `public/manifest.webmanifest`: install to the home screen and offline loading. The worker is network first and registered only in the built site (`src/main.jsx`); `src/lib/useInstall.js` holds the browser's install offer. `public/icon-192.png` and `icon-512.png` are rendered from `public/icon.svg`
- `src/components/`: one small component per file
- `src/index.css`: all styles, mobile-first, system fonts only

## Rules

- After `npm install <package>` on Windows, check `git diff package-lock.json`: npm drops the optional `@emnapi/*` entries that CI's `npm ci` needs. Restore them before committing.
- Built for cheap phones on slow networks: no UI library, no web fonts, no images unless needed. Touch targets at least 44px.
- **Thumb rule, no exceptions:** never commit sensitive data, keys or config that holds them: secrets, tokens, API keys (even "public" ones such as a database anon key), `.env` files, or a real person's phone number, UPI ID, email, name or address. Keys live in GitHub Actions secrets/variables or a git-ignored `.env.local`, set by the owner. Check the staged diff before every commit.
- **Ask first:** don't read files outside this folder, or any config, credential or `.env` file, without the owner's permission.
- Never name the real village, vendor or any real location in code, data, docs, commits or PRs.
- **No dummy data in the app:** this is the production app. No demo shop, sample prices or placeholder shops. Every shop name, number and price is typed by a vendor and exists only on their phone and in their link. Tests use made-up values (an all-zero number).
- No trackers or analytics. Customer details stay on the customer's phone and in the WhatsApp message they send.
- Commit author must be the GitHub noreply address. No AI attribution lines in commits or PRs. New branch + PR per change after the first commit. Add a line under "Unreleased" in `CHANGELOG.md`.
