import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { decodeShop, encodeShop, todayStamp } from './lib/shop';

// Made-up test shop: the number is all zeros on purpose
const shop = {
  name: 'भाजी भांडार',
  place: 'बस स्टँडजवळ',
  whatsapp: '0000000000',
  upi: 'shop@bank',
  pickup: true,
  delivery: true,
  items: [
    { id: 'tomato', price: 30, unit: 'kg', inStock: true },
    { id: 'onion', price: 20, unit: 'kg', inStock: true },
    { id: 'methi', price: 15, unit: 'bunch', inStock: true },
    { id: 'cabbage', price: 25, unit: 'piece', inStock: false },
    { id: 'banana', price: 50, unit: 'dozen', inStock: true },
  ],
};

const openShop = (stamp = todayStamp()) => {
  window.location.hash = `#/s/${encodeShop(shop, stamp)}`;
  render(<App />);
};

const messageOf = (link) => decodeURIComponent(link.getAttribute('href').split('?text=')[1]);
// jsdom cannot open WhatsApp: stop the link, the app's own handler still runs
const dontLeave = (link) => link.addEventListener('click', (e) => e.preventDefault());

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
  it('shows the shop and its rates, with sold-out items that cannot be added', () => {
    openShop();
    expect(screen.getByRole('heading', { level: 1, name: 'भाजी भांडार' })).toBeTruthy();
    expect(screen.getByText('टोमॅटो')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'पत्ताकोबी घ्या' })).toBeNull();
    expect(screen.getByText('संपले')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('warns when the rates are from an earlier day', () => {
    openShop(20200101);
    expect(screen.getByRole('status').textContent).toContain('हे भाव जुने आहेत');
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

  it('takes an order to the shop’s WhatsApp, then offers UPI and a repeat order', async () => {
    const user = userEvent.setup();
    openShop();

    await user.click(screen.getByRole('button', { name: 'टोमॅटो घ्या' }));
    await user.click(screen.getByRole('button', { name: 'टोमॅटो वाढवा' }));
    await user.click(screen.getByRole('button', { name: 'मेथी घ्या' }));
    // 0.5 kg × ₹30 + 1 bunch × ₹15
    expect(document.querySelector('.basket-summary').textContent).toBe('2 वस्तू · ₹30');

    await user.click(screen.getByRole('button', { name: /ऑर्डर करा/ }));
    // The order can still be changed here: 2 bunches now
    await user.click(screen.getByRole('button', { name: 'मेथी वाढवा' }));

    // No name yet: the link is stopped and says why
    await user.click(screen.getByRole('link', { name: 'WhatsApp वर ऑर्डर पाठवा' }));
    expect(screen.getByRole('alert').textContent).toContain('कृपया नाव लिहा');

    await user.type(screen.getByLabelText('नाव'), 'सीमा');
    await user.click(screen.getByLabelText('घरपोच'));
    await user.type(screen.getByLabelText('पत्ता / घर कुठे आहे'), 'मंदिराजवळ');

    const send = screen.getByRole('link', { name: 'WhatsApp वर ऑर्डर पाठवा' });
    expect(send.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/910000000000\?text=/);
    const text = messageOf(send);
    expect(text).toContain('आपला बाजार · भाजी भांडार');
    expect(text).toContain('• टोमॅटो: 500 ग्रॅम = ₹15');
    expect(text).toContain('• मेथी: 2 जुडी = ₹30');
    expect(text).toContain('एकूण: ₹45');
    expect(text).toContain('नाव: सीमा');
    expect(text).toContain('घरपोच: मंदिराजवळ');

    dontLeave(send);
    await user.click(send);
    expect(await screen.findByRole('heading', { name: 'WhatsApp उघडले आहे' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'UPI ने ₹45 द्या' }).getAttribute('href')).toContain('am=45.00');

    // Back in the shop the basket is empty, and the last order can be filled again
    await user.click(screen.getByRole('button', { name: /दुकानात परत जा/ }));
    expect(document.querySelector('.basket-summary')).toBeNull();
    await user.click(screen.getByRole('button', { name: /मागची ऑर्डर पुन्हा भरा/ }));
    expect(document.querySelector('.basket-summary').textContent).toBe('2 वस्तू · ₹45');
  });

  it('keeps the basket when the page is reopened', async () => {
    const user = userEvent.setup();
    openShop();
    await user.click(screen.getByRole('button', { name: 'कांदा घ्या' }));
    cleanup();

    render(<App />);
    expect(screen.getByText('250 ग्रॅम')).toBeTruthy();
  });
});

describe('my shop', () => {
  it('says what is missing, then builds a WhatsApp message with the rates and a working link', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/my-shop';
    render(<App />);

    const share = () => screen.getByRole('link', { name: 'आजचे भाव WhatsApp वर पाठवा' });
    await user.click(share());
    expect(screen.getByRole('alert').textContent).toContain('दुकानाचे नाव लिहा');
    expect(screen.getByRole('alert').textContent).toContain('किमान एका वस्तूचा भाव भरा');

    await user.type(screen.getByLabelText('दुकानाचे नाव'), 'भाजी भांडार');
    await user.type(screen.getByLabelText(/^WhatsApp नंबर/), '0000000000');
    await user.click(screen.getByRole('button', { name: 'टोमॅटो जोडा' }));
    await user.click(screen.getByRole('button', { name: 'मेथी जोडा' }));
    await user.type(screen.getByLabelText('टोमॅटो चा भाव'), '30');
    await user.type(screen.getByLabelText('मेथी चा भाव'), '15');
    await user.click(screen.getByLabelText('मेथी उपलब्ध आहे'));

    // A name that is not in the catalogue
    await user.type(screen.getByRole('searchbox'), 'गूळ');
    await user.click(screen.getByRole('button', { name: /“गूळ” जोडा/ }));
    await user.type(screen.getByLabelText('गूळ चा भाव'), '60');

    expect(screen.queryByRole('alert')).toBeNull();
    const text = messageOf(share());
    expect(text).toContain('भाजी भांडार');
    expect(text).toContain('• टोमॅटो: ₹30 / किलो');
    expect(text).toContain('• मेथी: संपले');
    expect(text).toContain('• गूळ: ₹60 / किलो');

    const sent = decodeShop(text.match(/#\/s\/(\S+)/)[1]);
    expect(sent).toMatchObject({ name: 'भाजी भांडार', whatsapp: '910000000000', date: todayStamp() });
    expect(sent.items.map((item) => [item.id.startsWith('x') ? item.label : item.id, item.price, item.inStock])).toEqual([
      ['tomato', 30, true],
      ['methi', 15, false],
      ['गूळ', 60, true],
    ]);
  });

  it('remembers the shop on the phone', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/my-shop';
    render(<App />);
    await user.type(screen.getByLabelText('दुकानाचे नाव'), 'भाजी भांडार');
    cleanup();

    window.location.hash = '';
    render(<App />);
    expect(screen.getByRole('link', { name: 'माझे दुकान: भाजी भांडार' })).toBeTruthy();
  });
});
