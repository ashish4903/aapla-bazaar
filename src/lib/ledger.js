/**
 * The seller's regular customers and their udhari (credit), kept on the
 * seller's phone only: never in a link, never in this repository.
 *
 * Customer: { id, name, phone, entries: [{ at, amount }] }
 * amount > 0: goods given on credit. amount < 0: money received.
 */
const clean = (amount) => Math.round(amount * 100) / 100;

export const balanceOf = (customer) => clean(customer.entries.reduce((sum, entry) => sum + entry.amount, 0));

/** Everything customers still owe; someone who paid ahead does not reduce it */
export const totalDue = (customers) => clean(customers.reduce((sum, c) => sum + Math.max(0, balanceOf(c)), 0));

export function addCustomer(customers, name, phone) {
  const id = `c${Date.now().toString(36)}${customers.length}`;
  return [...customers, { id, name: name.trim().slice(0, 40), phone: phone.replace(/[^\d+ ]/g, '').slice(0, 15), entries: [] }];
}

export const removeCustomer = (customers, id) => customers.filter((c) => c.id !== id);

/** Adds a credit (positive) or a payment (negative); keeps the latest 200 entries */
export function addEntry(customers, id, amount, at = Date.now()) {
  if (!Number.isFinite(amount) || amount === 0) return customers;
  return customers.map((c) => (c.id === id ? { ...c, entries: [...c.entries, { at, amount: clean(amount) }].slice(-200) } : c));
}

/** Most owed first, then by name */
export const byDue = (customers) =>
  [...customers].sort((a, b) => balanceOf(b) - balanceOf(a) || a.name.localeCompare(b.name));
