import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { decodeShop, emptyShop, encodeBackup, encodeShop, todayStamp } from './lib/shop';
import { MY_SHOP_KEY } from './lib/keys';

// Made-up test shop: the number is all zeros on purpose
const shop = {
  ...emptyShop(),
  name: 'भाजी भांडार',
  place: 'बस स्टँडजवळ',
  whatsapp: '0000000000',
  upi: 'shop@bank',
  delivery: true,
  deliveryCharge: 10,
  minOrder: 40,
  hours: 'सकाळी ७ ते रात्री ८',
  note: 'आज ताजी मेथी',
  items: [
    { id: 'tomato', price: 30, unit: 'kg', inStock: true, special: false },
    { id: 'onion', price: 20, unit: 'kg', inStock: true, special: false },
    { id: 'methi', price: 15, unit: 'bunch', inStock: true, special: true },
    { id: 'cabbage', price: 25, unit: 'piece', inStock: false, special: false },
    { id: 'banana', price: 50, unit: 'dozen', inStock: true, special: false },
  ],
};

const openShop = (stamp = todayStamp(), change = {}) => {
  window.location.hash = `#/s/${encodeShop({ ...shop, ...change }, stamp)}`;
  render(<App />);
};

const messageOf = (link) => decodeURIComponent(link.getAttribute('href').split('?text=')[1]);
// jsdom cannot open WhatsApp: stop the link, the app's own handler still runs
const dontLeave = (link) => link.addEventListener('click', (e) => e.preventDefault());
const summary = () => document.querySelector('.basket-summary')?.textContent;

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

describe('home', () => {
  it('invites customers and shopkeepers in Marathi, and switches to English', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('link', { name: 'दुकान सुरू करा' }).getAttribute('href')).toBe('#/my-shop');
    expect(document.documentElement.lang).toBe('mr');

    await user.click(screen.getByRole('button', { name: 'View in English' }));
    expect(screen.getByRole('link', { name: 'Start my shop' })).toBeTruthy();
    expect(document.documentElement.lang).toBe('en');
  });

  it('offers the shop opened last', () => {
    openShop();
    cleanup();
    window.location.hash = '';
    render(<App />);
    expect(screen.getByRole('link', { name: /भाजी भांडार/ }).getAttribute('href')).toMatch(/^#\/s\//);
  });
});

describe('a shop link', () => {
  it('answers the buyer’s first questions: open, timings, delivery terms, call', () => {
    openShop();
    expect(screen.getByRole('heading', { level: 1, name: 'भाजी भांडार' })).toBeTruthy();
    expect(screen.getByText(/आज सुरू आहे · सकाळी ७ ते रात्री ८/)).toBeTruthy();
    expect(screen.getByText(/आज ताजी मेथी/)).toBeTruthy();
    expect(screen.getByText(/घरपोच शुल्क ₹10/)).toBeTruthy();
    expect(screen.getByText('घरपोच साठी किमान ₹40')).toBeTruthy();
    expect(screen.getByRole('link', { name: /फोन करा/ }).getAttribute('href')).toBe('tel:+910000000000');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('lists today’s specials first, then by kind, with sold-out items that cannot be added', () => {
    openShop();
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['★ आजचे खास', 'भाज्या', 'फळे']);
    expect(document.querySelector('.items .item-name').textContent).toContain('मेथी');
    expect(screen.queryByRole('button', { name: 'पत्ताकोबी घ्या' })).toBeNull();
    expect(screen.getByText('संपले')).toBeTruthy();
  });

  it('takes no orders when the shop is closed', () => {
    openShop(todayStamp(), { open: false });
    expect(screen.getByText(/आज बंद आहे · /)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('आज ऑर्डर घेतली जात नाही');
    expect(screen.getByText('टोमॅटो')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'टोमॅटो घ्या' })).toBeNull();
  });

  it('warns when the rates are from an earlier day', () => {
    openShop(20200101);
    expect(screen.getByRole('status').textContent).toContain('हे भाव जुने आहेत');
    // ...and offers to ask the shop for today's rates on WhatsApp
    const ask = screen.getByRole('link', { name: /आजचे भाव मागा/ });
    expect(ask.getAttribute('href')).toBe(`https://wa.me/910000000000?text=${encodeURIComponent('नमस्ते, आजचे भाव पाठवा.')}`);
  });

  it('says so when the link is broken', () => {
    window.location.hash = '#/s/nonsense';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'ही लिंक उघडत नाही' })).toBeTruthy();
  });

  it('filters by search and by category', async () => {
    const user = userEvent.setup();
    openShop();
    await user.type(screen.getByRole('searchbox', { name: 'वस्तू शोधा' }), 'onion');
    expect(screen.getByText('कांदा')).toBeTruthy();
    expect(screen.queryByText('टोमॅटो')).toBeNull();

    await user.clear(screen.getByRole('searchbox', { name: 'वस्तू शोधा' }));
    await user.click(screen.getByRole('button', { name: 'फळे' }));
    expect(screen.getByText('केळी')).toBeTruthy();
    expect(screen.queryByText('कांदा')).toBeNull();

    await user.type(screen.getByRole('searchbox', { name: 'वस्तू शोधा' }), 'zzz');
    expect(screen.getByText('अशी वस्तू सापडली नाही')).toBeTruthy();
  });

  it('jumps to the usual weights, and says how far the basket is from the delivery minimum', async () => {
    const user = userEvent.setup();
    openShop();
    await user.click(screen.getByRole('button', { name: 'टोमॅटो घ्या' }));
    expect(summary()).toBe('1 वस्तू · ₹7.50');
    expect(screen.getByText('घरपोच साठी अजून ₹32.50 ची खरेदी हवी')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '2 किलो' }));
    expect(summary()).toBe('1 वस्तू · ₹60');
    expect(screen.queryByText(/घरपोच साठी अजून/)).toBeNull();
  });

  it('takes an order to the shop’s WhatsApp as a bill, then offers UPI and a repeat order', async () => {
    const user = userEvent.setup();
    openShop();

    await user.click(screen.getByRole('button', { name: 'टोमॅटो घ्या' }));
    await user.click(screen.getByRole('button', { name: 'टोमॅटो वाढवा' }));
    await user.click(screen.getByRole('button', { name: 'मेथी घ्या' }));
    // 0.5 kg × ₹30 + 1 bunch × ₹15
    expect(summary()).toBe('2 वस्तू · ₹30');

    await user.click(screen.getByRole('button', { name: /ऑर्डर करा/ }));
    const send = () => screen.getByRole('link', { name: 'WhatsApp वर ऑर्डर पाठवा' });

    // Home delivery below the shop's minimum, and no name yet: stopped, and says why
    await user.click(screen.getByLabelText('घरपोच'));
    await user.click(send());
    expect(screen.getByRole('alert').textContent).toContain('घरपोच साठी किमान ₹40 ची ऑर्डर हवी');
    expect(screen.getByRole('alert').textContent).toContain('कृपया नाव लिहा');

    // The order can still be changed here: 2 bunches now, which clears the minimum
    await user.click(screen.getByRole('button', { name: 'मेथी वाढवा' }));
    await user.type(screen.getByLabelText('नाव'), 'सीमा');
    await user.type(screen.getByLabelText('पत्ता / घर कुठे आहे'), 'मंदिराजवळ');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(document.querySelector('.bill-total').textContent).toBe('एकूण₹55');

    expect(send().getAttribute('href')).toMatch(/^https:\/\/wa\.me\/910000000000\?text=/);
    const text = messageOf(send());
    expect(text).toContain('आपला बाजार · भाजी भांडार');
    expect(text).toContain('• टोमॅटो: 500 ग्रॅम = ₹15');
    expect(text).toContain('• मेथी: 2 जुडी = ₹30');
    expect(text).toContain('घरपोच शुल्क: ₹10');
    expect(text).toContain('एकूण: ₹55');
    expect(text).toContain('नाव: सीमा');
    expect(text).toContain('घरपोच: मंदिराजवळ');

    dontLeave(send());
    await user.click(send());
    expect(await screen.findByRole('heading', { name: 'WhatsApp उघडले आहे' })).toBeTruthy();
    expect(screen.getByText('माल मिळाल्यावर ₹55 रोख किंवा UPI ने द्या')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'UPI ने ₹55 द्या' }).getAttribute('href')).toContain('am=55.00');

    // Back in the shop the basket is empty, and the last order can be filled again
    await user.click(screen.getByRole('button', { name: /दुकानात परत जा/ }));
    expect(summary()).toBeUndefined();
    await user.click(screen.getByRole('button', { name: /मागची ऑर्डर पुन्हा भरा/ }));
    expect(summary()).toBe('2 वस्तू · ₹45');

    // The repeat opens the order with name and address already there: one tap to send
    const dialog = screen.getByRole('dialog', { name: 'तुमची ऑर्डर' });
    expect(within(dialog).getByText('सीमा')).toBeTruthy();
    expect(within(dialog).getByText('मंदिराजवळ')).toBeTruthy();
    expect(screen.queryByLabelText('नाव')).toBeNull();
    expect(messageOf(send())).toContain('घरपोच: मंदिराजवळ');

    // The details can still be changed, and the sheet closes with Escape
    await user.click(within(dialog).getByRole('button', { name: 'बदला' }));
    expect(screen.getByLabelText('नाव').value).toBe('सीमा');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(summary()).toBe('2 वस्तू · ₹45');
  });

  it('offers to add the app to the phone only when the browser allows it', async () => {
    const user = userEvent.setup();
    openShop();
    expect(screen.queryByRole('button', { name: /फोनवर ॲप म्हणून ठेवा/ })).toBeNull();

    let asked = false;
    const offer = new Event('beforeinstallprompt');
    offer.prompt = async () => {
      asked = true;
    };
    act(() => {
      window.dispatchEvent(offer);
    });
    await user.click(screen.getByRole('button', { name: /फोनवर ॲप म्हणून ठेवा/ }));
    expect(asked).toBe(true);
    await waitFor(() => expect(screen.queryByRole('button', { name: /फोनवर ॲप म्हणून ठेवा/ })).toBeNull());
  });

  it('keeps the basket when the page is reopened', async () => {
    const user = userEvent.setup();
    openShop();
    await user.click(screen.getByRole('button', { name: 'कांदा घ्या' }));
    cleanup();

    render(<App />);
    expect(summary()).toBe('1 वस्तू · ₹5');
  });
});

describe('seller extras', () => {
  const saved = {
    ...shop,
    setupDone: true,
    items: [
      { id: 'tomato', price: 30, unit: 'kg', inStock: true, special: false },
      { id: 'onion', price: 0, unit: 'kg', inStock: true, special: false },
    ],
  };
  const open = (hash) => {
    localStorage.setItem(MY_SHOP_KEY, JSON.stringify(saved));
    window.location.hash = hash;
    render(<App />);
  };

  it('makes a poster whose QR asks the shop for today’s rates on WhatsApp', () => {
    open('#/my-shop/poster');
    expect(screen.getByRole('heading', { level: 2, name: 'भाजी भांडार' })).toBeTruthy();
    const qr = screen.getByRole('img', { name: 'स्कॅन करा' });
    expect(qr.querySelector('path').getAttribute('d')).toMatch(/^M4 4h1v1h-1z/);
    expect(screen.getByRole('button', { name: /पोस्टर छापा/ })).toBeTruthy();
  });

  it('shows a QR of today’s link for a customer at the cart', async () => {
    const user = userEvent.setup();
    open('#/my-shop');
    await user.click(screen.getByRole('button', { name: /QR दाखवा/ }));
    const dialog = screen.getByRole('dialog', { name: 'आजच्या भावाचा QR' });
    expect(within(dialog).getByRole('img', { name: 'आजच्या भावाचा QR' })).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'बंद करा' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('moves the shop to another phone with a backup link, unpriced items included', async () => {
    const user = userEvent.setup();
    const code = encodeBackup(saved);
    window.location.hash = `#/restore/${code}`;
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'हे दुकान या फोनवर ठेवायचे?' })).toBeTruthy();
    expect(screen.getByText('भाजी भांडार · 2 वस्तू')).toBeTruthy();
    expect(localStorage.getItem(MY_SHOP_KEY)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'हो, या फोनवर ठेवा' }));
    expect(await screen.findByLabelText('कांदा चा भाव')).toBeTruthy();
    expect(screen.getByLabelText('टोमॅटो चा भाव').value).toBe('30');
  });

  it('refuses a broken backup link', () => {
    window.location.hash = '#/restore/nonsense';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'ही लिंक उघडत नाही' })).toBeTruthy();
  });

  it('removes the shop from the phone only after asking again', async () => {
    const user = userEvent.setup();
    open('#/my-shop/edit');
    await user.click(screen.getByRole('button', { name: 'दुकान या फोनवरून काढा' }));
    await user.click(screen.getByRole('button', { name: 'नको' }));
    expect(JSON.parse(localStorage.getItem(MY_SHOP_KEY)).name).toBe('भाजी भांडार');

    await user.click(screen.getByRole('button', { name: 'दुकान या फोनवरून काढा' }));
    await user.click(screen.getByRole('button', { name: 'हो, काढा' }));
    expect(await screen.findByRole('link', { name: 'दुकान सुरू करा' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(MY_SHOP_KEY)).name).toBe('');
  });
});

describe('my shop', () => {
  const setUp = async (user) => {
    window.location.hash = '#/my-shop';
    render(<App />);
    const next = () => screen.getByRole('button', { name: /पुढे/ });

    // Step 1 will not move on without a name and number
    await user.click(next());
    expect(screen.getByRole('alert').textContent).toContain('दुकानाचे नाव लिहा');
    await user.type(screen.getByLabelText('दुकानाचे नाव'), 'भाजी भांडार');
    await user.type(screen.getByLabelText(/^WhatsApp नंबर/), '0000000000');
    await user.click(next());

    // Step 2: what the shop sells, including a name that is not in the list
    await user.click(next());
    expect(screen.getByRole('alert').textContent).toContain('किमान एक वस्तू निवडा');
    await user.click(screen.getByRole('button', { name: 'टोमॅटो जोडा' }));
    await user.click(screen.getByRole('button', { name: 'मेथी जोडा' }));
    await user.type(screen.getByRole('searchbox'), 'गूळ');
    await user.click(screen.getByRole('button', { name: /“गूळ” जोडा/ }));
    await user.click(next());

    // Step 3: how customers are served
    await user.click(screen.getByLabelText('घरपोच मिळेल'));
    await user.type(screen.getByLabelText('घरपोच शुल्क ₹'), '10');
    await user.click(screen.getByRole('button', { name: 'दुकान तयार करा' }));
  };

  it('sets up in three steps, then sends today’s rates with a working link', async () => {
    const user = userEvent.setup();
    await setUp(user);

    expect(screen.getByRole('heading', { level: 1, name: 'भाजी भांडार' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('आजचे भाव अजून पाठवले नाहीत');

    const share = () => screen.getByRole('link', { name: 'आजचे भाव WhatsApp वर पाठवा' });
    await user.click(share());
    expect(screen.getByRole('alert').textContent).toContain('किमान एका वस्तूचा भाव भरा');

    await user.type(screen.getByLabelText('टोमॅटो चा भाव'), '30');
    await user.click(screen.getByRole('button', { name: 'टोमॅटो चा भाव ५ ने जास्त' }));
    await user.type(screen.getByLabelText('मेथी चा भाव'), '15');
    await user.click(screen.getByLabelText('मेथी उपलब्ध आहे'));
    await user.type(screen.getByLabelText('गूळ चा भाव'), '60');
    await user.click(screen.getByRole('button', { name: 'गूळ आजचे खास' }));
    await user.type(screen.getByLabelText('आजची सूचना (ऐच्छिक)'), 'ताजा माल');

    expect(screen.queryByRole('alert')).toBeNull();
    const text = messageOf(share());
    expect(text).toContain('📣 ताजा माल');
    expect(text).toContain('• टोमॅटो: ₹35 / किलो');
    expect(text).toContain('• मेथी: संपले');
    expect(text).toContain('⭐ गूळ: ₹60 / किलो');

    const sent = decodeShop(text.match(/#\/s\/(\S+)/)[1]);
    expect(sent).toMatchObject({
      name: 'भाजी भांडार',
      whatsapp: '910000000000',
      delivery: true,
      deliveryCharge: 10,
      note: 'ताजा माल',
      date: todayStamp(),
    });
    expect(sent.items.map((item) => [item.label ?? item.id, item.price, item.inStock, item.special])).toEqual([
      ['tomato', 35, true, false],
      ['methi', 15, false, false],
      ['गूळ', 60, true, true],
    ]);

    // Sending is remembered; a later price change asks for a resend and shows the last price
    dontLeave(share());
    await user.click(share());
    expect(screen.getByRole('status').textContent).toMatch(/^✓ आजचे भाव .+ ला पाठवले$/);
    await user.click(screen.getByRole('button', { name: 'टोमॅटो चा भाव ५ ने कमी' }));
    expect(screen.getByRole('status').textContent).toBe('भाव बदलले आहेत. पुन्हा पाठवा.');
    expect(screen.getByText('मागचा भाव ₹35')).toBeTruthy();
  });

  it('opens straight on the seller’s day once a shop exists, with items and details a tap away', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      MY_SHOP_KEY,
      JSON.stringify({ ...shop, setupDone: true, items: [{ id: 'tomato', price: 30, unit: 'kg', inStock: true }] }),
    );
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: 'भाजी भांडार' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /आज/, current: 'page' })).toBeTruthy();

    await user.click(screen.getByRole('link', { name: /वस्तू$/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'माझ्या वस्तू' })).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('टोमॅटो चे माप'), 'piece');
    await user.click(screen.getByRole('button', { name: 'कांदा जोडा' }));
    expect(JSON.parse(localStorage.getItem(MY_SHOP_KEY)).items.map((item) => [item.id, item.unit])).toEqual([
      ['tomato', 'piece'],
      ['onion', 'kg'],
    ]);

    await user.click(screen.getByRole('link', { name: /दुकान$/ }));
    expect(await screen.findByLabelText('दुकानाची वेळ')).toBeTruthy();
  });
});
