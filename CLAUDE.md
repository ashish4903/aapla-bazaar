# Aapla Bazaar

React (Vite) app for small village shops: customers see today's rates and order on WhatsApp. Marathi first, English second. Public repo, deployed to GitHub Pages.

## Commands

- `npm run dev`: dev server
- `npm test`: Vitest (tests sit next to the code as `*.test.js(x)`)
- `npm run lint` (oxlint), `npm run build`

## Where things are

- `src/lib/shop.js`: the only place shop data is loaded. Everything belongs to a shop (`shop.id`) so many vendors can share the app
- `src/lib/order.js`: basket, prices, quantity labels, WhatsApp message and link
- `src/lib/i18n.js`: all interface text; use `useLang()` (`t`, `name`, `pick`) in components and never hard-code visible text. A test fails if Marathi or English is missing a key
- `src/lib/storage.js`: localStorage that never throws
- `src/components/`: one small component per file
- `src/index.css`: all styles, mobile-first, system fonts only

## Rules

- Built for cheap phones on slow networks: no UI library, no web fonts, no images unless needed. Touch targets at least 44px.
- **Thumb rule, no exceptions:** never commit sensitive data, keys or config that holds them: secrets, tokens, API keys (even "public" ones such as a database anon key), `.env` files, or a real person's phone number, UPI ID, email, name or address. Keys live in GitHub Actions secrets/variables or a git-ignored `.env.local`, set by the owner. Check the staged diff before every commit.
- **Ask first:** don't read files outside this folder, or any config, credential or `.env` file, without the owner's permission.
- Demo data only in the repo. No trackers or analytics. Customer details stay on the customer's phone and in the WhatsApp message they send.
- The demo shop's prices are invented and labelled as a demo; never present them as real.
- Commit author must be the GitHub noreply address. No AI attribution lines in commits or PRs. New branch + PR per change after the first commit. Add a line under "Unreleased" in `CHANGELOG.md`.
